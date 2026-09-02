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
