"""
backend/llm_tools.py
CardioSense: Large Language Model (LLM) Tool Interface.

This module provides a validated Python tool wrapper that allows frontier LLMs
(such as Google Gemini) to invoke the existing CardioSense Machine Learning Engine
without retraining models, changing prediction logic, or creating circular imports.
"""

import os
import sys
from typing import Dict, Any, Optional, List, Tuple

# Ensure backend directory is in sys.path
_BACKEND_DIR = os.path.abspath(os.path.dirname(__file__))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

# Clinical metadata and validation boundaries
CLINICAL_FIELD_METADATA = {
    "age": {
        "label": "Age",
        "type": "numeric",
        "min": 20.0,
        "max": 100.0,
        "unit": "years",
        "prompt": "Patient age in years (valid range: 20 to 100).",
    },
    "sex": {
        "label": "Biological Sex",
        "type": "categorical",
        "options": ["1 (Male)", "0 (Female)"],
        "prompt": "Biological sex (1 for Male, 0 for Female).",
    },
    "cp": {
        "label": "Chest Discomfort Pattern",
        "type": "categorical",
        "options": [
            "0: typical angina",
            "1: atypical angina",
            "2: non-anginal",
            "3: asymptomatic",
        ],
        "prompt": "Chest pain type (0: typical angina, 1: atypical angina, 2: non-anginal pain, 3: asymptomatic).",
    },
    "trestbps": {
        "label": "Resting Blood Pressure",
        "type": "numeric",
        "min": 60.0,
        "max": 220.0,
        "unit": "mmHg",
        "prompt": "Resting systolic blood pressure (valid range: 60 to 220 mmHg).",
    },
    "chol": {
        "label": "Serum Cholesterol",
        "type": "numeric",
        "min": 100.0,
        "max": 600.0,
        "unit": "mg/dl",
        "prompt": "Total serum cholesterol level (valid range: 100 to 600 mg/dl).",
    },
    "fbs": {
        "label": "Fasting Blood Sugar",
        "type": "binary",
        "options": ["1 (> 120 mg/dl)", "0 (<= 120 mg/dl)"],
        "prompt": "Fasting blood sugar > 120 mg/dl (1 for True, 0 for False).",
    },
    "restecg": {
        "label": "Resting ECG Results",
        "type": "categorical",
        "options": [
            "0: normal",
            "1: ST-T wave abnormality",
            "2: left ventricular hypertrophy",
        ],
        "prompt": "Resting electrocardiogram result (0: normal, 1: ST-T abnormality, 2: LV hypertrophy).",
    },
    "thalach": {
        "label": "Peak Heart Rate Achieved",
        "type": "numeric",
        "min": 60.0,
        "max": 220.0,
        "unit": "bpm",
        "prompt": "Maximum heart rate achieved during exercise (valid range: 60 to 220 bpm).",
    },
    "exang": {
        "label": "Exercise-Induced Angina",
        "type": "binary",
        "options": ["1 (Yes)", "0 (No)"],
        "prompt": "Exercise-induced chest discomfort (1 for Yes, 0 for No).",
    },
    "oldpeak": {
        "label": "Exercise ST Depression",
        "type": "numeric",
        "min": 0.0,
        "max": 10.0,
        "unit": "mm",
        "prompt": "ST depression induced by exercise relative to rest (valid range: 0.0 to 10.0 mm).",
    },
    "slope": {
        "label": "ST Segment Slope",
        "type": "categorical",
        "options": ["0: upsloping", "1: flat", "2: downsloping"],
        "prompt": "Slope of the peak exercise ST segment (0: upsloping, 1: flat, 2: downsloping).",
    },
    "ca": {
        "label": "Major Fluoroscopy Vessels",
        "type": "numeric",
        "min": 0.0,
        "max": 3.0,
        "unit": "vessels",
        "prompt": "Number of major vessels (0 to 3) colored by fluoroscopy.",
    },
    "thal": {
        "label": "Thalassemia Perfusion",
        "type": "categorical",
        "options": ["1: normal", "2: fixed defect", "3: reversable defect"],
        "prompt": "Thalassemia stress test perfusion (1: normal, 2: fixed defect, 3: reversable defect).",
    },
}

# Singleton instance reference to avoid reloading or duplicate initializations
_shared_engine = None


def set_ml_engine(engine: Any) -> None:
    """Explicitly register an existing MLEngine instance (e.g., from Flask app.py)."""
    global _shared_engine
    _shared_engine = engine


def get_ml_engine() -> Any:
    """
    Safely retrieves the shared MLEngine instance.
    Avoids circular imports by inspecting sys.modules first,
    or importing directly from ml_engine without loading Flask app.py.
    """
    global _shared_engine
    if _shared_engine is not None:
        return _shared_engine

    # Check if app module is already loaded in runtime
    for mod_name in ("backend.app", "app"):
        if mod_name in sys.modules:
            app_mod = sys.modules[mod_name]
            existing_engine = getattr(app_mod, "ml_engine", None)
            if existing_engine is not None:
                _shared_engine = existing_engine
                return _shared_engine

    # Otherwise import MLEngine directly without touching Flask app
    try:
        from backend.ml_engine import MLEngine
    except ImportError:
        from ml_engine import MLEngine

    _shared_engine = MLEngine()
    return _shared_engine


