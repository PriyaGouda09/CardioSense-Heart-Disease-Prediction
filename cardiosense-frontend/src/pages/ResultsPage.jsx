import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  Info,
  Bookmark,
  RotateCcw,
  MessageSquarePlus,
  AlertTriangle,
  Printer,
  Calendar,
  Layers,
  Sparkles,
  Bot,
  RefreshCw,
  Send,
  AlertCircle,
  Clock,
} from "lucide-react";
import { usePrediction } from "../context/PredictionContext";
import { useAuth } from "../context/AuthContext";
import { getSeverityInfo } from "../utils/severityUtils";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Tooltip } from "../components/ui/Tooltip";
import { RangeGauge } from "../components/ui/RangeGauge";
import { ReviewModal } from "../components/reviews/ReviewModal";
import { requestChatPredict, formatClinicalPrompt } from "../services/api";

// Custom Tooltip for Probability Distribution Bar Chart
const CustomProbTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-text-primary text-white p-3 rounded-lg shadow-lg text-xs space-y-1">
        <div className="font-semibold text-primary-200 font-heading">
          {data.name}
        </div>
        <div className="text-sm font-mono-val font-bold">
          Probability: {data.prob}%
        </div>
        {data.isTop && (
          <div className="text-[11px] text-emerald-400 font-medium">
            ★ Highest estimated likelihood
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Diverging SHAP Bar Chart
const CustomShapTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-text-primary text-white p-3 rounded-lg shadow-lg text-xs space-y-1 max-w-xs">
        <div className="font-semibold text-primary-200 font-heading">
          {item.feature} ({item.valueText})
        </div>
        <div className="text-sm font-mono-val font-bold">
          Attribution Score: {item.shap > 0 ? `+${item.shap}` : item.shap}
        </div>
        <div className="text-[11px] text-slate-200 leading-relaxed">
          {item.description}
        </div>
        <div className="text-[10px] text-slate-400 italic pt-0.5">
          {item.shap > 0 ? "Increased predicted severity" : "Decreased predicted severity"}
        </div>
      </div>
    );
  }
  return null;
};

