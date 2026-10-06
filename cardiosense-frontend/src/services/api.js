import axios from "axios";

// Default API base url uses relative /api for Vite proxy in development or production
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Health check to verify Flask ML backend availability
 */
export const checkBackendHealth = async () => {
  try {
    const res = await apiClient.get("/health");
    return { ok: true, data: res.data };
  } catch (error) {
    // Also try fallback direct localhost:5000 if proxy failed
    try {
      const fallbackRes = await axios.get("http://127.0.0.1:5000/api/health", { timeout: 3000 });
      return { ok: true, data: fallbackRes.data, direct: true };
    } catch {
      return { ok: false, error: error.message };
    }
  }
};

/**
 * Sends patient features to Flask ML engine for multi-class severity prediction and SHAP calculation
 */
export const predictHeartDisease = async (formData, modelName = "Random Forest", applyThresholds = true) => {
  try {
    const res = await apiClient.post("/predict", {
      formData,
      modelName,
      applyThresholds,
    });
    if (res.data && res.data.success) {
      return res.data.data;
    }
    throw new Error(res.data?.error || "Invalid response from server");
  } catch (error) {
    // Try direct localhost endpoint if proxy had an issue
    try {
      const fallbackRes = await axios.post("http://127.0.0.1:5000/api/predict", {
        formData,
        modelName,
        applyThresholds,
      }, { timeout: 8000 });
      if (fallbackRes.data && fallbackRes.data.success) {
        return fallbackRes.data.data;
      }
    } catch {
      // Re-throw original error
    }
    throw error;
  }
};

/**
 * Retrieves model benchmark comparison metrics (CV vs Holdout, F1 scores)
 */
export const getModelBenchmarks = async () => {
  try {
    const res = await apiClient.get("/models");
    if (res.data && res.data.success) {
      return res.data.data;
    }
    throw new Error("Failed to load model benchmarks");
  } catch (error) {
    try {
      const fallback = await axios.get("http://127.0.0.1:5000/api/models", { timeout: 3000 });
      if (fallback.data && fallback.data.success) {
        return fallback.data.data;
      }
    } catch {}
    throw error;
  }
};

/**
 * Retrieves pre-defined clinical sample profiles
 */
