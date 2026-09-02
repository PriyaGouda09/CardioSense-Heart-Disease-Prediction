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
