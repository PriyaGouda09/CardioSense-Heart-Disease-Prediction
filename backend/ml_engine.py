import os
import time
import numpy as np
import pandas as pd
import warnings
import joblib
from datetime import datetime

warnings.filterwarnings("ignore")

from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OrdinalEncoder
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_predict
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    confusion_matrix,
    classification_report,
    precision_recall_fscore_support,
)
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False

# Class metadata matching clinical reference
CLASS_NAMES = ["No Disease", "Mild", "Moderate", "Severe", "Very Severe"]
SEV_WEIGHTS = {0: 1.0, 1: 1.5, 2: 2.0, 3: 3.0, 4: 4.0}

SEVERITY_CLASSES_INFO = {
    0: {
        "id": 0,
        "label": "No Disease",
        "badgeLabel": "Class 0 — No Disease",
        "color": "#2FA37A",
        "bgClass": "bg-[#EBF7F2] text-[#1B6F52] border-[#B9E5D4]",
        "lightBg": "#EBF7F2",
        "textColor": "#1B6F52",
        "borderColor": "#B9E5D4",
        "headline": "Your inputs suggest a pattern consistent with No Disease",
        "summary": "Your entered vitals and symptoms align closely with typical reference patterns.",
        "guidance": "Maintaining a balanced diet, regular physical activity, and routine annual wellness checks can help preserve strong cardiovascular health.",
    },
    1: {
        "id": 1,
        "label": "Mild",
        "badgeLabel": "Class 1 — Mild",
        "color": "#7BB661",
        "bgClass": "bg-[#F3F9EE] text-[#487332] border-[#C8E5B8]",
        "lightBg": "#F3F9EE",
        "textColor": "#487332",
        "borderColor": "#C8E5B8",
        "headline": "Your inputs suggest a pattern more consistent with Mild severity",
        "summary": "Certain measurements show minor variations compared to typical baseline reference data.",
        "guidance": "Consider reviewing your lifestyle habits and discussing these mild indicators at your next scheduled appointment with a primary care provider.",
    },
    2: {
        "id": 2,
        "label": "Moderate",
        "badgeLabel": "Class 2 — Moderate",
        "color": "#E0A63C",
        "bgClass": "bg-[#FCF7EB] text-[#8C5E13] border-[#F5DC9E]",
        "lightBg": "#FCF7EB",
        "textColor": "#8C5E13",
        "borderColor": "#F5DC9E",
        "headline": "Your inputs suggest a pattern more consistent with Moderate severity",
        "summary": "Several key markers, such as blood pressure or cholesterol trends, show moderate elevation.",
        "guidance": "Sharing these findings with a qualified healthcare provider can help determine if proactive lifestyle adjustments or targeted checks are beneficial.",
    },
    3: {
        "id": 3,
        "label": "Severe",
        "badgeLabel": "Class 3 — Severe",
        "color": "#D9713C",
        "bgClass": "bg-[#FDF3ED] text-[#8F3D14] border-[#F6C8AF]",
        "lightBg": "#FDF3ED",
        "textColor": "#8F3D14",
        "borderColor": "#F6C8AF",
        "headline": "Your inputs suggest a pattern more consistent with Severe severity",
        "summary": "Multiple cardiovascular factors combine to indicate elevated patterns in the reference model.",
        "guidance": "These patterns are worth discussing with a doctor soon. A comprehensive clinical evaluation (e.g. ECG, standard lab panels) will provide clear context.",
    },
    4: {
        "id": 4,
        "label": "Very Severe",
        "badgeLabel": "Class 4 — Very Severe",
        "color": "#B84C4C",
        "bgClass": "bg-[#FBF0F0] text-[#7A2828] border-[#F1BCBC]",
        "lightBg": "#FBF0F0",
        "textColor": "#7A2828",
        "borderColor": "#F1BCBC",
        "headline": "Your inputs suggest a pattern more consistent with Very Severe severity",
        "summary": "Multiple indicators strongly align with complex cardiovascular patterns in the training dataset.",
        "guidance": "We recommend scheduling a clinical consultation with your physician or cardiologist in the near term for a professional checkup and guidance.",
    },
}

# Population fallbacks for missing input values
POPULATION_DEFAULTS = {
    "age": 54.0,
    "sex": 1,
    "cp": 0,
    "trestbps": 130.0,
    "chol": 240.0,
    "fbs": 0,
    "restecg": 0,
    "thalach": 150.0,
    "exang": 0,
    "oldpeak": 1.0,
    "slope": 1,
    "ca": 0,
    "thal": 1,
}

