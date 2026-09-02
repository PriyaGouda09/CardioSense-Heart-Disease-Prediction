# CardioSense — Heart Disease Severity Prediction Demo

CardioSense is an educational and research demonstration web application that predicts heart disease severity patterns (Class 0–4) from clinical inputs and provides transparent, explainable feature attribution using SHAP (SHapley Additive exPlanations) values.

> **Disclaimer:** CardioSense is an educational demo and does not provide medical diagnosis. Always consult a qualified healthcare professional.

---

## 🚀 Quick Start in VS Code

### 1. Open in VS Code
Open VS Code, select **File > Open Folder...**, and select the `cardiosense-frontend` directory.

### 2. Install Dependencies
In the VS Code terminal (`Ctrl + ~` or ``Ctrl + ` ``):
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```

Open your browser and visit:
```
http://localhost:5173/
```

---

## 📁 Project Structure

```
cardiosense-frontend/
├── index.html                   # HTML entrypoint with Sora & Inter Google Fonts
├── tailwind.config.js           # Design system tokens (Medical teal #0F7A6B, severity scale #2FA37A - #B84C4C)
├── vite.config.js               # Vite configuration
├── src/
│   ├── main.jsx                 # Application entrypoint with Router & Contexts
│   ├── App.jsx                  # Route definitions
│   ├── index.css                # Global styles, variables, pulsing animation
│   ├── context/
│   │   ├── AuthContext.jsx      # Authentication & guest session management
│   │   └── PredictionContext.jsx # Calculation engine & history storage
│   ├── pages/
│   │   ├── DashboardPage.jsx    # 4-step health data input wizard with loading animation
│   │   ├── ResultsPage.jsx      # Recharts probability spread & SHAP diverging chart
│   │   ├── ReviewsPage.jsx      # Anonymized community reviews & doctor confirmation tags
│   │   ├── AboutPage.jsx        # Model architecture, UCI dataset, performance & limitations
│   │   └── LoginPage.jsx        # Segmented Log In / Sign Up with Yup validation
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx       # Top navigation & user profile dropdown
│   │   │   ├── Footer.jsx       # Persistent educational disclaimer banner
│   │   │   └── Layout.jsx       # Layout wrapper
│   │   ├── ui/
│   │   │   ├── Button.jsx       # Standard buttons with loading states
│   │   │   ├── Card.jsx         # Rounded-xl cards with soft shadows
│   │   │   ├── Input.jsx        # Accessible input with inline validation
│   │   │   ├── Select.jsx       # Accessible select component
│   │   │   ├── Badge.jsx        # Severity pills (Class 0–4)
│   │   │   ├── Tooltip.jsx      # Plain-language medical tooltips
│   │   │   ├── ProgressStepper.jsx # 4-step progress indicator
│   │   │   ├── Modal.jsx        # Accessible dialog wrapper
│   │   │   ├── Skeleton.jsx     # Shimmer loading placeholders
│   │   │   └── RangeGauge.jsx   # Visual gauges vs clinical reference ranges
│   │   └── reviews/
│   │       └── ReviewModal.jsx  # "Share your experience" feedback modal
│   ├── data/
│   │   ├── mockReviews.js       # Anonymized community reviews dataset
│   │   └── samplePredictions.js # Demo case presets (Low Risk, Moderate, Severe)
│   └── utils/
│       ├── severityUtils.js     # 5-tier severity color scale & copy
│       └── predictionEngine.js  # Prediction heuristic & SHAP generator
```

---

## 🎨 Design System

- **Primary Color**: Medical Teal (`#0F7A6B`)
- **Severity Colors**:
  - Class 0 (No Disease): `#2FA37A` (Soft Green)
  - Class 1 (Mild): `#7BB661` (Yellow-Green)
  - Class 2 (Moderate): `#E0A63C` (Amber)
  - Class 3 (Severe): `#D9713C` (Soft Orange-Red)
  - Class 4 (Very Severe): `#B84C4C` (Muted Red)
- **Typography**: Headings: *Sora*, Body: *Inter*, Mono: *IBM Plex Mono*
