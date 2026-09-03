import sys
import os

# Add current dir and backend dir to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

from backend.app import app, get_engine

if __name__ == "__main__":
    print("============================================================")
    print(" CARDIOSENSE FLASK ML BACKEND SERVER")
    print(" Models: Random Forest, SVM, MLP, Ensemble")
    print(" Pipeline: Preprocessing + SMOTE + Scaling + Threshold Tuning + SHAP")
    print(" Dataset: Second_Review_Content/heart_disease_uci.csv (Heart_Disease_Severity_ML_Pipeline_fixed)")
    print("============================================================")
    get_engine()
    port = int(os.environ.get("PORT", 5000))
    print(f"\n[+] Serving API at http://127.0.0.1:{port}")
    print(f"[+] Health check: http://127.0.0.1:{port}/api/health")
    print(f"[+] Predict:      http://127.0.0.1:{port}/api/predict\n")
    app.run(host="0.0.0.0", port=port, debug=False)
