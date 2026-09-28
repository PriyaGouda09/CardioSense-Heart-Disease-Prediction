/**
 * Utility functions and constants for CardioSense severity classes (0 to 4).
 * Always adhere to calm, non-alarmist phrasing.
 */

export const SEVERITY_CLASSES = {
  0: {
    id: 0,
    label: "No Disease",
    badgeLabel: "Class 0 — No Disease",
    color: "#2FA37A",
    bgClass: "bg-[#EBF7F2] text-[#1B6F52] border-[#B9E5D4]",
    lightBg: "#EBF7F2",
    textColor: "#1B6F52",
    borderColor: "#B9E5D4",
    headline: "Your inputs suggest a pattern consistent with No Disease",
    summary: "Your entered vitals and symptoms align closely with typical reference patterns.",
    guidance: "Maintaining a balanced diet, regular physical activity, and routine annual wellness checks can help preserve strong cardiovascular health.",
  },
  1: {
    id: 1,
    label: "Mild",
    badgeLabel: "Class 1 — Mild",
    color: "#7BB661",
    bgClass: "bg-[#F3F9EE] text-[#487332] border-[#C8E5B8]",
    lightBg: "#F3F9EE",
    textColor: "#487332",
    borderColor: "#C8E5B8",
    headline: "Your inputs suggest a pattern more consistent with Mild severity",
    summary: "Certain measurements show minor variations compared to typical baseline reference data.",
    guidance: "Consider reviewing your lifestyle habits and discussing these mild indicators at your next scheduled appointment with a primary care provider.",
  },
  2: {
    id: 2,
    label: "Moderate",
    badgeLabel: "Class 2 — Moderate",
    color: "#E0A63C",
    bgClass: "bg-[#FCF7EB] text-[#8C5E13] border-[#F5DC9E]",
    lightBg: "#FCF7EB",
    textColor: "#8C5E13",
    borderColor: "#F5DC9E",
    headline: "Your inputs suggest a pattern more consistent with Moderate severity",
    summary: "Several key markers, such as blood pressure or cholesterol trends, show moderate elevation.",
    guidance: "Sharing these findings with a qualified healthcare provider can help determine if proactive lifestyle adjustments or targeted checks are beneficial.",
  },
  3: {
    id: 3,
    label: "Severe",
    badgeLabel: "Class 3 — Severe",
    color: "#D9713C",
    bgClass: "bg-[#FDF3ED] text-[#8F3D14] border-[#F6C8AF]",
    lightBg: "#FDF3ED",
    textColor: "#8F3D14",
    borderColor: "#F6C8AF",
    headline: "Your inputs suggest a pattern more consistent with Severe severity",
    summary: "Multiple cardiovascular factors combine to indicate elevated patterns in the reference model.",
    guidance: "These patterns are worth discussing with a doctor soon. A comprehensive clinical evaluation (e.g. ECG, standard lab panels) will provide clear context.",
  },
  4: {
    id: 4,
    label: "Very Severe",
    badgeLabel: "Class 4 — Very Severe",
    color: "#B84C4C",
    bgClass: "bg-[#FBF0F0] text-[#7A2828] border-[#F1BCBC]",
    lightBg: "#FBF0F0",
    textColor: "#7A2828",
    borderColor: "#F1BCBC",
    headline: "Your inputs suggest a pattern more consistent with Very Severe severity",
    summary: "Multiple indicators strongly align with complex cardiovascular patterns in the training dataset.",
    guidance: "We recommend scheduling a clinical consultation with your physician or cardiologist in the near term for a professional checkup and guidance.",
  },
};

export const getSeverityInfo = (classId) => {
  const numericId = parseInt(classId, 10);
  return SEVERITY_CLASSES[numericId] || SEVERITY_CLASSES[2];
};

export const CLINICAL_REFERENCE_RANGES = {
  trestbps: {
    label: "Resting Blood Pressure",
    unit: "mmHg",
    min: 70,
    max: 200,
    healthyMin: 90,
    healthyMax: 120,
    description:
      "Normal adult systolic blood pressure is below 120 mmHg. Values of 120 mmHg or higher may require further interpretation based on the full blood pressure reading.",
  },

  chol: {
    label: "Total Serum Cholesterol",
    unit: "mg/dL",
    min: 100,
    max: 500,
    healthyMin: 125,
    healthyMax: 200,
    description:
      "A total cholesterol level below 200 mg/dL is commonly used as a desirable reference value. Individual cardiovascular risk should be interpreted using the complete lipid profile and other risk factors.",
  },

  thalach: {
    label: "Max Heart Rate Achieved",
    unit: "bpm",
    min: 60,
    max: 220,
    healthyMin: 100,
    healthyMax: 190,
    description:
      "Maximum heart rate varies with age. A commonly used estimate is approximately 220 minus age, so there is no single universal healthy maximum-heart-rate range for all adults.",
  },

  oldpeak: {
    label: "ST Depression (Oldpeak)",
    unit: "mm",
    min: 0,
    max: 6.5,
    healthyMin: 0,
    healthyMax: 1,
    description:
      "ST-segment depression is an ECG finding that requires clinical interpretation. Lower values generally indicate less ST depression, but this measure should not be interpreted independently.",
  },
};