export const getSampleCases = async () => {
  try {
    const res = await apiClient.get("/sample-cases");
    if (res.data && res.data.success) {
      return res.data.data;
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Retrieves dataset stats
 */
export const getDatasetStats = async () => {
  try {
    const res = await apiClient.get("/dataset-stats");
    if (res.data && res.data.success) {
      return res.data.data;
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Converts patient inputs into a clinical narrative prompt for the Gemini assistant.
 *
 * @param {Object} patientInputs - Cleaned or raw patient inputs.
 * @returns {string} Formatted clinical prompt string.
 */
export const formatClinicalPrompt = (patientInputs) => {
  if (!patientInputs || typeof patientInputs !== "object") {
    return "Please evaluate heart disease severity patterns for this clinical case.";
  }

  const parts = [];
  if (patientInputs.age !== undefined) parts.push(`Age (age): ${patientInputs.age} years`);
  if (patientInputs.sex !== undefined) {
    const isMale = patientInputs.sex === 1 || patientInputs.sex === "1" || String(patientInputs.sex).toLowerCase() === "male";
    parts.push(`Sex (sex): ${isMale ? "1 (Male)" : "0 (Female)"}`);
  }
  if (patientInputs.cp !== undefined) {
    const cpNames = { 0: "typical angina", 1: "atypical angina", 2: "non-anginal pain", 3: "asymptomatic" };
    parts.push(`Chest pain type (cp): ${cpNames[patientInputs.cp] || patientInputs.cp} (${patientInputs.cp})`);
  }
  if (patientInputs.trestbps !== undefined) parts.push(`Resting blood pressure (trestbps): ${patientInputs.trestbps} mmHg`);
  if (patientInputs.chol !== undefined) parts.push(`Serum cholesterol (chol): ${patientInputs.chol} mg/dl`);
  if (patientInputs.fbs !== undefined) {
    const highFbs = patientInputs.fbs === 1 || patientInputs.fbs === "1" || patientInputs.fbs === true;
    parts.push(`Fasting blood sugar > 120 mg/dl (fbs): ${highFbs ? "1 (Yes)" : "0 (No)"}`);
  }
  if (patientInputs.restecg !== undefined) parts.push(`Resting ECG (restecg): ${patientInputs.restecg}`);
  if (patientInputs.thalach !== undefined || patientInputs.thalch !== undefined) {
    parts.push(`Max heart rate achieved (thalach): ${patientInputs.thalach || patientInputs.thalch} bpm`);
  }
  if (patientInputs.exang !== undefined) {
    const hasExang = patientInputs.exang === 1 || patientInputs.exang === "1" || patientInputs.exang === true;
    parts.push(`Exercise-induced angina (exang): ${hasExang ? "1 (Yes)" : "0 (No)"}`);
  }
  if (patientInputs.oldpeak !== undefined) parts.push(`ST depression (oldpeak): ${patientInputs.oldpeak} mm`);
  if (patientInputs.slope !== undefined) parts.push(`ST segment slope (slope): ${patientInputs.slope}`);
  if (patientInputs.ca !== undefined) parts.push(`Major fluoroscopy vessels (ca): ${patientInputs.ca}`);
  if (patientInputs.thal !== undefined) parts.push(`Thalassemia perfusion (thal): ${patientInputs.thal}`);

  return `Please evaluate cardiovascular risk patterns and explain the heart disease severity prediction and key contributing factors for this patient: ${parts.join(", ")}.`;
};

/**
 * Sends a message and optional conversation history to the Gemini-powered /api/chat-predict endpoint.
 *
 * @param {string} message - User query or formatted clinical parameters.
 * @param {Array} [conversationHistory=[]] - Previous conversation messages.
 * @param {Object} [patientInputs=null] - Optional verified patient input measurements.
 * @returns {Promise<Object>} Object containing success, explanation, ml_prediction, status, etc.
 */
export const requestChatPredict = async (message, conversationHistory = [], patientInputs = null) => {
  if (!message || typeof message !== "string" || !message.trim()) {
    throw new Error("Message is required and must be a non-empty string.");
  }

  const payload = {
    message: message.trim(),
    conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : [],
    patientInputs: patientInputs && typeof patientInputs === "object" ? patientInputs : undefined,
  };

  try {
    const res = await apiClient.post("/chat-predict", payload);
    if (res.data) {
      return res.data;
    }
    throw new Error("Invalid response format from chat-predict endpoint.");
  } catch (error) {
    // If the server responded with an HTTP status code (e.g. 400, 429, 500, 503),
    // the request reached the backend and was evaluated. Do NOT send a duplicate retry!
    if (error.response) {
      const respData = error.response.data || {};
      const status =
        respData.status ||
        (error.response.status === 503
          ? "service_unavailable"
          : error.response.status === 429
          ? "rate_limit_exceeded"
          : "error");
      const explanation =
        respData.explanation ||
        respData.error ||
        error.message ||
        "Could not communicate with the AI explanation service.";

      return {
        success: false,
        status: status,
        explanation: explanation,
        ml_prediction: respData.ml_prediction || null,
        tool_called: respData.tool_called || false,
        tool_status: respData.tool_status || "error",
        error: respData.error || explanation,
      };
    }

    // Only if there was NO response from the proxy (e.g. Vite proxy ECONNREFUSED)
    // attempt a single direct fallback to localhost:5000
    try {
      const fallbackRes = await axios.post("http://127.0.0.1:5000/api/chat-predict", payload, {
        timeout: 10000,
        headers: { "Content-Type": "application/json" },
      });
      if (fallbackRes.data) {
        return fallbackRes.data;
      }
    } catch (fallbackError) {
      const respData = fallbackError.response?.data || {};
      const status =
        respData.status ||
        (fallbackError.response?.status === 503
          ? "service_unavailable"
          : fallbackError.response?.status === 429
          ? "rate_limit_exceeded"
          : "network_error");
      const explanation =
        respData.explanation ||
        respData.error ||
        fallbackError.message ||
        error.message ||
        "Could not communicate with the AI explanation service.";

      return {
        success: false,
        status: status,
        explanation: explanation,
        ml_prediction: respData.ml_prediction || null,
        tool_called: respData.tool_called || false,
        tool_status: respData.tool_status || "error",
        error: respData.error || explanation,
      };
    }

    return {
      success: false,
      status: "error",
      explanation: error.message || "Could not communicate with the AI explanation service.",
      ml_prediction: null,
      tool_called: false,
      tool_status: "error",
      error: error.message || "Unknown error",
    };
  }
};