# Common clinical and acronym aliases for UCI Heart Disease attributes
FIELD_ALIASES: Dict[str, List[str]] = {
    "oldpeak": ["st_depression", "old_peak", "stdepression", "st_dep", "exercise_st_depression", "st_depr"],
    "thalach": ["thalch", "max_heart_rate", "max_hr", "heart_rate", "peak_heart_rate"],
    "trestbps": ["resting_bp", "blood_pressure", "resting_blood_pressure", "rbp", "bp"],
    "chol": ["cholesterol", "serum_cholesterol"],
    "cp": ["chest_pain", "chest_pain_type", "chestpain"],
    "fbs": ["fasting_blood_sugar", "fasting_bs"],
    "restecg": ["resting_ecg", "ecg", "rest_ecg"],
    "exang": ["exercise_angina", "exercise_induced_angina"],
    "slope": ["st_slope", "st_segment_slope"],
    "ca": ["vessels", "major_vessels", "fluoroscopy_vessels", "ca_vessels"],
    "thal": ["thalassemia", "thal_perfusion"],
}


def validate_clinical_inputs(raw_inputs: Dict[str, Any]) -> Tuple[bool, Optional[Dict[str, Any]], Dict[str, Any]]:
    """
    Validates input parameters against medical constraints.
    Does NOT silently substitute defaults if values are missing.

    Returns:
        (is_valid, error_payload_if_invalid, sanitized_inputs_if_valid)
    """
    missing_fields: List[Dict[str, Any]] = []
    invalid_fields: List[Dict[str, Any]] = []
    sanitized: Dict[str, Any] = {}

    for field, meta in CLINICAL_FIELD_METADATA.items():
        val = raw_inputs.get(field)

        # Handle field aliases (e.g. st_depression for oldpeak, thalch for thalach)
        if val is None or val == "" or str(val).lower() == "unknown":
            aliases = FIELD_ALIASES.get(field, [])
            for alias in aliases:
                alt_val = raw_inputs.get(alias)
                if alt_val is not None and alt_val != "" and str(alt_val).lower() != "unknown":
                    val = alt_val
                    break

        # Check for missing values
        if val is None or val == "" or str(val).lower() == "unknown":
            missing_fields.append({
                "field": field,
                "label": meta["label"],
                "prompt": meta["prompt"],
            })
            continue

        # Validate numeric fields
        if meta["type"] == "numeric":
            try:
                num_val = float(val)
                if num_val < meta["min"] or num_val > meta["max"]:
                    invalid_fields.append({
                        "field": field,
                        "label": meta["label"],
                        "received": val,
                        "expected_range": f"{meta['min']} to {meta['max']} {meta.get('unit', '')}".strip(),
                    })
                else:
                    sanitized[field] = num_val
            except (ValueError, TypeError):
                invalid_fields.append({
                    "field": field,
                    "label": meta["label"],
                    "received": val,
                    "reason": "Must be a valid number.",
                })

        # Validate categorical/binary fields
        elif meta["type"] in ("categorical", "binary"):
            # Normalize common boolean strings
            str_val = str(val).strip().lower()
            if str_val in ("true", "yes"):
                sanitized[field] = 1
            elif str_val in ("false", "no"):
                sanitized[field] = 0
            else:
                sanitized[field] = val

    # 1. Handle missing fields error
    if missing_fields:
        error_response = {
            "status": "missing_inputs",
            "success": False,
            "message": f"Cannot generate prediction: {len(missing_fields)} required clinical measurement(s) are missing.",
            "missing_fields": missing_fields,
            "received_inputs": {k: v for k, v in raw_inputs.items() if v is not None and v != ""},
            "instructions_for_llm": (
                "Do NOT guess or fabricate these missing measurements. Politely ask the patient or user "
                "to provide the missing clinical values before generating a heart disease severity prediction."
            ),
        }
        return False, error_response, {}

    # 2. Handle invalid fields error
    if invalid_fields:
        error_response = {
            "status": "validation_error",
            "success": False,
            "message": f"{len(invalid_fields)} input measurement(s) are outside medically plausible boundaries.",
            "invalid_fields": invalid_fields,
            "instructions_for_llm": (
                "Inform the user about the invalid measurements and ask them to verify their input values."
            ),
        }
        return False, error_response, {}

    return True, None, sanitized


