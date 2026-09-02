import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { calculatePrediction } from "../utils/predictionEngine";
import { DEMO_PREDICTION, HEALTHY_PREDICTION, SEVERE_PREDICTION } from "../data/samplePredictions";
import { checkBackendHealth, predictHeartDisease } from "../services/api";

const PredictionContext = createContext(null);

export const PredictionProvider = ({ children }) => {
  const [currentPrediction, setCurrentPrediction] = useState(() => {
    try {
      const saved = localStorage.getItem("cardiosense_current_prediction");
      return saved ? JSON.parse(saved) : DEMO_PREDICTION;
    } catch {
      return DEMO_PREDICTION;
    }
  });

  const [predictionHistory, setPredictionHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("cardiosense_prediction_history");
      return saved ? JSON.parse(saved) : [DEMO_PREDICTION, HEALTHY_PREDICTION, SEVERE_PREDICTION];
    } catch {
      return [DEMO_PREDICTION, HEALTHY_PREDICTION, SEVERE_PREDICTION];
    }
  });

  const [backendStatus, setBackendStatus] = useState("checking"); // "checking" | "connected" | "offline"
  const [backendInfo, setBackendInfo] = useState(null);
  const [selectedModel, setSelectedModel] = useState("Random Forest");
  const [applyThresholds, setApplyThresholds] = useState(true);

  // Check Flask ML Backend health on mount and periodically
  const pingBackend = useCallback(async () => {
    try {
      const res = await checkBackendHealth();
      if (res.ok && res.data && res.data.status === "healthy") {
        setBackendStatus("connected");
        setBackendInfo(res.data);
      } else {
        setBackendStatus("offline");
      }
    } catch {
      setBackendStatus("offline");
    }
  }, []);

  useEffect(() => {
    pingBackend();
    const interval = setInterval(pingBackend, 15000);
    return () => clearInterval(interval);
  }, [pingBackend]);

  useEffect(() => {
    if (currentPrediction) {
      localStorage.setItem("cardiosense_current_prediction", JSON.stringify(currentPrediction));
    }
  }, [currentPrediction]);

  useEffect(() => {
    localStorage.setItem("cardiosense_prediction_history", JSON.stringify(predictionHistory));
  }, [predictionHistory]);

  const generatePrediction = async (formData, modelOverride, thresholdsOverride) => {
    const modelToUse = modelOverride || selectedModel;
    const thresholdsToUse = thresholdsOverride !== undefined ? thresholdsOverride : applyThresholds;

    let result = null;

    // 1. Try Flask ML Backend
    if (backendStatus === "connected" || backendStatus === "checking") {
      try {
        result = await predictHeartDisease(formData, modelToUse, thresholdsToUse);
      } catch (error) {
        console.warn("Backend prediction request failed, falling back to local engine:", error);
      }
    }

    // 2. Fallback to client-side heuristic engine if backend was unavailable
    if (!result) {
      result = calculatePrediction(formData);
      result.modelUsed = "Client Heuristic Fallback (Offline Mode)";
    }

    setCurrentPrediction(result);
    setPredictionHistory((prev) => [result, ...prev.filter((p) => p.id !== result.id)]);
    return result;
  };

  const getPredictionById = (id) => {
    // Explicit demo preset requests
    if (id === "healthy") return HEALTHY_PREDICTION;
    if (id === "severe") return SEVERE_PREDICTION;
    if (id === "moderate") return DEMO_PREDICTION;

    // Search for specific assessment ID in history
    if (id && id !== "demo" && id !== "latest" && id !== "current") {
      const found = predictionHistory.find((p) => p.id === id);
      if (found) return found;
    }

    // Always prioritize the user's actual generated prediction
    if (currentPrediction) {
      return currentPrediction;
    }

    // Fallback only if no prediction has ever been made
    return DEMO_PREDICTION;
  };

  return (
    <PredictionContext.Provider
      value={{
        currentPrediction,
        predictionHistory,
        generatePrediction,
        getPredictionById,
        setCurrentPrediction,
        backendStatus,
        backendInfo,
        selectedModel,
        setSelectedModel,
        applyThresholds,
        setApplyThresholds,
        pingBackend,
      }}
    >
      {children}
    </PredictionContext.Provider>
  );
};

export const usePrediction = () => {
  const context = useContext(PredictionContext);
  if (!context) {
    throw new Error("usePrediction must be used within a PredictionProvider");
  }
  return context;
};
