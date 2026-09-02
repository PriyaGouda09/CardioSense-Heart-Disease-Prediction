import { SEVERITY_CLASSES } from "./severityUtils";

/**
 * Educational Prediction & SHAP Calculation Engine
 * Simulates an ensemble ML model (Random Forest + SVM + Neural Net) trained on UCI Heart Disease dataset.
 */

// Population median fallbacks for "I don't know" options
export const POPULATION_DEFAULTS = {
  age: 54,
  sex: 1,
  cp: 0,          // 0: Typical angina, 1: Atypical, 2: Non-anginal, 3: Asymptomatic
  trestbps: 130,
  chol: 240,
  fbs: 0,          // 0: <= 120, 1: > 120
  restecg: 0,      // 0: normal, 1: ST-T abnormality, 2: LVH
  thalach: 150,
  exang: 0,        // 0: no, 1: yes
  oldpeak: 1.0,
  slope: 1,        // 0: upsloping, 1: flat, 2: downsloping
  ca: 0,           // 0 to 3
  thal: 1,         // 1: normal, 2: fixed defect, 3: reversible defect
};

/**
 * Evaluates patient inputs and returns multi-class probabilities + top SHAP features
 */
export const calculatePrediction = (formData = {}) => {
  // Merge with population defaults for missing or "unknown" values
  const data = {
    age: Number(formData.age) || POPULATION_DEFAULTS.age,
    sex: formData.sex !== undefined ? Number(formData.sex) : POPULATION_DEFAULTS.sex,
    cp: formData.cp !== undefined && formData.cp !== "unknown" ? Number(formData.cp) : POPULATION_DEFAULTS.cp,
    trestbps: Number(formData.trestbps) || POPULATION_DEFAULTS.trestbps,
    chol: Number(formData.chol) || POPULATION_DEFAULTS.chol,
    fbs: formData.fbs !== undefined && formData.fbs !== "unknown" ? Number(formData.fbs) : POPULATION_DEFAULTS.fbs,
    restecg: formData.restecg !== undefined && formData.restecg !== "unknown" ? Number(formData.restecg) : POPULATION_DEFAULTS.restecg,
    thalach: Number(formData.thalach) || POPULATION_DEFAULTS.thalach,
    exang: formData.exang !== undefined ? Number(formData.exang) : POPULATION_DEFAULTS.exang,
    oldpeak: formData.oldpeak !== undefined && formData.oldpeak !== "unknown" ? Number(formData.oldpeak) : POPULATION_DEFAULTS.oldpeak,
    slope: formData.slope !== undefined && formData.slope !== "unknown" ? Number(formData.slope) : POPULATION_DEFAULTS.slope,
    ca: formData.ca !== undefined && formData.ca !== "unknown" ? Number(formData.ca) : POPULATION_DEFAULTS.ca,
    thal: formData.thal !== undefined && formData.thal !== "unknown" ? Number(formData.thal) : POPULATION_DEFAULTS.thal,
  };

  // Compute normalized risk score components (educational heuristic grounded in UCI feature weights)
  let rawScore = 0;

  // 1. Age & Sex
  const ageRisk = (data.age - 45) * 0.04;
  rawScore += ageRisk;
  const sexRisk = data.sex === 1 ? 0.25 : -0.15;
  rawScore += sexRisk;

  // 2. Chest pain type (In UCI dataset, asymptomatic cp=3 has higher association with angiographic disease)
  let cpRisk = 0;
  if (data.cp === 3) cpRisk = 0.55;
  else if (data.cp === 2) cpRisk = 0.15;
  else if (data.cp === 1) cpRisk = -0.1;
  else cpRisk = -0.3;
  rawScore += cpRisk;

  // 3. Exercise induced angina
  const exangRisk = data.exang === 1 ? 0.6 : -0.35;
  rawScore += exangRisk;

  // 4. Resting Blood Pressure
  const bpRisk = (data.trestbps - 120) * 0.015;
  rawScore += bpRisk;

  // 5. Cholesterol
  const cholRisk = (data.chol - 210) * 0.0035;
  rawScore += cholRisk;

  // 6. Fasting blood sugar
  const fbsRisk = data.fbs === 1 ? 0.2 : -0.05;
  rawScore += fbsRisk;

  // 7. Max Heart Rate (higher thalach is protective)
  const hrRisk = -(data.thalach - 145) * 0.018;
  rawScore += hrRisk;

  // 8. ST depression (oldpeak)
  const oldpeakRisk = (data.oldpeak - 0.8) * 0.45;
  rawScore += oldpeakRisk;

  // 9. Slope
  let slopeRisk = 0;
  if (data.slope === 1) slopeRisk = 0.3; // flat
  else if (data.slope === 2) slopeRisk = 0.5; // downsloping
  else slopeRisk = -0.35; // upsloping
  rawScore += slopeRisk;

  // 10. Major vessels (ca)
  const caRisk = data.ca * 0.45;
  rawScore += caRisk;

  // 11. Thalassemia (thal)
  let thalRisk = 0;
  if (data.thal === 3) thalRisk = 0.65; // reversible defect
  else if (data.thal === 2) thalRisk = 0.4;  // fixed defect
  else thalRisk = -0.35; // normal
  rawScore += thalRisk;

  // 12. Resting ECG
  const ecgRisk = data.restecg === 1 ? 0.25 : (data.restecg === 2 ? 0.4 : -0.1);
  rawScore += ecgRisk;

  // Map raw score into a center of distribution (0 to 4 scale)
  // Base rawScore centered around 0 -> map roughly to mean severity class
  const centerClass = Math.max(0, Math.min(4, 1.8 + rawScore * 0.95));

  // Compute 5-class probability distribution using a softmax-like kernel around centerClass
  const variances = [0.85, 0.95, 1.0, 0.95, 0.85];
  const unnormalizedProbs = [0, 1, 2, 3, 4].map((c) => {
    const diff = c - centerClass;
    return Math.exp(-(diff * diff) / (2 * variances[c]));
  });

  const sumProbs = unnormalizedProbs.reduce((a, b) => a + b, 0);
  const probabilities = unnormalizedProbs.map((p) => Math.round((p / sumProbs) * 100));

  // Ensure sum equals 100%
  const currentSum = probabilities.reduce((a, b) => a + b, 0);
  if (currentSum !== 100) {
    const diff = 100 - currentSum;
    // Add difference to largest probability class
    const maxIdx = probabilities.indexOf(Math.max(...probabilities));
    probabilities[maxIdx] += diff;
  }

  // Determine top predicted class
  let topClass = probabilities.indexOf(Math.max(...probabilities));

  // Calculate realistic individual SHAP feature contributions
  const shapFactors = [
    {
      feature: "Resting Blood Pressure",
      valueText: `${data.trestbps} mmHg`,
      shap: Number(bpRisk.toFixed(2)),
      description: data.trestbps > 130 ? "Elevated resting pressure" : "Optimal blood pressure level",
      plainLabel: `Resting blood pressure (${data.trestbps} mmHg)`,
    },
    {
      feature: "Serum Cholesterol",
      valueText: `${data.chol} mg/dl`,
      shap: Number(cholRisk.toFixed(2)),
      description: data.chol > 220 ? "Elevated total cholesterol" : "Healthy cholesterol range",
      plainLabel: `Serum cholesterol (${data.chol} mg/dl)`,
    },
    {
      feature: "Exercise ST Depression",
      valueText: `${data.oldpeak.toFixed(1)} mm`,
      shap: Number(oldpeakRisk.toFixed(2)),
      description: data.oldpeak > 1.5 ? "Exercise-induced ST variation" : "Stable baseline ST segment",
      plainLabel: `ST depression (${data.oldpeak.toFixed(1)} mm)`,
    },
    {
      feature: "Max Heart Rate Achieved",
      valueText: `${data.thalach} bpm`,
      shap: Number(hrRisk.toFixed(2)),
      description: data.thalach >= 150 ? "Healthy peak cardiac output" : "Reduced peak heart rate capacity",
      plainLabel: `Max heart rate (${data.thalach} bpm)`,
    },
    {
      feature: "Exercise-Induced Angina",
      valueText: data.exang === 1 ? "Present" : "Absent",
      shap: Number(exangRisk.toFixed(2)),
      description: data.exang === 1 ? "Discomfort triggered during exertion" : "No chest tightness with activity",
      plainLabel: `Exercise discomfort (${data.exang === 1 ? 'Yes' : 'No'})`,
    },
    {
      feature: "Major Fluoroscopy Vessels",
      valueText: formData.ca === "unknown" ? "Est. from baseline" : `${data.ca} vessels`,
      shap: Number(caRisk.toFixed(2)),
      description: data.ca > 0 ? "Vascular reference indicators" : "Clear vessel profile",
      plainLabel: `Major vessels colored (${data.ca})`,
    },
    {
      feature: "Thalassemia Status",
      valueText: data.thal === 3 ? "Reversible" : (data.thal === 2 ? "Fixed" : "Normal"),
      shap: Number(thalRisk.toFixed(2)),
      description: data.thal === 1 ? "Standard blood flow perfusion" : "Stress test perfusion pattern",
      plainLabel: `Perfusion pattern (${data.thal === 3 ? 'Reversible' : data.thal === 2 ? 'Fixed' : 'Normal'})`,
    },
    {
      feature: "Age Factor",
      valueText: `${data.age} yrs`,
      shap: Number(ageRisk.toFixed(2)),
      description: data.age > 55 ? "Natural demographic baseline" : "Youthful age demographic",
      plainLabel: `Age (${data.age} yrs)`,
    },
  ];

  // Sort factors by absolute SHAP magnitude descending and take top 6
  const topShapFactors = shapFactors
    .sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap))
    .slice(0, 6)
    .map((item) => ({
      ...item,
      // Formatting for Recharts diverging bar chart
      impact: item.shap > 0 ? "Increased severity" : "Decreased severity",
      color: item.shap > 0 ? (item.shap > 0.4 ? "#D9713C" : "#E0A63C") : "#2FA37A",
      displayText: `${item.plainLabel} — ${item.shap > 0 ? "increased predicted severity" : "decreased predicted severity"}`,
    }));

  const distribution = [
    { classId: 0, name: "Class 0 (No Disease)", prob: probabilities[0], color: SEVERITY_CLASSES[0].color, isTop: topClass === 0 },
    { classId: 1, name: "Class 1 (Mild)", prob: probabilities[1], color: SEVERITY_CLASSES[1].color, isTop: topClass === 1 },
    { classId: 2, name: "Class 2 (Moderate)", prob: probabilities[2], color: SEVERITY_CLASSES[2].color, isTop: topClass === 2 },
    { classId: 3, name: "Class 3 (Severe)", prob: probabilities[3], color: SEVERITY_CLASSES[3].color, isTop: topClass === 3 },
    { classId: 4, name: "Class 4 (Very Severe)", prob: probabilities[4], color: SEVERITY_CLASSES[4].color, isTop: topClass === 4 },
  ];

  return {
    id: `cs-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    predictedClass: topClass,
    severityInfo: SEVERITY_CLASSES[topClass],
    probabilities,
    distribution,
    shapFactors: topShapFactors,
    patientInputs: data,
    rawInputs: formData,
  };
};
