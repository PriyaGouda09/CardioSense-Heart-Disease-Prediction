import subprocess
import sys
import os
import time
import webbrowser

def main():
    root_dir = os.path.abspath(os.path.dirname(__file__))
    frontend_dir = os.path.join(root_dir, "cardiosense-frontend")
    
    print("==================================================================")
    print(" CARDIOSENSE: AI-Powered Heart Disease Severity System")
    print(" Frontend: React + Vite (http://localhost:5173)")
    print(" Backend:  Flask ML Pipeline (http://127.0.0.1:5000)")
    print(" Dataset:  First_Review_Content/heart_disease_uci.csv")
    print("==================================================================")
    
    # 1. Start Flask ML Backend
    print("\n[1/2] Launching Flask ML Backend Server...")
    backend_proc = subprocess.Popen(
        [sys.executable, "run_backend.py"],
        cwd=root_dir
    )
    
    time.sleep(3)
    
    # 2. Start Vite Frontend
    print("[2/2] Launching CardioSense Frontend Dev Server...")
    frontend_proc = subprocess.Popen(
        ["npm.cmd" if os.name == "nt" else "npm", "run", "dev"],
        cwd=frontend_dir
    )
    
    time.sleep(2)
    print("\n[+] Both servers are running!")
    print("[+] Opening http://localhost:5173 in browser...\n")
    try:
        webbrowser.open("http://localhost:5173")
    except Exception:
        pass
        
    print("Press Ctrl+C to terminate both servers.")
    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\n[!] Shutting down servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("[OK] Done.")

if __name__ == "__main__":
    main()
