"""
backend/test_api.py
API integration tests for CardioSense Flask ML Backend.

Verifies:
1. Valid user message successfully reaches the Gemini service (/api/chat-predict).
2. Empty or missing message is rejected with HTTP 400.
3. Invalid or non-JSON payloads return HTTP 400.
4. Successful clinical prediction returns both the preserved ML result and LLM explanation.
5. Incomplete clinical inputs return missing_inputs status without generating a prediction.
6. Gemini service/API failures are handled gracefully with HTTP 500.
7. Existing ML endpoint (/api/predict) remains fully functional and untouched.
8. API catalog (GET /) and health check (GET /api/health) operate correctly.
"""

import os
import sys
import json
import unittest
from unittest.mock import patch, MagicMock
from pathlib import Path

# Ensure backend directory is in sys.path
_BACKEND_DIR = Path(__file__).resolve().parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from app import app


class TestCardioSenseAPI(unittest.TestCase):
    """Test suite covering Flask endpoints, focusing on /api/chat-predict and existing /api/predict."""

    def setUp(self):
        self.client = app.test_client()
        self.valid_patient = {
            "age": 58,
            "sex": 1,
            "cp": 2,
            "trestbps": 148,
            "chol": 265,
            "fbs": "0",
            "restecg": "1",
            "thalach": 138,
            "exang": 1,
            "oldpeak": "1.8",
            "slope": "1",
            "ca": "1",
            "thal": "2",
        }

    # -------------------------------------------------------------------------
    # TEST 1: Valid General Message Reaches Gemini Service
    # -------------------------------------------------------------------------
    @patch("llm_service.generate_response")
    def test_01_valid_message_reaches_gemini_service(self, mock_generate):
        """Verifies general inquiries pass to Gemini and return HTTP 200 with text."""
        mock_generate.return_value = {
            "success": True,
            "status": "success",
            "explanation": "CardioSense is an Explainable Heart Disease Severity Prediction System.",
            "ml_prediction": None,
            "tool_called": False,
            "tool_status": "none",
            "tool_result": None,
            "disclaimer": "CardioSense is an educational tool.",
            "conversation_history": [
                {"role": "user", "content": "What is CardioSense?"},
                {"role": "model", "content": "CardioSense is an Explainable Heart Disease Severity Prediction System."}
            ],
        }

        response = self.client.post(
            "/api/chat-predict",
            data=json.dumps({"message": "What is CardioSense?"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertIn("Explainable Heart Disease", data["explanation"])
        self.assertIsNone(data["ml_prediction"])
        self.assertFalse(data["tool_called"])
        self.assertEqual(data["tool_status"], "none")
        self.assertIsNone(data["error"])

    # -------------------------------------------------------------------------
    # TEST 2: Missing or Empty Message Rejected (HTTP 400)
    # -------------------------------------------------------------------------
    def test_02_empty_or_missing_message_rejected(self):
        """Verifies 400 Bad Request on missing, empty, or non-string message."""
        # 1. Missing message field
        res1 = self.client.post(
            "/api/chat-predict",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(res1.status_code, 400)
        self.assertFalse(res1.get_json()["success"])
        self.assertEqual(res1.get_json()["status"], "missing_message")

        # 2. Empty string message
        res2 = self.client.post(
            "/api/chat-predict",
            data=json.dumps({"message": ""}),
            content_type="application/json",
        )
        self.assertEqual(res2.status_code, 400)
        self.assertFalse(res2.get_json()["success"])
        self.assertEqual(res2.get_json()["status"], "empty_message")

        # 3. Whitespace-only message
        res3 = self.client.post(
            "/api/chat-predict",
            data=json.dumps({"message": "    \t\n  "}),
            content_type="application/json",
        )
        self.assertEqual(res3.status_code, 400)
        self.assertEqual(res3.get_json()["status"], "empty_message")

        # 4. Non-string message (e.g. integer or list)
        res4 = self.client.post(
            "/api/chat-predict",
            data=json.dumps({"message": 12345}),
            content_type="application/json",
        )
        self.assertEqual(res4.status_code, 400)
        self.assertEqual(res4.get_json()["status"], "invalid_message")

    # -------------------------------------------------------------------------
    # TEST 3: Invalid JSON Handled Correctly (HTTP 400)
    # -------------------------------------------------------------------------
    def test_03_invalid_json_handled(self):
        """Verifies 400 Bad Request on malformed JSON or non-JSON payloads."""
        # 1. Content-Type not application/json
        res1 = self.client.post(
            "/api/chat-predict",
            data="message=hello",
            content_type="application/x-www-form-urlencoded",
        )
        self.assertEqual(res1.status_code, 400)
        self.assertEqual(res1.get_json()["status"], "invalid_request")

        # 2. Malformed JSON syntax
        res2 = self.client.post(
            "/api/chat-predict",
            data='{"message": "broken json without closing brace',
            content_type="application/json",
        )
        self.assertEqual(res2.status_code, 400)
        self.assertEqual(res2.get_json()["status"], "invalid_json")

    # -------------------------------------------------------------------------
    # TEST 4: Successful Prediction Returns ML Result and LLM Explanation
    # -------------------------------------------------------------------------
    @patch("llm_service.generate_response")
    def test_04_successful_prediction_returns_ml_and_explanation(self, mock_generate):
        """
        Verifies that when a prediction is made:
        1. Both ml_prediction and explanation are returned.
        2. The ML prediction dictionary matches the Random Forest output structure.
        """
        fake_ml_result = {
            "id": "cs-test-123",
            "predictedClass": 2,
            "probabilities": [10, 20, 45, 15, 10],
            "distribution": [{"classId": 2, "name": "Class 2 (Moderate)", "prob": 45, "isTop": True}],
            "shapFactors": [{"feature": "Resting Blood Pressure", "valueText": "148 mmHg", "shap": 0.28}],
            "patientInputs": {"age": 58, "trestbps": 148, "chol": 265},
            "modelUsed": "Random Forest",
        }

        mock_generate.return_value = {
            "success": True,
            "status": "success",
            "explanation": "Your indicators align with Moderate Severity (Class 2, 45% probability).",
            "ml_prediction": fake_ml_result,
            "tool_called": True,
            "tool_status": "success",
            "tool_result": {"status": "success", "raw_ml_result": fake_ml_result},
            "disclaimer": "CardioSense is an educational tool.",
            "conversation_history": [],
        }

        response = self.client.post(
            "/api/chat-predict",
            data=json.dumps({"message": "Please evaluate this clinical profile..."}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertTrue(data["tool_called"])
        self.assertEqual(data["tool_status"], "success")

        # ML prediction must be intact
        self.assertIsNotNone(data["ml_prediction"])
        self.assertEqual(data["ml_prediction"]["predictedClass"], 2)
        self.assertEqual(data["ml_prediction"]["modelUsed"], "Random Forest")
        self.assertEqual(len(data["ml_prediction"]["probabilities"]), 5)

        # Explanation must be present and distinct
        self.assertIn("Moderate Severity", data["explanation"])
        self.assertIsNone(data["error"])

    # -------------------------------------------------------------------------
    # TEST 5: Missing Clinical Inputs Handled Correctly
    # -------------------------------------------------------------------------
    @patch("llm_service.generate_response")
    def test_05_missing_clinical_inputs_handled(self, mock_generate):
        """Verifies that missing clinical data prompts the user without generating an ML prediction."""
        mock_generate.return_value = {
            "success": True,
            "status": "missing_inputs",
            "explanation": "To assess your cardiovascular risk, I still need your cholesterol and ECG values.",
            "ml_prediction": None,
            "tool_called": True,
            "tool_status": "missing_inputs",
            "tool_result": {
                "status": "missing_inputs",
                "missing_fields": [{"field": "chol"}, {"field": "restecg"}]
            },
            "disclaimer": "CardioSense is an educational tool.",
            "conversation_history": [],
        }

        response = self.client.post(
            "/api/chat-predict",
            data=json.dumps({"message": "My blood pressure is 148."}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["status"], "missing_inputs")
        self.assertIsNone(data["ml_prediction"])
        self.assertTrue(data["tool_called"])
        self.assertIn("still need your cholesterol", data["explanation"])

    # -------------------------------------------------------------------------
    # TEST 6: Gemini API Failures Handled Gracefully (HTTP 500)
    # -------------------------------------------------------------------------
    @patch("llm_service.generate_response")
    def test_06_gemini_api_failures_handled_gracefully(self, mock_generate):
        """Verifies HTTP 500 with user-friendly error when the LLM service fails."""
        mock_generate.return_value = {
            "success": False,
            "status": "error",
            "explanation": "An unexpected error occurred while communicating with the AI service.",
            "ml_prediction": None,
            "tool_called": False,
            "tool_status": "error",
            "tool_result": None,
            "disclaimer": "CardioSense is an educational tool.",
            "conversation_history": [],
            "error_details": "Simulated rate limit exceeded or connection failure.",
        }

        response = self.client.post(
            "/api/chat-predict",
            data=json.dumps({"message": "Hello"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 500)
        data = response.get_json()
        self.assertFalse(data["success"])
        self.assertEqual(data["status"], "error")
        self.assertIn("error occurred while communicating", data["explanation"])
        self.assertIn("Simulated rate limit", data["error"])

    # -------------------------------------------------------------------------
    # TEST 7: Existing /api/predict Endpoint Remains Functional
    # -------------------------------------------------------------------------
    def test_07_existing_predict_endpoint_remains_functional(self):
        """
        CRITICAL RULE: The existing /api/predict endpoint must remain 100% functional.
        Executes real inference through the loaded Random Forest model.
        """
        response = self.client.post(
            "/api/predict",
            data=json.dumps({
                "formData": self.valid_patient,
                "modelName": "Random Forest",
                "applyThresholds": True,
            }),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertIn("data", data)
        result = data["data"]

        # Verify exact fields required by React ResultsPage
        self.assertIn("predictedClass", result)
        self.assertIn("probabilities", result)
        self.assertIn("distribution", result)
        self.assertIn("shapFactors", result)
        self.assertIn("patientInputs", result)
        self.assertEqual(result["modelUsed"], "Random Forest")
        self.assertEqual(len(result["probabilities"]), 5)
        self.assertEqual(sum(result["probabilities"]), 100)
        self.assertGreater(len(result["shapFactors"]), 0)

    # -------------------------------------------------------------------------
    # TEST 8: Index and Health Endpoints
    # -------------------------------------------------------------------------
    def test_08_index_and_health_endpoints(self):
        """Verifies GET / catalog includes /api/chat-predict and /api/health is healthy."""
        # Index catalog
        index_res = self.client.get("/")
        self.assertEqual(index_res.status_code, 200)
        index_data = index_res.get_json()
        self.assertIn("/api/chat-predict", index_data["endpoints"])
        self.assertIn("/api/predict", index_data["endpoints"])

        # Health endpoint
        health_res = self.client.get("/api/health")
        self.assertEqual(health_res.status_code, 200)
        health_data = health_res.get_json()
        self.assertEqual(health_data["status"], "healthy")
        self.assertTrue(health_data["shap_enabled"])

    # -------------------------------------------------------------------------
    # TEST 9: Gemini Service Unavailable Handled With HTTP 503
    # -------------------------------------------------------------------------
    @patch("llm_service.generate_response")
    def test_09_gemini_service_unavailable_returns_503(self, mock_generate):
        """Verifies HTTP 503 with user-friendly error when Gemini experiences high demand."""
        mock_generate.return_value = {
            "success": False,
            "status": "service_unavailable",
            "explanation": "The Google Gemini model is currently experiencing high demand.",
            "ml_prediction": None,
            "tool_called": False,
            "tool_status": "error",
            "tool_result": None,
            "disclaimer": "CardioSense is an educational tool.",
            "conversation_history": [],
            "error_details": "503 UNAVAILABLE Model experiencing high demand.",
        }

        response = self.client.post(
            "/api/chat-predict",
            data=json.dumps({"message": "Hello"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 503)
        data = response.get_json()
        self.assertFalse(data["success"])
        self.assertEqual(data["status"], "service_unavailable")
        self.assertIn("high demand", data["explanation"].lower())


if __name__ == "__main__":
    unittest.main(verbosity=2)