def severity_weighted_f1(y_true, y_pred):
    """Computes severity-weighted F1 where C4 errors carry 4x weight of C0 errors."""
    per_class_f1 = f1_score(
        y_true, y_pred,
        average=None,
        labels=[0, 1, 2, 3, 4],
        zero_division=0,
    )
    w = np.array([SEV_WEIGHTS[i] for i in range(5)])
    w_norm = w / w.sum()
    return float(np.dot(per_class_f1, w_norm))


class MLEngine:
    def __init__(self, dataset_path=None):
        self.dataset_path = dataset_path or self._find_dataset_path()
        self.seed = 42
        self.test_size = 0.20
        self.min_prec = 0.30

        self.features_orig = [
            "age", "sex", "cp", "trestbps", "chol", "fbs",
            "restecg", "thalch", "exang", "oldpeak", "slope", "ca", "thal",
        ]
        self.engineered_features = ["age_group", "cp_risk", "high_hr", "hypertension", "oldpeak_cat"]
        self.all_features = self.features_orig + self.engineered_features

        self.numeric_cols = ["age", "trestbps", "chol", "thalch", "oldpeak"]
        self.category_cols = ["sex", "cp", "fbs", "restecg", "exang", "slope", "ca", "thal"]
        self.numeric_features = self.numeric_cols + self.engineered_features
        self.categorical_features = self.category_cols

        # Model storage
        self.fitted_models = {}
        self.best_thresholds = {0: 0.5, 1: 0.5, 2: 0.5, 3: 0.30, 4: 0.50}
        self.explainer = None
        self.preprocessor = None
        self.scaler = None
        self.clf_rf = None
        self.metrics = {}
        self.dataset_info = {}
        self.is_trained = False

        # Load saved models if present, otherwise train from scratch
        if not self._try_load_saved_models():
            self.train_and_calibrate()

    def _try_load_saved_models(self):
        """Attempts to load pre-trained models from saved_models directory."""
        import json
        save_dir = os.path.join(os.path.dirname(__file__), "saved_models")
        rf_path = os.path.join(save_dir, "random_forest_model.joblib")
        svm_path = os.path.join(save_dir, "svm_model.joblib")
        mlp_path = os.path.join(save_dir, "mlp_model.joblib")
        benchmarks_path = os.path.join(save_dir, "benchmarks.json")

        if os.path.exists(rf_path) and os.path.exists(svm_path) and os.path.exists(mlp_path):
            try:
                print(f"[MLEngine] Loading pre-trained models from {save_dir}...")
                self.load_and_preprocess_dataset()
                self.fitted_models["Random Forest"] = joblib.load(rf_path)
                self.fitted_models["SVM"] = joblib.load(svm_path)
                self.fitted_models["MLP"] = joblib.load(mlp_path)

                best_rf = self.fitted_models["Random Forest"]
                self.preprocessor = best_rf.named_steps["preprocess"]
                self.scaler = best_rf.named_steps["scaler"]
                self.clf_rf = best_rf.named_steps["clf"]

                if os.path.exists(benchmarks_path):
                    with open(benchmarks_path, "r", encoding="utf-8") as f:
                        bench_data = json.load(f)
                        self.metrics = bench_data.get("models", {})
                        if "clinical_thresholds" in bench_data:
                            self.best_thresholds = {int(k): v for k, v in bench_data["clinical_thresholds"].items()}

                if SHAP_AVAILABLE:
                    try:
                        self.explainer = shap.TreeExplainer(self.clf_rf)
                        print("[MLEngine] TreeExplainer successfully initialized.")
                    except Exception as e:
                        print(f"[MLEngine] TreeExplainer init note: {e}")
                        self.explainer = None

                self.is_trained = True
                print("[MLEngine] Pre-trained models loaded successfully.")
                return True
            except Exception as e:
                print(f"[MLEngine] Could not load saved models ({e}), retraining...")
                return False
        return False

    def _find_dataset_path(self):
        candidates = [
            os.path.join(os.getcwd(), "Second_Review_Content", "heart_disease_uci.csv"),
            os.path.join(os.path.dirname(__file__), "..", "Second_Review_Content", "heart_disease_uci.csv"),
            os.path.join(os.getcwd(), "First_Review_Content", "heart_disease_uci.csv"),
            os.path.join(os.path.dirname(__file__), "..", "First_Review_Content", "heart_disease_uci.csv"),
            os.path.join(os.getcwd(), "heart_disease_uci.csv"),
        ]
        for p in candidates:
            norm_p = os.path.abspath(p)
            if os.path.exists(norm_p):
                return norm_p
        raise FileNotFoundError(f"Could not find heart_disease_uci.csv in expected directories: {candidates}")

    def _engineer_features(self, df):
        """Creates clinical engineered features as specified in Heart_Disease_Severity_ML_Pipeline_fixed."""
        df_eng = df.copy()
        
        # 1. age_group
        df_eng["age_group"] = pd.cut(
            df_eng["age"], bins=[20, 40, 55, 65, 100], labels=[0, 1, 2, 3], right=True
        ).astype(float)
        
        # 2. cp_risk (1 if cp is typical angina or asymptomatic, else 0)
        if "cp" in df_eng.columns:
            df_eng["cp_risk"] = np.where(
                df_eng["cp"].isna(),
                np.nan,
                df_eng["cp"].isin(["typical angina", "asymptomatic", 0, 3, "0", "3"]).astype(float)
            )
        else:
            df_eng["cp_risk"] = 0.0

        # 3. high_hr (1 if thalch > 150)
        hr_col = "thalch" if "thalch" in df_eng.columns else "thalach"
        df_eng["high_hr"] = np.where(
            df_eng[hr_col].isna(), np.nan, (df_eng[hr_col] > 150).astype(float)
        )

        # 4. hypertension (1 if resting BP > 140)
        df_eng["hypertension"] = np.where(
            df_eng["trestbps"].isna(), np.nan, (df_eng["trestbps"] > 140).astype(float)
        )

        # 5. oldpeak_cat (ST depression bins)
        df_eng["oldpeak_cat"] = pd.cut(
            df_eng["oldpeak"], bins=[-0.1, 0.5, 2.0, 10.0], labels=[0, 1, 2], right=True
        ).astype(float)

        return df_eng

    def load_and_preprocess_dataset(self):
        """Loads and cleans dataset with clinical plausible range clipping."""
        df = pd.read_csv(self.dataset_path)
        df.columns = df.columns.str.strip().str.lower()
        df.drop_duplicates(inplace=True)

        # Plausibility range clipping
        clips = {
            "chol": (100, 600),
            "trestbps": (60, 220),
            "thalch": (60, 220),
            "oldpeak": (0, 10),
            "age": (20, 100),
        }
        for col, (lo, hi) in clips.items():
            if col in df.columns:
                df[col] = df[col].clip(lo, hi)

        # Apply feature engineering
        df = self._engineer_features(df)

        self.dataset_info = {
            "path": self.dataset_path,
            "pipeline_source": "Heart_Disease_Severity_ML_Pipeline_fixed",
            "total_samples": len(df),
            "columns": list(df.columns),
            "class_counts": df["num"].value_counts().sort_index().to_dict(),
            "missing_values": df[self.all_features].isnull().sum().to_dict(),
            "mean_age": float(df["age"].mean()),
            "mean_chol": float(df["chol"].mean()),
            "mean_trestbps": float(df["trestbps"].mean()),
        }
        return df

    def train_and_calibrate(self):
        """Executes full training pipeline, threshold tuning, and SHAP explainer setup according to Heart_Disease_Severity_ML_Pipeline_fixed."""
        print(f"[MLEngine] Loading dataset from: {self.dataset_path}")
        df = self.load_and_preprocess_dataset()

        X = df[self.all_features].copy()
        y = df["num"].values

        X_train, X_holdout, y_train, y_holdout = train_test_split(
            X, y, test_size=self.test_size, stratify=y, random_state=self.seed
        )

        # Column Preprocessor
        numeric_transformer = Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
        ])
        categorical_transformer = Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1)),
        ])

        self.preprocessor = ColumnTransformer(
            transformers=[
                ("num", numeric_transformer, self.numeric_features),
                ("cat", categorical_transformer, self.categorical_features),
            ],
            remainder="drop",
        )

        # 1. Random Forest Pipeline (Heart_Disease_Severity_ML_Pipeline_fixed)
        rf_pipe = ImbPipeline([
            ("preprocess", self.preprocessor),
            ("smote", SMOTE(random_state=self.seed)),
            ("scaler", StandardScaler()),
            ("clf", RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                max_features="sqrt",
                min_samples_split=2,
                class_weight="balanced",
                random_state=self.seed,
                n_jobs=1
            )),
        ])

        # 2. Support Vector Machine Pipeline (Heart_Disease_Severity_ML_Pipeline_fixed)
        svm_pipe = ImbPipeline([
            ("preprocess", self.preprocessor),
            ("smote", SMOTE(random_state=self.seed)),
            ("scaler", StandardScaler()),
            ("clf", SVC(
                C=1.0,
                kernel="rbf",
                gamma="scale",
                probability=True,
                class_weight="balanced",
                random_state=self.seed,
                max_iter=2000,
                cache_size=400
            )),
        ])

        # 3. MLP Neural Network Pipeline (Heart_Disease_Severity_ML_Pipeline_fixed)
        mlp_pipe = ImbPipeline([
            ("preprocess", self.preprocessor),
            ("smote", SMOTE(random_state=self.seed)),
            ("scaler", StandardScaler()),
            ("clf", MLPClassifier(
                hidden_layer_sizes=(64, 32),
                activation="relu",
                alpha=0.0001,
                learning_rate_init=0.001,
                max_iter=500,
                random_state=self.seed,
                early_stopping=True
            )),
        ])

        pipelines = {
            "Random Forest": rf_pipe,
            "SVM": svm_pipe,
            "MLP": mlp_pipe,
        }

        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=self.seed)

        print("[MLEngine] Training pipelines and evaluating on stratified CV...")
        for name, pipe in pipelines.items():
            pipe.fit(X_train, y_train)
            self.fitted_models[name] = pipe

            # CV Out-of-fold predictions
            oof_pred = cross_val_predict(pipe, X_train, y_train, cv=cv, n_jobs=1)
            cv_acc = float(accuracy_score(y_train, oof_pred))
            cv_macro_f1 = float(f1_score(y_train, oof_pred, average="macro", zero_division=0))
            cv_sev_f1 = float(severity_weighted_f1(y_train, oof_pred))

            # Holdout evaluation
            y_holdout_pred = pipe.predict(X_holdout)
            hold_acc = float(accuracy_score(y_holdout, y_holdout_pred))
            hold_macro_f1 = float(f1_score(y_holdout, y_holdout_pred, average="macro", zero_division=0))
            hold_sev_f1 = float(severity_weighted_f1(y_holdout, y_holdout_pred))
            cm = confusion_matrix(y_holdout, y_holdout_pred).tolist()

            self.metrics[name] = {
                "cv_accuracy": round(cv_acc, 4),
                "cv_macro_f1": round(cv_macro_f1, 4),
                "cv_severity_f1": round(cv_sev_f1, 4),
                "holdout_accuracy": round(hold_acc, 4),
                "holdout_macro_f1": round(hold_macro_f1, 4),
                "holdout_severity_f1": round(hold_sev_f1, 4),
                "confusion_matrix": cm,
            }
            print(f"  [OK] {name}: CV Acc={cv_acc:.4f}, Holdout Acc={hold_acc:.4f}, Sev-F1={hold_sev_f1:.4f}")

        # Clinical Threshold Tuning for Random Forest (Classes 3 & 4)
        best_rf = self.fitted_models["Random Forest"]
        oof_proba = cross_val_predict(best_rf, X_train, y_train, cv=cv, method="predict_proba", n_jobs=1)

        for cls in [3, 4]:
            best_recall = 0.0
            best_t = 0.5
            for t in np.arange(0.10, 0.90, 0.05):
                pred_cls = (oof_proba[:, cls] >= t)
                tp = int(((pred_cls) & (y_train == cls)).sum())
                fn = int((~pred_cls & (y_train == cls)).sum())
                fp = int((pred_cls & (y_train != cls)).sum())

                recall = tp / (tp + fn + 1e-9)
                precision = tp / (tp + fp + 1e-9)

                if recall > best_recall and precision >= self.min_prec:
                    best_recall = recall
                    best_t = float(t)
            self.best_thresholds[cls] = round(best_t, 2)

        print(f"[MLEngine] Calibrated clinical thresholds: {self.best_thresholds}")

        # Setup SHAP Explainer
        if SHAP_AVAILABLE:
            try:
                rf_step = best_rf.named_steps["clf"]
                self.scaler = best_rf.named_steps["scaler"]
                self.explainer = shap.TreeExplainer(rf_step)
                print("[MLEngine] TreeExplainer successfully initialized.")
            except Exception as e:
                print(f"[MLEngine] Warning: Could not initialize TreeExplainer: {e}")
                self.explainer = None
        else:
            print("[MLEngine] Note: shap library not installed; falling back to heuristic attributions.")

        self.is_trained = True
        print("[MLEngine] Initialization complete. All models ready for inference.")

    def _normalize_input_dict(self, form_data):
        """Converts frontend form inputs into standard feature formats."""
        # Handle string or numeric values safely
        def to_num(v, default):
            if v is None or v == "" or v == "unknown":
                return np.nan
            try:
                return float(v)
            except (ValueError, TypeError):
                return default

        age = to_num(form_data.get("age"), POPULATION_DEFAULTS["age"])
        sex_raw = form_data.get("sex", POPULATION_DEFAULTS["sex"])
        # Map sex
        if sex_raw in [1, "1", "Male", "male", True]:
            sex = "Male"
        elif sex_raw in [0, "0", "Female", "female", False]:
            sex = "Female"
        else:
            sex = "Male"

        # Map cp
        cp_raw = form_data.get("cp", POPULATION_DEFAULTS["cp"])
        cp_map = {
            0: "typical angina", "0": "typical angina", "typical angina": "typical angina",
            1: "atypical angina", "1": "atypical angina", "atypical angina": "atypical angina",
            2: "non-anginal", "2": "non-anginal", "non-anginal": "non-anginal",
            3: "asymptomatic", "3": "asymptomatic", "asymptomatic": "asymptomatic",
        }
        cp = cp_map.get(cp_raw, "typical angina" if cp_raw != "unknown" else np.nan)

        trestbps = to_num(form_data.get("trestbps"), POPULATION_DEFAULTS["trestbps"])
        chol = to_num(form_data.get("chol"), POPULATION_DEFAULTS["chol"])

        # Map fbs
        fbs_raw = form_data.get("fbs", POPULATION_DEFAULTS["fbs"])
        if fbs_raw in [1, "1", True, "true", "True"]:
            fbs = True
        elif fbs_raw in [0, "0", False, "false", "False"]:
            fbs = False
        else:
            fbs = np.nan

        # Map restecg
        restecg_raw = form_data.get("restecg", POPULATION_DEFAULTS["restecg"])
        restecg_map = {
            0: "normal", "0": "normal", "normal": "normal",
            1: "st-t abnormality", "1": "st-t abnormality", "st-t abnormality": "st-t abnormality",
            2: "lv hypertrophy", "2": "lv hypertrophy", "lv hypertrophy": "lv hypertrophy",
        }
        restecg = restecg_map.get(restecg_raw, "normal" if restecg_raw != "unknown" else np.nan)

        thalach = to_num(form_data.get("thalach") or form_data.get("thalch"), POPULATION_DEFAULTS["thalach"])

        # Map exang
        exang_raw = form_data.get("exang", POPULATION_DEFAULTS["exang"])
        if exang_raw in [1, "1", True, "true", "True"]:
            exang = True
        elif exang_raw in [0, "0", False, "false", "False"]:
            exang = False
        else:
            exang = np.nan

        oldpeak = to_num(form_data.get("oldpeak"), POPULATION_DEFAULTS["oldpeak"])

        # Map slope
        slope_raw = form_data.get("slope", POPULATION_DEFAULTS["slope"])
        slope_map = {
            0: "upsloping", "0": "upsloping", "upsloping": "upsloping",
            1: "flat", "1": "flat", "flat": "flat",
            2: "downsloping", "2": "downsloping", "downsloping": "downsloping",
        }
        slope = slope_map.get(slope_raw, "upsloping" if slope_raw != "unknown" else np.nan)

        # Map ca
        ca = to_num(form_data.get("ca"), POPULATION_DEFAULTS["ca"])

        # Map thal
        thal_raw = form_data.get("thal", POPULATION_DEFAULTS["thal"])
        thal_map = {
            1: "normal", "1": "normal", "normal": "normal",
            2: "fixed defect", "2": "fixed defect", "fixed defect": "fixed defect",
            3: "reversable defect", "3": "reversable defect", "reversable defect": "reversable defect", "reversible": "reversable defect",
        }
        thal = thal_map.get(thal_raw, "normal" if thal_raw != "unknown" else np.nan)

        row = {
            "age": age,
            "sex": sex,
            "cp": cp,
            "trestbps": trestbps,
            "chol": chol,
            "fbs": fbs,
            "restecg": restecg,
            "thalch": thalach,
            "exang": exang,
            "oldpeak": oldpeak,
            "slope": slope,
            "ca": ca,
            "thal": thal,
        }

        # Plausibility clipping for user inputs
        if not np.isnan(row["chol"]): row["chol"] = float(np.clip(row["chol"], 100, 600))
        if not np.isnan(row["trestbps"]): row["trestbps"] = float(np.clip(row["trestbps"], 60, 220))
        if not np.isnan(row["thalch"]): row["thalch"] = float(np.clip(row["thalch"], 60, 220))
        if not np.isnan(row["oldpeak"]): row["oldpeak"] = float(np.clip(row["oldpeak"], 0, 10))
        if not np.isnan(row["age"]): row["age"] = float(np.clip(row["age"], 20, 100))

        df_single = pd.DataFrame([row])
        df_single = self._engineer_features(df_single)
        return df_single[self.all_features], row

    def compute_shap_factors(self, df_input, raw_patient_inputs, predicted_class):
        """Calculates SHAP feature attributions and formats them for visual display."""
        factors = []
        if self.explainer is not None and self.preprocessor is not None and self.scaler is not None:
            try:
                input_prep = self.preprocessor.transform(df_input)
                input_scaled = self.scaler.transform(input_prep)
                shap_vals = self.explainer.shap_values(input_scaled)

                # shap_vals can be shape (1, n_features, 5) or list of 5 arrays
                if isinstance(shap_vals, list):
                    sv_class = shap_vals[predicted_class][0]
                elif len(shap_vals.shape) == 3:
                    sv_class = shap_vals[0, :, predicted_class]
                else:
                    sv_class = shap_vals[0]

                # Map feature index to human name and description
                feature_labels = self.numeric_features + self.categorical_features
                
                shap_dict = {}
                for idx, feat_name in enumerate(feature_labels):
                    shap_dict[feat_name] = float(sv_class[idx])

                # Build descriptive list
                age_val = raw_patient_inputs.get("age", 54)
                trestbps_val = raw_patient_inputs.get("trestbps", 130)
                chol_val = raw_patient_inputs.get("chol", 240)
                thalach_val = raw_patient_inputs.get("thalch", 150)
                oldpeak_val = raw_patient_inputs.get("oldpeak", 1.0)
                ca_val = raw_patient_inputs.get("ca", 0)
                exang_val = raw_patient_inputs.get("exang", False)
                thal_val = raw_patient_inputs.get("thal", "normal")

                all_candidates = [
                    {
                        "feature": "Resting Blood Pressure",
                        "valueText": f"{int(trestbps_val)} mmHg" if not np.isnan(trestbps_val) else "130 mmHg",
                        "shap": round(shap_dict.get("trestbps", 0.0) + shap_dict.get("hypertension", 0.0), 3),
                        "description": "Elevated resting pressure" if trestbps_val > 130 else "Optimal blood pressure level",
                        "plainLabel": f"Resting blood pressure ({int(trestbps_val)} mmHg)" if not np.isnan(trestbps_val) else "Resting blood pressure",
                    },
                    {
                        "feature": "Serum Cholesterol",
                        "valueText": f"{int(chol_val)} mg/dl" if not np.isnan(chol_val) else "240 mg/dl",
                        "shap": round(shap_dict.get("chol", 0.0), 3),
                        "description": "Elevated total cholesterol" if chol_val > 220 else "Healthy cholesterol range",
                        "plainLabel": f"Serum cholesterol ({int(chol_val)} mg/dl)" if not np.isnan(chol_val) else "Serum cholesterol",
                    },
                    {
                        "feature": "Exercise ST Depression",
                        "valueText": f"{float(oldpeak_val):.1f} mm" if not np.isnan(oldpeak_val) else "1.0 mm",
                        "shap": round(shap_dict.get("oldpeak", 0.0) + shap_dict.get("oldpeak_cat", 0.0), 3),
                        "description": "Exercise-induced ST variation" if oldpeak_val > 1.5 else "Stable baseline ST segment",
                        "plainLabel": f"ST depression ({float(oldpeak_val):.1f} mm)" if not np.isnan(oldpeak_val) else "ST depression",
                    },
                    {
                        "feature": "Max Heart Rate Achieved",
                        "valueText": f"{int(thalach_val)} bpm" if not np.isnan(thalach_val) else "150 bpm",
                        "shap": round(shap_dict.get("thalch", 0.0) + shap_dict.get("high_hr", 0.0), 3),
                        "description": "Healthy peak cardiac output" if thalach_val >= 150 else "Reduced peak heart rate capacity",
                        "plainLabel": f"Max heart rate ({int(thalach_val)} bpm)" if not np.isnan(thalach_val) else "Max heart rate",
                    },
                    {
                        "feature": "Exercise-Induced Angina",
                        "valueText": "Present" if exang_val in [True, 1, "True"] else "Absent",
                        "shap": round(shap_dict.get("exang", 0.0), 3),
                        "description": "Discomfort triggered during exertion" if exang_val in [True, 1, "True"] else "No chest tightness with activity",
                        "plainLabel": f"Exercise discomfort ({'Yes' if exang_val in [True, 1, 'True'] else 'No'})",
                    },
                    {
                        "feature": "Major Fluoroscopy Vessels",
                        "valueText": f"{int(ca_val)} vessels" if not np.isnan(ca_val) else "0 vessels",
                        "shap": round(shap_dict.get("ca", 0.0), 3),
                        "description": "Vascular reference indicators" if ca_val > 0 else "Clear vessel profile",
                        "plainLabel": f"Major vessels colored ({int(ca_val)})" if not np.isnan(ca_val) else "Major vessels",
                    },
                    {
                        "feature": "Thalassemia Perfusion",
                        "valueText": str(thal_val).title(),
                        "shap": round(shap_dict.get("thal", 0.0), 3),
                        "description": "Standard blood flow perfusion" if thal_val == "normal" else "Stress test perfusion pattern",
                        "plainLabel": f"Perfusion pattern ({str(thal_val).title()})",
                    },
                    {
                        "feature": "Age Factor",
                        "valueText": f"{int(age_val)} yrs" if not np.isnan(age_val) else "54 yrs",
                        "shap": round(shap_dict.get("age", 0.0) + shap_dict.get("age_group", 0.0), 3),
                        "description": "Natural demographic baseline" if age_val > 55 else "Youthful age demographic",
                        "plainLabel": f"Age ({int(age_val)} yrs)" if not np.isnan(age_val) else "Age factor",
                    },
                    {
                        "feature": "Chest Pain Pattern",
                        "valueText": str(raw_patient_inputs.get("cp", "typical angina")).title(),
                        "shap": round(shap_dict.get("cp", 0.0) + shap_dict.get("cp_risk", 0.0), 3),
                        "description": "Angina symptom profile",
                        "plainLabel": f"Chest discomfort pattern ({str(raw_patient_inputs.get('cp', '')).title()})",
                    },
                ]

                # Sort by absolute SHAP score descending and take top 6
                factors = sorted(all_candidates, key=lambda x: abs(x["shap"]), reverse=True)[:6]

            except Exception as e:
                print(f"[MLEngine] Error computing SHAP values: {e}")
                factors = []

        # Fallback if SHAP was empty
        if not factors:
            factors = [
                {
                    "feature": "Resting Blood Pressure",
                    "valueText": f"{int(raw_patient_inputs.get('trestbps', 130))} mmHg",
                    "shap": 0.25 if raw_patient_inputs.get("trestbps", 130) > 135 else -0.15,
                    "description": "Resting systolic pressure level",
                    "plainLabel": f"Resting blood pressure ({int(raw_patient_inputs.get('trestbps', 130))} mmHg)",
                },
                {
                    "feature": "Serum Cholesterol",
                    "valueText": f"{int(raw_patient_inputs.get('chol', 220))} mg/dl",
                    "shap": 0.35 if raw_patient_inputs.get("chol", 220) > 240 else -0.10,
                    "description": "Total serum cholesterol level",
                    "plainLabel": f"Serum cholesterol ({int(raw_patient_inputs.get('chol', 220))} mg/dl)",
                },
                {
                    "feature": "Max Heart Rate Achieved",
                    "valueText": f"{int(raw_patient_inputs.get('thalch', 150))} bpm",
                    "shap": -0.40 if raw_patient_inputs.get("thalch", 150) >= 150 else 0.30,
                    "description": "Peak exercise heart rate capacity",
                    "plainLabel": f"Max heart rate ({int(raw_patient_inputs.get('thalch', 150))} bpm)",
                },
                {
                    "feature": "Exercise ST Depression",
                    "valueText": f"{float(raw_patient_inputs.get('oldpeak', 1.0)):.1f} mm",
                    "shap": 0.45 if raw_patient_inputs.get("oldpeak", 1.0) > 1.5 else -0.20,
                    "description": "ECG ST depression during exertion",
                    "plainLabel": f"ST depression ({float(raw_patient_inputs.get('oldpeak', 1.0)):.1f} mm)",
                },
            ]

        # Format output items with colors and impact text
        formatted_factors = []
        for item in factors:
            shap_val = item["shap"]
            impact = "Increased severity" if shap_val > 0 else "Decreased severity"
            color = "#D9713C" if shap_val > 0.3 else ("#E0A63C" if shap_val > 0 else "#2FA37A")
            formatted_factors.append({
                **item,
                "impact": impact,
                "color": color,
                "displayText": f"{item['plainLabel']} - {impact.lower()}",
            })

        return formatted_factors

    def predict(self, form_data, model_name="Random Forest", apply_thresholds=True):
        """Executes end-to-end prediction, threshold tuning, and SHAP explanations."""
        if not self.is_trained:
            self.train_and_calibrate()

        df_input, raw_clean = self._normalize_input_dict(form_data)

        # Select model
        if model_name == "Ensemble":
            # Soft voting across RF, SVM, MLP
            probs_list = []
            weights = {"Random Forest": 0.50, "SVM": 0.30, "MLP": 0.20}
            combined_prob = np.zeros(5)
            for m_name, model in self.fitted_models.items():
                p = model.predict_proba(df_input)[0]
                combined_prob += p * weights.get(m_name, 0.33)
            raw_probabilities = combined_prob
        else:
            model = self.fitted_models.get(model_name, self.fitted_models["Random Forest"])
            raw_probabilities = model.predict_proba(df_input)[0]

        # Convert to percentages summing to exactly 100%
        probs_pct = np.round(raw_probabilities * 100).astype(int).tolist()
        diff = 100 - sum(probs_pct)
        if diff != 0:
            max_idx = int(np.argmax(probs_pct))
            probs_pct[max_idx] += diff

        # Base predicted class by argmax
        predicted_class = int(np.argmax(raw_probabilities))
        threshold_applied = False

        # Apply clinical threshold tuning for classes 3 and 4 if enabled
        if apply_thresholds:
            for cls in [3, 4]:
                thresh = self.best_thresholds.get(cls, 0.5)
                if raw_probabilities[cls] >= thresh:
                    predicted_class = cls
                    threshold_applied = True

        # Generate SHAP factors
        shap_factors = self.compute_shap_factors(df_input, raw_clean, predicted_class)

        # Build distribution array
        distribution = [
            {
                "classId": i,
                "name": f"Class {i} ({CLASS_NAMES[i]})",
                "prob": probs_pct[i],
                "color": SEVERITY_CLASSES_INFO[i]["color"],
                "isTop": (i == predicted_class),
            }
            for i in range(5)
        ]

        timestamp = datetime.now().isoformat()
        pred_id = f"cs-{int(time.time() * 1000):x}-{os.urandom(2).hex()}"

        return {
            "id": pred_id,
            "timestamp": timestamp,
            "predictedClass": predicted_class,
            "severityInfo": SEVERITY_CLASSES_INFO[predicted_class],
            "probabilities": probs_pct,
            "distribution": distribution,
            "shapFactors": shap_factors,
            "patientInputs": {
                "age": raw_clean.get("age", 54),
                "sex": 1 if raw_clean.get("sex") == "Male" else 0,
                "cp": form_data.get("cp", 0),
                "trestbps": raw_clean.get("trestbps", 130),
                "chol": raw_clean.get("chol", 240),
                "fbs": 1 if raw_clean.get("fbs") is True else 0,
                "restecg": form_data.get("restecg", 0),
                "thalach": raw_clean.get("thalch", 150),
                "exang": 1 if raw_clean.get("exang") is True else 0,
                "oldpeak": raw_clean.get("oldpeak", 1.0),
                "slope": form_data.get("slope", 0),
                "ca": form_data.get("ca", 0),
                "thal": form_data.get("thal", 1),
            },
            "rawInputs": form_data,
            "modelUsed": model_name,
            "thresholdTuningApplied": threshold_applied,
            "clinicalThresholds": self.best_thresholds,
        }

    def get_model_benchmarks(self):
        """Returns comparison metrics for all trained models."""
        return {
            "models": self.metrics,
            "best_thresholds": self.best_thresholds,
            "dataset_info": self.dataset_info,
            "class_names": CLASS_NAMES,
            "severity_weights": SEV_WEIGHTS,
        }
