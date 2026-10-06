import os
import sys
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from ml_engine import MLEngine, POPULATION_DEFAULTS, SEVERITY_CLASSES_INFO, CLASS_NAMES

# Initialize logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("cardiosense_backend")

# Create Flask application
app = Flask(__name__)
# Enable CORS for React frontend (localhost:5173, localhost:3000, 127.0.0.1:*)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Singleton ML Engine instance
ml_engine = None

def get_engine():
    global ml_engine
    if ml_engine is None:
        logger.info("Initializing Machine Learning Engine...")
        ml_engine = MLEngine()
        logger.info("ML Engine successfully initialized.")
    return ml_engine

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "name": "CardioSense ML Backend API",
        "version": "2.0.0",
        "status": "online",
        "endpoints": [
            "/api/health",
            "/api/predict",
            "/api/chat-predict",
            "/api/models",
            "/api/sample-cases",
            "/api/dataset-stats",
        ]
    })


@app.route("/api/health", methods=["GET"])
def health_check():
    try:
        engine = get_engine()
        return jsonify({
            "status": "healthy",
            "model_engine": "online",
            "dataset_loaded": engine.dataset_info.get("total_samples", 0) > 0,
            "dataset_samples": engine.dataset_info.get("total_samples", 0),
            "available_models": list(engine.fitted_models.keys()) + ["Ensemble"],
            "clinical_thresholds": engine.best_thresholds,
            "shap_enabled": engine.explainer is not None,
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        payload = request.get_json(force=True) or {}
        
        # Accept either nested formData or top-level fields
        form_data = payload.get("formData", payload)
        model_name = payload.get("modelName", "Random Forest")
        apply_thresholds = payload.get("applyThresholds", True)

        logger.info(f"Received prediction request using model: {model_name}, apply_thresholds: {apply_thresholds}")

        engine = get_engine()
        result = engine.predict(
            form_data=form_data,
            model_name=model_name,
            apply_thresholds=apply_thresholds
        )

        return jsonify({
            "success": True,
            "data": result
        }), 200

    except Exception as e:
        logger.exception(f"Error during prediction: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/chat-predict", methods=["POST"])
def chat_predict():
    """
    Connects the Google Gemini clinical explanation service with the ML model via tool calling.

    Accepts JSON body:
      - message (str, required): The patient's query or clinical details.
      - conversationHistory / conversation_history (list, optional): Previous messages.
      - modelName (str, optional): Gemini model override.

    Returns JSON:
      - success (bool)
      - explanation (str)
      - ml_prediction (dict or None)
      - status (str)
      - error (str or None)
      - tool_called (bool)
      - tool_status (str)
      - disclaimer (str)
      - conversation_history (list)
    """
    try:
        # 1. Validate that the request has JSON content
        if not request.is_json:
            return jsonify({
                "success": False,
                "status": "invalid_request",
                "explanation": "",
                "ml_prediction": None,
                "error": "Request body must be valid JSON with 'Content-Type: application/json'.",
            }), 400

        try:
            payload = request.get_json(silent=True)
            if payload is None:
                return jsonify({
                    "success": False,
                    "status": "invalid_json",
                    "explanation": "",
                    "ml_prediction": None,
                    "error": "Malformed or empty JSON payload in request.",
                }), 400
        except Exception:
            return jsonify({
                "success": False,
                "status": "invalid_json",
                "explanation": "",
                "ml_prediction": None,
                "error": "Malformed JSON payload in request.",
            }), 400

        if not isinstance(payload, dict):
            return jsonify({
                "success": False,
                "status": "invalid_request",
                "explanation": "",
                "ml_prediction": None,
                "error": "JSON payload must be an object.",
            }), 400

        # 2. Extract and validate 'message'
        message = payload.get("message")
        if message is None:
            return jsonify({
                "success": False,
                "status": "missing_message",
                "explanation": "",
                "ml_prediction": None,
                "error": "'message' field is required in the request body.",
            }), 400

        if not isinstance(message, str):
            return jsonify({
                "success": False,
                "status": "invalid_message",
                "explanation": "",
                "ml_prediction": None,
                "error": "'message' must be a string.",
            }), 400

        clean_message = message.strip()
        if not clean_message:
            return jsonify({
                "success": False,
                "status": "empty_message",
                "explanation": "",
                "ml_prediction": None,
                "error": "'message' cannot be empty or blank.",
            }), 400

        # 3. Extract optional conversation history
        history = payload.get("conversationHistory") or payload.get("conversation_history") or []
        if not isinstance(history, list):
            history = []

        model_name = payload.get("modelName")
        patient_inputs = payload.get("patientInputs") or payload.get("patient_inputs")
        if not isinstance(patient_inputs, dict):
            patient_inputs = None

        # 4. Lazy-import LLM service and register singleton ML engine
        from llm_service import generate_response
        from llm_tools import set_ml_engine
        set_ml_engine(get_engine())

        logger.info(f"Received chat-predict message ({len(clean_message)} chars). History length: {len(history)}")

        # 5. Execute Gemini tool-calling pipeline
        response_data = generate_response(
            user_message=clean_message,
            conversation_history=history,
            model_name=model_name,
            patient_inputs=patient_inputs,
        )

        # 6. Map status codes appropriately
        status = response_data.get("status", "success")
        from llm_service import _sanitize_error_message

        error_msg = _sanitize_error_message(
            response_data.get("error_details") or response_data.get("explanation") or ""
        )
        explanation_msg = _sanitize_error_message(
            response_data.get("explanation", "")
        )

        if status in ("api_key_missing", "api_key_invalid"):
            return jsonify({
                "success": False,
                "status": "api_key_missing",
                "explanation": explanation_msg,
                "ml_prediction": None,
                "tool_called": False,
                "tool_status": "none",
                "error": error_msg or "Gemini API key is not configured or invalid.",
                "disclaimer": response_data.get("disclaimer"),
                "conversation_history": history,
            }), 503

        if status == "service_unavailable":
            return jsonify({
                "success": False,
                "status": "service_unavailable",
                "explanation": explanation_msg,
                "ml_prediction": None,
                "tool_called": response_data.get("tool_called", False),
                "tool_status": response_data.get("tool_status", "error"),
                "error": error_msg or "The Gemini model is temporarily experiencing high demand. Please try again later.",
                "disclaimer": response_data.get("disclaimer"),
                "conversation_history": history,
            }), 503

        if status == "rate_limit_exceeded":
            return jsonify({
                "success": False,
                "status": "rate_limit_exceeded",
                "explanation": explanation_msg,
                "ml_prediction": None,
                "tool_called": response_data.get("tool_called", False),
                "tool_status": response_data.get("tool_status", "error"),
                "error": error_msg or "The Gemini API request rate limit has been exceeded.",
                "disclaimer": response_data.get("disclaimer"),
                "conversation_history": history,
            }), 429

        if not response_data.get("success", False) and status == "error":
            return jsonify({
                "success": False,
                "status": "error",
                "explanation": explanation_msg,
                "ml_prediction": None,
                "tool_called": response_data.get("tool_called", False),
                "tool_status": response_data.get("tool_status", "error"),
                "error": error_msg or explanation_msg,
                "disclaimer": response_data.get("disclaimer"),
                "conversation_history": history,
            }), 500

        # 7. Success response (including missing_inputs or validation_error conversational guidance)
        return jsonify({
            "success": True,
            "status": status,
            "explanation": response_data.get("explanation", ""),
            "ml_prediction": response_data.get("ml_prediction"),
            "tool_called": response_data.get("tool_called", False),
            "tool_status": response_data.get("tool_status", "none"),
            "tool_result": response_data.get("tool_result"),
            "error": None,
            "disclaimer": response_data.get("disclaimer"),
            "conversation_history": response_data.get("conversation_history", []),
        }), 200

    except Exception as e:
        logger.exception(f"Unexpected error in /api/chat-predict: {e}")
        return jsonify({
            "success": False,
            "status": "internal_error",
            "explanation": "An unexpected backend error occurred.",
            "ml_prediction": None,
            "error": str(e),
        }), 500

@app.route("/api/models", methods=["GET"])

def get_models():
    try:
        engine = get_engine()
        benchmarks = engine.get_model_benchmarks()
        return jsonify({
            "success": True,
            "data": benchmarks
        }), 200
    except Exception as e:
        logger.exception(f"Error fetching model benchmarks: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/sample-cases", methods=["GET"])
def get_sample_cases():
    samples = {
        "moderate": {
            "title": "Moderate Risk Profile (Clinical Preset)",
            "description": "58 yo male with non-anginal discomfort, elevated BP (148 mmHg) and ST-T abnormality",
            "inputs": {
                "age": 58,
                "sex": 1,
                "cp": 2,
                "exang": 1,
                "fbs": "0",
                "trestbps": 148,
                "chol": 265,
                "thalach": 138,
                "restecg": "1",
                "oldpeak": "1.8",
                "slope": "1",
                "ca": "1",
                "thal": "2",
            }
        },
        "healthy": {
            "title": "Optimal Baseline Profile",
            "description": "38 yo female with optimal vitals, high peak heart rate, and clear ECG profile",
            "inputs": {
                "age": 38,
                "sex": 0,
                "cp": 0,
                "exang": 0,
                "fbs": "0",
                "trestbps": 115,
                "chol": 175,
                "thalach": 168,
                "restecg": "0",
                "oldpeak": "0.2",
                "slope": "0",
                "ca": "0",
                "thal": "1",
            }
        },
        "severe": {
            "title": "Complex Severity Profile",
            "description": "67 yo male with asymptomatic presentation, elevated fasting glucose, and marked ST depression",
            "inputs": {
                "age": 67,
                "sex": 1,
                "cp": 3,
                "exang": 1,
                "fbs": "1",
                "trestbps": 165,
                "chol": 290,
                "thalach": 118,
                "restecg": "2",
                "oldpeak": "2.8",
                "slope": "2",
                "ca": "2",
                "thal": "3",
            }
        }
    }
    return jsonify({
        "success": True,
        "data": samples
    }), 200

@app.route("/api/dataset-stats", methods=["GET"])
def get_dataset_stats():
    try:
        engine = get_engine()
        return jsonify({
            "success": True,
            "data": engine.dataset_info
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting Flask ML Backend on http://127.0.0.1:{port}")
    # Pre-train ML engine on startup
    get_engine()
    app.run(host="0.0.0.0", port=port, debug=False)