export const ResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPredictionById, updatePredictionExplanation } = usePrediction();
  const { isLoggedIn, isGuest, savePredictionToAccount } = useAuth();


  const [savedSuccess, setSavedSuccess] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Retrieve prediction result (or fallback to demo/healthy/severe presets)
  const result = getPredictionById(id);
  const severity = getSeverityInfo(result.predictedClass);

  // Gemini AI Explanation State
  const [llmExplanation, setLlmExplanation] = useState(result?.llmExplanation || "");
  const [llmStatus, setLlmStatus] = useState(result?.llmExplanation ? "success" : "idle"); // idle | loading | success | missing_inputs | api_key_missing | service_unavailable | rate_limit_exceeded | error
  const [llmError, setLlmError] = useState(null);
  const [missingFields, setMissingFields] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);
  const [followUpHistory, setFollowUpHistory] = useState([]);
  const hasRequestedRef = useRef(null);
  const mountedRef = useRef(true);

  const [prevResultId, setPrevResultId] = useState(result?.id);

  if (result?.id !== prevResultId) {
    setPrevResultId(result?.id);
    setLlmExplanation(result?.llmExplanation || "");
    setLlmStatus(result?.llmExplanation ? "success" : "idle");
    setLlmError(null);
    setFollowUpHistory([]);
  }

  // Track component mounted status across render/remount cycles
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Fetch explanation when prediction is loaded, avoiding duplicate calls
  useEffect(() => {
    if (!result?.patientInputs) return;

    // Use cached explanation if already present on the prediction object
    if (result.llmExplanation) {
      return;
    }

    // Prevent duplicate request for the same prediction id during mount
    if (hasRequestedRef.current === result.id) {
      return;
    }

    hasRequestedRef.current = result.id;
    setLlmStatus("loading");
    setLlmExplanation("");
    setFollowUpHistory([]);
    setLlmError(null);

    const clinicalPrompt = formatClinicalPrompt(result.patientInputs);

    requestChatPredict(clinicalPrompt, [], result.patientInputs)
      .then((res) => {
        if (!mountedRef.current) return;
        if (res.success && res.explanation) {
          setLlmExplanation(res.explanation);
          setLlmStatus(res.status || "success");
          if (updatePredictionExplanation) {
            updatePredictionExplanation(result.id, res.explanation);
          }
          if (res.conversation_history) {
            setConversationHistory(res.conversation_history);
          }
        } else if (res.status === "missing_inputs") {
          setLlmStatus("missing_inputs");
          setMissingFields(res.tool_result?.missing_fields || []);
          setLlmExplanation(res.explanation || "Certain clinical measurements are missing.");
        } else if (res.status === "api_key_missing") {
          setLlmStatus("api_key_missing");
          setLlmExplanation(res.explanation || "Gemini API key is not configured.");
        } else if (res.status === "service_unavailable") {
          setLlmStatus("service_unavailable");
          setLlmExplanation(
            res.explanation ||
              "The Gemini model is currently experiencing high demand. Please try again in a few moments."
          );
        } else if (res.status === "rate_limit_exceeded") {
          setLlmStatus("rate_limit_exceeded");
          setLlmExplanation(
            res.explanation ||
              "The Gemini API rate limit has been reached. Please wait a moment before trying again."
          );
        } else {
          setLlmStatus("error");
          setLlmError(res.error || res.explanation || "Unable to generate AI explanation.");
        }
      })
      .catch((err) => {
        if (!mountedRef.current) return;
        setLlmStatus("error");
        setLlmError(err.message || "Failed to communicate with AI explanation service.");
      });
  }, [result?.id, result?.llmExplanation, result?.patientInputs, updatePredictionExplanation]);

  const handleRetryExplanation = async () => {
    hasRequestedRef.current = null;
    setLlmStatus("loading");
    setLlmError(null);

    const clinicalPrompt = formatClinicalPrompt(result.patientInputs);
    try {
      const res = await requestChatPredict(clinicalPrompt, [], result.patientInputs);
      if (!mountedRef.current) return;
      if (res.success && res.explanation) {
        setLlmExplanation(res.explanation);
        setLlmStatus(res.status || "success");
        if (updatePredictionExplanation) {
          updatePredictionExplanation(result.id, res.explanation);
        }
        if (res.conversation_history) {
          setConversationHistory(res.conversation_history);
        }
      } else if (res.status === "missing_inputs") {
        setLlmStatus("missing_inputs");
        setMissingFields(res.tool_result?.missing_fields || []);
        setLlmExplanation(res.explanation);
      } else if (res.status === "api_key_missing") {
        setLlmStatus("api_key_missing");
        setLlmExplanation(res.explanation);
      } else if (res.status === "service_unavailable") {
        setLlmStatus("service_unavailable");
        setLlmExplanation(
          res.explanation ||
            "The Gemini model is currently experiencing high demand. Please try again in a few moments."
        );
      } else if (res.status === "rate_limit_exceeded") {
        setLlmStatus("rate_limit_exceeded");
        setLlmExplanation(
          res.explanation ||
            "The Gemini API rate limit has been reached. Please wait a moment before trying again."
        );
      } else {
        setLlmStatus("error");
        setLlmError(res.error || res.explanation || "Unable to generate AI explanation.");
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setLlmStatus("error");
      setLlmError(err.message || "Failed to communicate with AI explanation service.");
    }
  };

  const handleSendFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpQuestion.trim() || isSendingFollowUp) return;

    const userQ = followUpQuestion.trim();
    setFollowUpQuestion("");
    setIsSendingFollowUp(true);

    const newHistory = [
      ...conversationHistory,
      { role: "user", content: userQ },
    ];

    try {
      const res = await requestChatPredict(userQ, newHistory, result?.patientInputs);
      if (res.success && res.explanation) {
        setFollowUpHistory((prev) => [
          ...prev,
          { question: userQ, answer: res.explanation },
        ]);
        if (res.conversation_history) {
          setConversationHistory(res.conversation_history);
        }
      } else {
        setFollowUpHistory((prev) => [
          ...prev,
          { question: userQ, answer: res.error || "Could not process your question at this moment." },
        ]);
      }
    } catch (err) {
      setFollowUpHistory((prev) => [
        ...prev,
        { question: userQ, answer: err.message || "Error communicating with AI service." },
      ]);
    } finally {
      setIsSendingFollowUp(false);
    }
  };

  const formattedDate = new Date(result.timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });


  const handleSaveToAccount = () => {
    if (!isLoggedIn || isGuest) {
      navigate("/login");
      return;
    }
    savePredictionToAccount(result);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (

    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 print-page">
      {/* 1. HEADLINE RESULT CARD (Top, Full-Width, Elevated) */}
      <section>
        <Card
          padding="p-6 sm:p-8"
          className="shadow-md border-border relative overflow-hidden"
          style={{
            borderLeftWidth: "6px",
            borderLeftColor: severity.color,
          }}
        >
          {/* Subtle colored background wash */}
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full -mr-20 -mt-20 pointer-events-none opacity-20 blur-2xl"
            style={{ backgroundColor: severity.color }}
          />

          <div className="relative space-y-4">
            {/* Top row with Badge and Timestamp */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge severityClass={result.predictedClass} size="lg">
                  {severity.badgeLabel}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Calendar className="w-3.5 h-3.5" />
                <span>Generated {formattedDate}</span>
              </div>
            </div>

            {/* Supportive, Non-Alarmist Headline Copy */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary tracking-tight">
                {severity.headline}
              </h1>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                {severity.summary}
              </p>
            </div>

            {/* Non-Diagnosis Disclaimer Notice */}
            <div className="pt-2 flex items-start gap-2 text-xs text-text-muted border-t border-border/80">
              <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>Educational note:</strong> This analysis reflects cardiovascular pattern indicators and is not a medical diagnosis. Please consult a qualified healthcare professional to evaluate your cardiac health.
              </span>
            </div>
          </div>
        </Card>
      </section>

      {/* 2. AI-GENERATED CLINICAL EXPLANATION SECTION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-text-primary flex flex-wrap items-center gap-2">
                <span>AI-Generated Clinical Explanation</span>
                <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-primary-50 text-primary border border-primary-200">
                  Google Gemini • Tool Calling
                </span>
              </h2>
              <p className="text-xs text-text-secondary">
                Plain-language interpretation of the Random Forest model and SHAP feature attributions
              </p>
            </div>
          </div>

          <Tooltip
            title="AI Clinical Narrative"
            content="Google Gemini interprets the Random Forest severity prediction and SHAP factor scores into an easy-to-understand narrative. The actual prediction values and probabilities are computed strictly by the ML model."
          />
        </div>

        <Card padding="p-6" className="space-y-4 border-l-4 border-l-primary shadow-sm bg-surface">
          {/* Loading State */}
          {llmStatus === "loading" && (
            <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-primary-50 border border-primary-200 flex items-center justify-center text-primary">
                <RefreshCw className="w-5 h-5 animate-spin text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-text-primary">
                  Synthesizing Clinical Explanation with Google Gemini...
                </p>
                <p className="text-xs text-text-muted">
                  Gemini is evaluating the Random Forest severity class and SHAP attribution scores.
                </p>
              </div>
            </div>
          )}

          {/* Missing Inputs Warning */}
          {llmStatus === "missing_inputs" && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Incomplete Clinical Profile for AI Explanation</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-900">
                  {llmExplanation || "Certain clinical measurements are missing. To generate a reliable narrative explanation, please supply all clinical values."}
                </p>
                {missingFields && missingFields.length > 0 && (
                  <div className="pt-2 text-xs">
                    <p className="font-semibold text-amber-950">Requested measurements:</p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-800">
                      {missingFields.map((f, i) => (
                        <li key={i}>{f.label || f.field}: {f.prompt || "Required"}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" icon={RotateCcw}>
                    Update Inputs on Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* API Key Missing State */}
          {llmStatus === "api_key_missing" && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
                  <Info className="w-4 h-4 text-primary" />
                  <span>Google Gemini API Key Not Configured</span>
                </div>
                <Button variant="outlineSecondary" size="sm" icon={RefreshCw} onClick={handleRetryExplanation}>
                  Check Again
                </Button>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                The AI conversational explainer is offline because a <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[11px]">GEMINI_API_KEY</code> has not been configured in <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[11px]">backend/.env</code>.
              </p>
              <p className="text-[11px] text-text-muted">
                Note: The core Machine Learning predictions, multi-class distribution chart, and SHAP factor values below remain 100% functional.
              </p>
            </div>
          )}

          {/* Service Unavailable / High Demand State (HTTP 503 / 429) */}
          {(llmStatus === "service_unavailable" || llmStatus === "rate_limit_exceeded") && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span>
                    {llmStatus === "rate_limit_exceeded"
                      ? "AI Service Rate Limit Reached"
                      : "AI Service Experiencing High Demand"}
                  </span>
                </div>
                <Button variant="outlineSecondary" size="sm" icon={RefreshCw} onClick={handleRetryExplanation}>
                  Retry Explanation
                </Button>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                {llmExplanation ||
                  "The Gemini model is temporarily experiencing high traffic. Spikes in demand are usually brief. You can click 'Retry Explanation' in a few moments."}
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-amber-900 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Your Machine Learning severity prediction, probability distribution, and SHAP factors below remain 100% functional.
                </span>
              </div>
            </div>
          )}

          {/* General Error State */}
          {llmStatus === "error" && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-700" />
                  <span>AI Explanation Temporarily Unavailable</span>
                </div>
                <Button variant="outlineSecondary" size="sm" icon={RefreshCw} onClick={handleRetryExplanation}>
                  Retry
                </Button>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                {llmError || "An error occurred while communicating with the AI service. Your ML prediction results below are unaffected."}
              </p>
            </div>
          )}

          {/* Success State */}
          {llmStatus === "success" && (
            <div className="space-y-4">
              {/* Narrative Text */}
              <div className="text-xs sm:text-sm text-text-primary leading-relaxed space-y-2.5 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                {llmExplanation.split("\n\n").map((paragraph, idx) => (
                  <p key={idx} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Explainer Medical Disclaimer */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary-50/60 border border-primary-100 text-[11px] text-primary-950">
                <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Educational Note:</strong> This explanation is synthesized by Google Gemini interpreting statistical Random Forest patterns and SHAP factor contributions. It does not replace a clinical consultation.
                </span>
              </div>

              {/* Follow-up Q&A conversation thread */}
              {followUpHistory.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Follow-Up Discussion:
                  </h4>
                  <div className="space-y-2.5">
                    {followUpHistory.map((item, idx) => (
                      <div key={idx} className="space-y-1.5 text-xs p-3 rounded-xl bg-slate-50 border border-border">
                        <p className="font-semibold text-primary-900 flex items-center gap-1.5">
                          <span>Q:</span> {item.question}
                        </p>
                        <p className="text-text-secondary leading-relaxed pl-3 border-l-2 border-primary-300">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up question input */}
              <form onSubmit={handleSendFollowUp} className="no-print pt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={followUpQuestion}
                  onChange={(e) => setFollowUpQuestion(e.target.value)}
                  placeholder="Ask a question about this result or these factors..."
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  disabled={isSendingFollowUp}
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={!followUpQuestion.trim() || isSendingFollowUp}
                  icon={isSendingFollowUp ? RefreshCw : Send}
                >
                  {isSendingFollowUp ? "Thinking..." : "Ask AI"}
                </Button>
              </form>
            </div>
          )}
        </Card>
      </section>

      {/* 3. PROBABILITY DISTRIBUTION SECTION (Recharts Horizontal Bar) */}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-900 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-text-primary">
                Multi-Class Risk Breakdown
              </h2>
              <p className="text-xs text-text-secondary">
                Likelihood distribution across all 5 cardiovascular categories
              </p>
            </div>
          </div>

          <Tooltip
            title="Risk Distribution"
            content="CardioSense calculates a likelihood distribution across all 5 severity tiers. This chart illustrates how your vital signs align with each category."
          />
        </div>

        <Card padding="p-6" className="space-y-4">
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={result.distribution}
                layout="vertical"
                margin={{ top: 10, right: 35, left: 10, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fontSize: 11, fill: "#5B6B67" }}
                  axisLine={{ stroke: "#E2E8E6" }}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 12, fill: "#1A2E2A", fontWeight: 500 }}
                  axisLine={{ stroke: "#E2E8E6" }}
                  tickLine={false}
                  width={145}
                />
                <RechartsTooltip content={<CustomProbTooltip />} />
                <Bar dataKey="prob" radius={[0, 6, 6, 0]}>
                  {result.distribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={entry.isTop ? "#0F7A6B" : "transparent"}
                      strokeWidth={entry.isTop ? 2 : 0}
                      opacity={entry.isTop ? 1 : 0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-text-secondary">
            <span>
              Highest likelihood category: <strong className="text-text-primary">{severity.label} ({result.probabilities[result.predictedClass]}%)</strong>
            </span>
            <span className="text-text-muted">
              Probabilities sum to 100%
            </span>
          </div>
        </Card>
      </section>

      {/* 3. SHAP EXPLAINABILITY SECTION (Horizontal Diverging Bar Chart) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary-50 text-secondary-dark flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-text-primary">
                What Influenced This Result (SHAP Analysis)
              </h2>
              <p className="text-xs text-text-secondary">
                Transparent factors that shifted the predicted severity higher or lower
              </p>
            </div>
          </div>

          <Tooltip
            title="SHapley Additive exPlanations (SHAP)"
            content="SHAP values measure the positive or negative contribution of each individual health measurement toward the final severity classification, grounded in cooperative game theory."
          />
        </div>

        <Card padding="p-6" className="space-y-5">
          <div className="flex items-center justify-between text-xs text-text-muted px-2">
            <span className="flex items-center gap-1.5 text-[#1B6F52] font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2FA37A]" />
              Decreased Severity (Protective)
            </span>
            <span className="flex items-center gap-1.5 text-[#8F3D14] font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D9713C]" />
              Increased Severity (Risk Factor)
            </span>
          </div>

          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={result.shapFactors}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  domain={[-1, 1]}
                  tick={{ fontSize: 11, fill: "#5B6B67" }}
                  axisLine={{ stroke: "#E2E8E6" }}
                  tickLine={false}
                />
                <YAxis
                  dataKey="feature"
                  type="category"
                  tick={{ fontSize: 12, fill: "#1A2E2A", fontWeight: 500 }}
                  axisLine={{ stroke: "#E2E8E6" }}
                  tickLine={false}
                  width={160}
                />
                <ReferenceLine x={0} stroke="#5B6B67" strokeWidth={1.5} />
                <RechartsTooltip content={<CustomShapTooltip />} />
                <Bar dataKey="shap" radius={[4, 4, 4, 4]}>
                  {result.shapFactors.map((entry, index) => (
                    <Cell
                      key={`shap-${index}`}
                      fill={entry.color}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Plain-Language SHAP Factor List */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Key Contributing Factors Explained:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {result.shapFactors.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-border/80"
                >
                  <span className="font-medium text-text-primary truncate mr-2">
                    {item.plainLabel}
                  </span>
                  <span
                    className={`text-[11px] font-semibold shrink-0 px-2 py-0.5 rounded-full ${item.shap > 0
                        ? "bg-amber-50 text-amber-900 border border-amber-200"
                        : "bg-emerald-50 text-emerald-900 border border-emerald-200"
                      }`}
                  >
                    {item.shap > 0 ? "Increased severity" : "Decreased severity"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* 4. YOUR VALUES VS TYPICAL RANGE (Range Gauges Grid) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-900 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-text-primary">
                Your Values vs. General Reference Benchmarks
              </h2>
              <p className="text-xs text-text-secondary">
                Comparison with commonly used adult cardiovascular reference values
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RangeGauge
            featureKey="trestbps"
            value={result.patientInputs.trestbps}
          />
          <RangeGauge
            featureKey="chol"
            value={result.patientInputs.chol}
          />
          <RangeGauge
            featureKey="thalach"
            value={result.patientInputs.thalach}
          />
          <RangeGauge
            featureKey="oldpeak"
            value={result.patientInputs.oldpeak}
          />
        </div>
      </section>

      {/* 5. RECOMMENDED NEXT STEPS CALLOUT (Soft Blue Info Box) */}
      <section>
        <div className="bg-secondary-50/80 border-l-4 border-secondary rounded-r-2xl p-6 sm:p-7 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-secondary-dark font-bold font-heading text-lg">
            <Info className="w-5 h-5 text-secondary shrink-0" />
            <span>Recommended Next Steps</span>
          </div>

          <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
            {severity.guidance}
          </p>

          <p className="text-xs text-text-secondary leading-relaxed pt-1">
            Consider sharing a summary of these inputs with a healthcare provider, especially if you have not had a comprehensive checkup recently. A doctor can review your complete medical history, family context, and order confirmatory tests.
          </p>
        </div>
      </section>

      {/* 6. ACTION BAR (Sticky or Bottom) */}
      <section className="no-print bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Secondary Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outlineSecondary"
              size="md"
              icon={Printer}
              onClick={handlePrintPDF}
            >
              Print / Save as PDF
            </Button>

            <Button
              variant={isLoggedIn && !isGuest ? "primary" : "outline"}
              size="md"
              icon={Bookmark}
              onClick={handleSaveToAccount}
            >
              {savedSuccess
                ? "Saved to Account!"
                : isLoggedIn && !isGuest
                  ? "Save to My Account"
                  : "Log In to Save Result"}
            </Button>
          </div>

          {/* Nav / Feedback Actions */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-text-secondary hover:text-primary transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try with different values</span>
            </Link>

            <button
              type="button"
              onClick={() => setReviewModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary-dark transition-colors focus:outline-none"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Share experience</span>
            </button>
          </div>
        </div>
      </section>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        predictedSeverityClass={result.predictedClass}
        onAddReview={() => { }}
      />
    </div>
  );
};
