import React, { useState } from "react";
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
  Heart,
  ShieldAlert,
  Info,
  Download,
  Bookmark,
  RotateCcw,
  MessageSquarePlus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Printer,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { usePrediction } from "../context/PredictionContext";
import { useAuth } from "../context/AuthContext";
import { SEVERITY_CLASSES, getSeverityInfo } from "../utils/severityUtils";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Tooltip } from "../components/ui/Tooltip";
import { RangeGauge } from "../components/ui/RangeGauge";
import { ReviewModal } from "../components/reviews/ReviewModal";

export const ResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPredictionById } = usePrediction();
  const { user, isLoggedIn, isGuest, savePredictionToAccount } = useAuth();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Retrieve prediction result (or fallback to demo/healthy/severe presets)
  const result = getPredictionById(id);
  const severity = getSeverityInfo(result.predictedClass);

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

      {/* 2. PROBABILITY DISTRIBUTION SECTION (Recharts Horizontal Bar) */}
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
                    className={`text-[11px] font-semibold shrink-0 px-2 py-0.5 rounded-full ${
                      item.shap > 0
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
                Your Values vs. Clinical Reference Ranges
              </h2>
              <p className="text-xs text-text-secondary">
                Comparative benchmarks based on standard adult cardiovascular baselines
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
        onAddReview={() => {}}
      />
    </div>
  );
};