def predict_heart_disease_severity(
    age: Optional[float] = None,
    sex: Optional[Any] = None,
    cp: Optional[Any] = None,
    trestbps: Optional[float] = None,
    chol: Optional[float] = None,
    fbs: Optional[Any] = None,
    restecg: Optional[Any] = None,
    thalach: Optional[float] = None,
    exang: Optional[Any] = None,
    oldpeak: Optional[float] = None,
    st_depression: Optional[float] = None,
    slope: Optional[Any] = None,
    ca: Optional[Any] = None,
    thal: Optional[Any] = None,
    model_name: str = "Random Forest",
    apply_thresholds: bool = True,
    form_data: Optional[Dict[str, Any]] = None,
    **kwargs,
) -> Dict[str, Any]:
    """
    Python prediction tool wrapper for the CardioSense Machine Learning System.

    Calls the pre-trained Machine Learning model (Random Forest / SHAP) to predict
    heart disease severity (Class 0: No Disease to Class 4: Very Severe).

    Does NOT use silent defaults when required values are missing.
    Strictly validates clinical inputs before invoking inference.

    Args:
        age: Patient age in years (valid range: 20 to 100).
        sex: Biological sex (1 = Male, 0 = Female).
        cp: Chest pain type (0: typical angina, 1: atypical angina, 2: non-anginal, 3: asymptomatic).
        trestbps: Resting blood pressure in mm Hg (valid range: 60 to 220).
        chol: Serum cholesterol in mg/dl (valid range: 100 to 600).
        fbs: Fasting blood sugar > 120 mg/dl (1 = true, 0 = false).
        restecg: Resting ECG (0: normal, 1: ST-T wave abnormality, 2: left ventricular hypertrophy).
        thalach: Maximum heart rate achieved during exercise (valid range: 60 to 220 bpm).
        exang: Exercise-induced angina (1 = yes, 0 = no).
        oldpeak: ST depression induced by exercise relative to rest (valid range: 0.0 to 10.0 mm).
        st_depression: Alias for oldpeak (ST depression induced by exercise, valid range: 0.0 to 10.0 mm).
        slope: Slope of peak exercise ST segment (0: upsloping, 1: flat, 2: downsloping).
        ca: Number of major vessels (0 to 3) colored by fluoroscopy.
        thal: Thalassemia stress test perfusion (1: normal, 2: fixed defect, 3: reversable defect).
        model_name: ML model to use (default: "Random Forest").
        apply_thresholds: Whether to apply clinical safety threshold tuning (default: True).
        form_data: Optional dictionary containing the clinical inputs.

    Returns:
        Structured prediction result including predicted class, severity label,
        class probabilities, top SHAP factors, and clinical disclaimers.
        If any required inputs are missing, returns a structured validation error.
    """
    # Resolve aliases between oldpeak and st_depression
    if oldpeak is None and st_depression is not None:
        oldpeak = st_depression

    # Consolidate raw inputs from kwargs, form_data dict, or named parameters
    raw_inputs = {}
    if form_data and isinstance(form_data, dict):
        raw_inputs.update(form_data)
    
    raw_inputs.update(kwargs)

    # Map explicit arguments if provided
    explicit_args = {
        "age": age,
        "sex": sex,
        "cp": cp,
        "trestbps": trestbps,
        "chol": chol,
        "fbs": fbs,
        "restecg": restecg,
        "thalach": thalach,
        "exang": exang,
        "oldpeak": oldpeak,
        "slope": slope,
        "ca": ca,
        "thal": thal,
    }
    for k, v in explicit_args.items():
        if v is not None:
            raw_inputs[k] = v

    # 1. Strictly validate clinical inputs (do not silently inject defaults)
    is_valid, validation_error, sanitized_inputs = validate_clinical_inputs(raw_inputs)
    if not is_valid:
        return validation_error

    # 2. Retrieve existing MLEngine instance safely
    engine = get_ml_engine()

    # 3. Execute prediction using the existing ML engine
    ml_result = engine.predict(
        form_data=sanitized_inputs,
        model_name=model_name,
        apply_thresholds=apply_thresholds,
    )

    # 4. Return structured response preserving all original fields for React frontend
    # while providing clear, structured summaries for the LLM
    return {
        "status": "success",
        "success": True,
        "prediction_id": ml_result["id"],
        "timestamp": ml_result["timestamp"],
        "predicted_class": ml_result["predictedClass"],
        "severity_label": ml_result["severityInfo"]["label"],
        "severity_headline": ml_result["severityInfo"]["headline"],
        "severity_summary": ml_result["severityInfo"]["summary"],
        "severity_guidance": ml_result["severityInfo"]["guidance"],
        "probabilities": ml_result["probabilities"],
        "distribution": ml_result["distribution"],
        "shap_factors": ml_result["shapFactors"],
        "patient_inputs": ml_result["patientInputs"],
        "model_used": ml_result["modelUsed"],
        "threshold_tuning_applied": ml_result["thresholdTuningApplied"],
        "clinical_thresholds": ml_result["clinicalThresholds"],
        "raw_ml_result": ml_result,  # Preserves exact payload for existing React frontend charts
        "disclaimer": (
            "This analysis is generated by a Machine Learning model for informational and educational "
            "purposes only and does NOT constitute a clinical diagnosis or medical treatment plan. "
            "Always consult a licensed healthcare professional."
        ),
        "instructions_for_llm": (
            "Strictly report the predicted severity class and percentage probabilities as given above. "
            "Explain the prediction using the provided SHAP factors (noting which indicators increased severity "
            "and which were protective). Under NO circumstances should you invent, alter, or round probabilities, "
            "SHAP scores, or clinical measurements. Always clearly communicate that this is an AI model estimation "
            "and not a medical diagnosis."
        ),
    }
