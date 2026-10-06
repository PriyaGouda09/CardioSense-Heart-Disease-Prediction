"""
backend/test_llm_service.py
Comprehensive test suite for CardioSense Google Gemini LLM Service.

Verifies all 7 required scenarios:
1. Gemini service initialization and API key configuration check.
2. General questions do not invoke the ML prediction tool.
3. Prediction requests trigger the Python ML prediction tool.
4. Missing clinical values result in requests for missing data (no silent predictions).
5. Medically invalid inputs are rejected and handled.
6. Valid inputs return both the intact ML prediction and separate LLM explanation.
7. External API errors are caught and handled gracefully.

Uses mocked Gemini chat objects so tests run deterministically without live API calls.
"""

import os
import sys
import unittest
from unittest.mock import MagicMock
from pathlib import Path

# Ensure backend directory is in sys.path
_BACKEND_DIR = Path(__file__).resolve().parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from google.genai import types
import llm_service
from llm_service import (
    generate_response,
    is_gemini_configured,
    get_gemini_client,
    SYSTEM_INSTRUCTION,
    DISCLAIMER_TEXT,
)


class TestCardioSenseLLMService(unittest.TestCase):
    """Test suite covering all Gemini service and tool-calling behaviors."""

    def setUp(self):
        self.valid_patient = {
            "age": 58,
            "sex": 1,
            "cp": 2,
            "trestbps": 148,
            "chol": 265,
            "fbs": 0,
            "restecg": 1,
            "thalach": 138,
            "exang": 1,
            "oldpeak": 1.8,
            "slope": 1,
            "ca": 1,
            "thal": 2,
        }

    # -------------------------------------------------------------------------
    # TEST 1: Initialization & API Key Check
    # -------------------------------------------------------------------------
    def test_01_initialization_and_key_handling(self):
        """Verifies behavior when API key is missing vs configured."""
        # When key is missing / placeholder
        original_env = os.environ.get("GEMINI_API_KEY")
        try:
            os.environ["GEMINI_API_KEY"] = ""
            self.assertFalse(is_gemini_configured())

            # Attempting request without key returns clear setup instruction
            res = generate_response("Hello")
            self.assertFalse(res["success"])
            self.assertEqual(res["status"], "api_key_missing")
            self.assertIn("Google Gemini API key is not configured", res["explanation"])
            self.assertIn("https://aistudio.google.com", res["explanation"])
            self.assertIsNone(res["ml_prediction"])

            # When key is present, get_gemini_client instantiates Client
            os.environ["GEMINI_API_KEY"] = "fake_test_key_for_unit_tests"
            self.assertTrue(is_gemini_configured())
            client = get_gemini_client()
            self.assertIsNotNone(client)
        finally:
            if original_env is not None:
                os.environ["GEMINI_API_KEY"] = original_env
            else:
                os.environ.pop("GEMINI_API_KEY", None)

    # -------------------------------------------------------------------------
    # TEST 2: General Question (No Tool Call)
    # -------------------------------------------------------------------------
    def test_02_general_question_does_not_call_tool(self):
        """Verifies general inquiries do not call the ML prediction tool."""
        mock_client = MagicMock()
        mock_chat = MagicMock()
        mock_client.chats.create.return_value = mock_chat

        # Mock Gemini response with text only (no function calls)
        mock_resp = types.GenerateContentResponse(
            candidates=[
                types.Candidate(
                    content=types.Content(
                        role="model",
                        parts=[types.Part.from_text(
                            text="CardioSense is an AI-powered system that uses Machine Learning "
                                 "to evaluate cardiovascular severity across 5 clinical stages."
                        )]
                    )
                )
            ]
        )
        mock_chat.send_message.return_value = mock_resp
        mock_chat.get_history.return_value = [
            types.Content(role="user", parts=[types.Part.from_text(text="What is CardioSense?")]),
            types.Content(role="model", parts=[types.Part.from_text(text=mock_resp.text)]),
        ]

        result = generate_response(
            user_message="What is CardioSense?",
            client=mock_client,
        )

        self.assertTrue(result["success"])
        self.assertFalse(result["tool_called"])
        self.assertEqual(result["tool_status"], "none")
        self.assertIsNone(result["ml_prediction"])
        self.assertIn("CardioSense is an AI-powered system", result["explanation"])
        self.assertEqual(mock_chat.send_message.call_count, 1)

    # -------------------------------------------------------------------------
    # TEST 3 & 6: Prediction Request Triggers Tool, Returns ML Output + LLM Text
    # -------------------------------------------------------------------------
    def test_03_and_06_prediction_triggers_tool_and_preserves_ml_output(self):
        """
        Verifies that a prediction request:
        1. Triggers the Python prediction tool.
        2. Executes the existing ML model and SHAP calculation.
        3. Returns the original ML output intact in a separate field.
        4. Provides a separate plain-language LLM explanation.
        """
        mock_client = MagicMock()
        mock_chat = MagicMock()
        mock_client.chats.create.return_value = mock_chat

        # First response from Gemini: requests tool call
        fc_part = types.Part(
            function_call=types.FunctionCall(
                name="predict_heart_disease_severity",
                args=self.valid_patient,
            )
        )
        mock_resp_1 = types.GenerateContentResponse(
            candidates=[
                types.Candidate(
                    content=types.Content(role="model", parts=[fc_part])
                )
            ]
        )

        # Second response from Gemini: explains the ML output
        mock_resp_2 = types.GenerateContentResponse(
            candidates=[
                types.Candidate(
                    content=types.Content(
                        role="model",
                        parts=[types.Part.from_text(
                            text="Based on your clinical markers, the CardioSense Random Forest model "
                                 "indicates a pattern consistent with Moderate severity (Class 2, 43% probability). "
                                 "The primary contributing factors were your elevated resting blood pressure and age, "
                                 "while optimal cholesterol was a protective indicator."
                        )]
                    )
                )
            ]
        )

        mock_chat.send_message.side_effect = [mock_resp_1, mock_resp_2]
        mock_chat.get_history.return_value = []

        result = generate_response(
            user_message="Please analyze my patient values: age 58, BP 148, chol 265...",
            client=mock_client,
        )

        self.assertTrue(result["success"])
        self.assertTrue(result["tool_called"])
        self.assertEqual(result["tool_status"], "success")

        # Verify the original ML output is completely preserved
        self.assertIsNotNone(result["ml_prediction"])
        ml = result["ml_prediction"]
        self.assertEqual(ml["predictedClass"], 2)
        self.assertEqual(ml["modelUsed"], "Random Forest")
        self.assertEqual(len(ml["probabilities"]), 5)
        self.assertIn("shapFactors", ml)
        self.assertIn("patientInputs", ml)
        self.assertIn("distribution", ml)

        # Verify the LLM explanation is separate from the ML prediction
        self.assertIn("moderate severity", result["explanation"].lower())
        self.assertIn("CardioSense is an AI-powered educational", result["disclaimer"])
        self.assertEqual(mock_chat.send_message.call_count, 2)


    # -------------------------------------------------------------------------
    # TEST 4: Missing Inputs Handled Correctly (No Silent Predictions)
    # -------------------------------------------------------------------------
    def test_04_missing_inputs_prompts_user_without_predicting(self):
        """
        Verifies that when required clinical inputs are missing:
        1. Tool returns status: missing_inputs.
        2. No ML prediction is generated.
        3. Gemini asks the user for the missing values.
        """
        mock_client = MagicMock()
        mock_chat = MagicMock()
        mock_client.chats.create.return_value = mock_chat

        # Gemini requests tool with only partial information
        partial_inputs = {"age": 58, "trestbps": 148, "sex": 1}
        fc_part = types.Part(
            function_call=types.FunctionCall(
                name="predict_heart_disease_severity",
                args=partial_inputs,
            )
        )
        mock_resp_1 = types.GenerateContentResponse(
            candidates=[types.Candidate(content=types.Content(role="model", parts=[fc_part]))]
        )

        mock_resp_2 = types.GenerateContentResponse(
            candidates=[
                types.Candidate(
                    content=types.Content(
                        role="model",
                        parts=[types.Part.from_text(
                            text="I have noted your age (58) and resting blood pressure (148 mmHg). "
                                 "To generate an accurate heart disease severity assessment, I still need "
                                 "your cholesterol level, peak heart rate, and ST depression results."
                        )]
                    )
                )
            ]
        )

        mock_chat.send_message.side_effect = [mock_resp_1, mock_resp_2]
        mock_chat.get_history.return_value = []

        result = generate_response(
            user_message="I am 58 and my BP is 148. Predict my risk.",
            client=mock_client,
        )

        self.assertTrue(result["success"])
        self.assertTrue(result["tool_called"])
        self.assertEqual(result["tool_status"], "missing_inputs")
        # Critical safety check: ML prediction must NOT be generated for incomplete inputs
        self.assertIsNone(result["ml_prediction"])
        self.assertIsNotNone(result["tool_result"])
        self.assertIn("missing_fields", result["tool_result"])
        self.assertIn("still need your cholesterol", result["explanation"].lower())

    # -------------------------------------------------------------------------
    # TEST 5: Invalid Values Handled Correctly
    # -------------------------------------------------------------------------
    def test_05_invalid_values_handled(self):
        """Verifies that out-of-range clinical inputs are flagged and rejected."""
        mock_client = MagicMock()
        mock_chat = MagicMock()
        mock_client.chats.create.return_value = mock_chat

        invalid_patient = dict(self.valid_patient)
        invalid_patient["trestbps"] = 999  # Impossible blood pressure

        fc_part = types.Part(
            function_call=types.FunctionCall(
                name="predict_heart_disease_severity",
                args=invalid_patient,
            )
        )
        mock_resp_1 = types.GenerateContentResponse(
            candidates=[types.Candidate(content=types.Content(role="model", parts=[fc_part]))]
        )

        mock_resp_2 = types.GenerateContentResponse(
            candidates=[
                types.Candidate(
                    content=types.Content(
                        role="model",
                        parts=[types.Part.from_text(
                            text="The resting blood pressure of 999 mmHg is outside plausible medical limits (60-220 mmHg). "
                                 "Please verify and correct this measurement."
                        )]
                    )
                )
            ]
        )

        mock_chat.send_message.side_effect = [mock_resp_1, mock_resp_2]
        mock_chat.get_history.return_value = []

        result = generate_response(
            user_message="Analyze: BP 999 mmHg...",
            client=mock_client,
        )

        self.assertTrue(result["success"])
        self.assertTrue(result["tool_called"])
        self.assertEqual(result["tool_status"], "validation_error")
        self.assertIsNone(result["ml_prediction"])
        self.assertIn("outside plausible medical limits", result["explanation"])

    # -------------------------------------------------------------------------
    # TEST 7: Graceful API Error Handling
    # -------------------------------------------------------------------------
    def test_07_api_failure_handled_gracefully(self):
        """Verifies API connection or quota errors do not crash the service."""
        mock_client = MagicMock()
        mock_client.chats.create.side_effect = RuntimeError("Simulated Gemini API service unavailable (503)")

        result = generate_response(
            user_message="Hello",
            client=mock_client,
        )

        self.assertFalse(result["success"])
        self.assertEqual(result["status"], "error")
        self.assertIn("error occurred while communicating with the AI service", result["explanation"])
        self.assertIn("503", result["error_details"])
        self.assertIsNone(result["ml_prediction"])

    # -------------------------------------------------------------------------
    # TEST 8: Gemini 503 High Demand Returned as 'service_unavailable'
    # -------------------------------------------------------------------------
    def test_08_gemini_high_demand_returns_service_unavailable(self):
        """Verifies Gemini 503 high demand errors return status 'service_unavailable'."""
        mock_client = MagicMock()
        mock_client.chats.create.side_effect = RuntimeError(
            '503 UNAVAILABLE "This model is currently experiencing high demand. '
            'Spikes in demand are usually temporary. Please try again later."'
        )

        result = generate_response(
            user_message="Hello",
            client=mock_client,
        )

        self.assertFalse(result["success"])
        self.assertEqual(result["status"], "service_unavailable")
        self.assertIn("high demand", result["explanation"].lower())
        self.assertIsNone(result["ml_prediction"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
