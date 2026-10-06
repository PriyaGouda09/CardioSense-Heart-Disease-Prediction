"""
backend/test_oldpeak_fix.py
Verification tests for the oldpeak = 1.8 fix in CardioSense.
"""

import sys
import os
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

_BACKEND_DIR = Path(__file__).resolve().parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from llm_tools import (
    validate_clinical_inputs,
    predict_heart_disease_severity,
    CLINICAL_FIELD_METADATA,
    FIELD_ALIASES,
)
from llm_service import generate_response
from app import app


class TestOldpeakFix(unittest.TestCase):
    """Test suite verifying oldpeak handling across all layers."""

    def setUp(self):
        self.valid_patient = {
            "age": 58,
            "sex": 1,
            "cp": 3,
            "trestbps": 140,
            "chol": 240,
            "fbs": 0,
            "restecg": 0,
            "thalach": 130,
            "exang": 1,
            "oldpeak": 1.8,
            "slope": 2,
            "ca": 1,
            "thal": 3,
        }

    def test_01_oldpeak_direct_validation(self):
        """Verifies oldpeak = 1.8 directly passes validation and stays 1.8."""
        is_valid, err, sanitized = validate_clinical_inputs(self.valid_patient)
        self.assertTrue(is_valid)
        self.assertIsNone(err)
        self.assertEqual(sanitized["oldpeak"], 1.8)

    def test_02_st_depression_alias_validation(self):
        """Verifies st_depression = 1.8 is recognized as oldpeak alias."""
        patient_with_alias = dict(self.valid_patient)
        del patient_with_alias["oldpeak"]
        patient_with_alias["st_depression"] = 1.8

        is_valid, err, sanitized = validate_clinical_inputs(patient_with_alias)
        self.assertTrue(is_valid, f"Validation failed with: {err}")
        self.assertEqual(sanitized["oldpeak"], 1.8)

    def test_03_old_peak_and_stdepression_aliases(self):
        """Verifies other common aliases old_peak and stdepression."""
        for alias in ["old_peak", "stdepression", "st_dep", "exercise_st_depression"]:
            patient = dict(self.valid_patient)
            del patient["oldpeak"]
            patient[alias] = 1.8
            is_valid, err, sanitized = validate_clinical_inputs(patient)
            self.assertTrue(is_valid, f"Failed for alias: {alias}")
            self.assertEqual(sanitized["oldpeak"], 1.8)

    def test_04_predict_tool_with_oldpeak_1_8(self):
        """Verifies predict_heart_disease_severity succeeds with oldpeak=1.8."""
        result = predict_heart_disease_severity(**self.valid_patient)
        self.assertEqual(result["status"], "success")
        self.assertTrue(result["success"])
        self.assertEqual(result["patient_inputs"]["oldpeak"], 1.8)
        self.assertIn("predicted_class", result)
        self.assertIn("probabilities", result)
        self.assertIn("shap_factors", result)

    def test_05_predict_tool_with_st_depression_1_8(self):
        """Verifies predict_heart_disease_severity succeeds with st_depression=1.8."""
        patient = dict(self.valid_patient)
        del patient["oldpeak"]
        patient["st_depression"] = 1.8

        result = predict_heart_disease_severity(**patient)
        self.assertEqual(result["status"], "success")
        self.assertTrue(result["success"])
        self.assertEqual(result["patient_inputs"]["oldpeak"], 1.8)

    def test_06_missing_oldpeak_is_still_safely_rejected(self):
        """Verifies that if oldpeak/st_depression is genuinely missing, it asks the user."""
        patient = dict(self.valid_patient)
        del patient["oldpeak"]

        result = predict_heart_disease_severity(**patient)
        self.assertEqual(result["status"], "missing_inputs")
        self.assertFalse(result["success"])
        missing_fields = [f["field"] for f in result.get("missing_fields", [])]
        self.assertIn("oldpeak", missing_fields)

    def test_07_invalid_oldpeak_boundary_rejected(self):
        """Verifies that out-of-range oldpeak (e.g. 15.0 mm) is rejected."""
        patient = dict(self.valid_patient)
        patient["oldpeak"] = 15.0

        result = predict_heart_disease_severity(**patient)
        self.assertEqual(result["status"], "validation_error")
        self.assertFalse(result["success"])
        invalid_fields = [f["field"] for f in result.get("invalid_fields", [])]
        self.assertIn("oldpeak", invalid_fields)

    def test_08_patient_inputs_backfill_in_generate_response(self):
        """Verifies generate_response backfills oldpeak=1.8 from patient_inputs if LLM omits it."""
        mock_client = MagicMock()
        mock_chat = MagicMock()
        mock_client.chats.create.return_value = mock_chat

        # Mock LLM calling predict_heart_disease_severity but omitting oldpeak
        mock_initial = MagicMock()
        mock_fn_call = MagicMock()
        mock_fn_call.name = "predict_heart_disease_severity"
        # LLM omitted oldpeak from its args:
        mock_fn_call.args = {
            "age": 58, "sex": 1, "cp": 3, "trestbps": 140, "chol": 240,
            "fbs": 0, "restecg": 0, "thalach": 130, "exang": 1,
            "slope": 2, "ca": 1, "thal": 3,
        }
        mock_initial.function_calls = [mock_fn_call]
        mock_initial.text = None

        mock_follow_up = MagicMock()
        mock_follow_up.text = "Based on the CardioSense Machine Learning evaluation, patient has moderate risk."

        mock_chat.send_message.side_effect = [mock_initial, mock_follow_up]
        mock_chat.get_history.return_value = []

        response = generate_response(
            user_message="Explain heart disease severity",
            client=mock_client,
            patient_inputs=self.valid_patient,  # Provides verified oldpeak: 1.8
        )

        self.assertTrue(response["success"])
        self.assertEqual(response["status"], "success")
        self.assertIsNotNone(response["ml_prediction"])
        # Check that oldpeak reached the tool and ML result
        self.assertEqual(response["tool_result"]["patient_inputs"]["oldpeak"], 1.8)

    def test_09_flask_endpoint_with_patient_inputs(self):
        """Verifies POST /api/chat-predict accepts patientInputs and passes them safely."""
        with app.test_client() as client:
            with patch("llm_service.generate_response") as mock_gen:
                mock_gen.return_value = {
                    "success": True,
                    "status": "success",
                    "explanation": "Verified clinical explanation with oldpeak = 1.8 mm.",
                    "ml_prediction": {"predictedClass": 2, "probabilities": [0.05, 0.2, 0.65, 0.08, 0.02]},
                    "tool_called": True,
                    "tool_status": "success",
                    "tool_result": {"status": "success"},
                    "disclaimer": "Educational AI tool.",
                    "conversation_history": [],
                }

                payload = {
                    "message": "Please evaluate: ST depression (oldpeak): 1.8 mm",
                    "patientInputs": self.valid_patient,
                }
                res = client.post("/api/chat-predict", json=payload)
                self.assertEqual(res.status_code, 200)
                data = res.get_json()
                self.assertTrue(data["success"])
                self.assertEqual(data["ml_prediction"]["predictedClass"], 2)
                # Verify generate_response was called with patient_inputs
                mock_gen.assert_called_once()
                call_kwargs = mock_gen.call_args[1]
                self.assertEqual(call_kwargs["patient_inputs"]["oldpeak"], 1.8)


if __name__ == "__main__":
    unittest.main()
