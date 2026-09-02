import { calculatePrediction } from "../utils/predictionEngine";

/**
 * Pre-computed sample cases for instant demonstration and testing.
 */

export const SAMPLE_INPUTS = {
  moderate: {
    age: 58,
    sex: 1, // Male
    cp: 2,  // Non-anginal discomfort
    exang: 1, // Yes
    fbs: 0, // <= 120
    trestbps: 148,
    chol: 265,
    thalach: 138,
    restecg: 1, // ST-T abnormality
    oldpeak: 1.8,
    slope: 1, // Flat
    ca: 1,
    thal: 2, // Fixed defect
  },
  healthy: {
    age: 38,
    sex: 0, // Female
    cp: 0,  // No pain
    exang: 0, // No
    fbs: 0, // No
    trestbps: 115,
    chol: 175,
    thalach: 168,
    restecg: 0, // Normal
    oldpeak: 0.2,
    slope: 0, // Upsloping
    ca: 0,
    thal: 1, // Normal
  },
  severe: {
    age: 67,
    sex: 1,
    cp: 3,  // Asymptomatic
    exang: 1,
    fbs: 1,
    trestbps: 165,
    chol: 290,
    thalach: 118,
    restecg: 2, // LVH
    oldpeak: 2.8,
    slope: 2, // Downsloping
    ca: 2,
    thal: 3, // Reversible defect
  },
};

export const DEMO_PREDICTION = calculatePrediction(SAMPLE_INPUTS.moderate);
export const HEALTHY_PREDICTION = calculatePrediction(SAMPLE_INPUTS.healthy);
export const SEVERE_PREDICTION = calculatePrediction(SAMPLE_INPUTS.severe);
