import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Database,
  Cpu,
  BarChart3,
  AlertTriangle,
  Mail,
  ExternalLink,
  CheckCircle,
  Layers,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { SEVERITY_CLASSES } from "../utils/severityUtils";
import { Modal } from "../components/ui/Modal";
import { getModelBenchmarks } from "../services/api";

export const AboutPage = () => {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [benchmarksData, setBenchmarksData] = useState(null);

  useEffect(() => {
    getModelBenchmarks()
      .then((data) => setBenchmarksData(data))
      .catch((err) => console.log("Using cached model benchmarks:", err));
  }, []);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setFeedbackModalOpen(false);
      setFeedbackText("");
    }, 1200);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* HERO SECTION */}
        <section className="text-center space-y-4 pt-2">
          <Badge variant="primary" size="md">
            Educational & Research Tool
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-text-primary tracking-tight">
            About Cardio<span className="text-primary">Sense</span>
          </h1>
          <p className="text-lg text-primary-dark font-medium font-heading">
            Understand your heart health patterns
          </p>
          <p className="text-base text-text-secondary leading-relaxed max-w-2xl mx-auto">
            CardioSense is an interactive demonstration designed to illustrate how machine learning algorithms interpret clinical measurements and provide transparent, explainable insights through SHAP feature attribution.
          </p>
        </section>

        {/* SECTION 1: WHAT IS CARDIOSENSE */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-900 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-text-primary">
              What is CardioSense?
            </h2>
          </div>
          <Card className="space-y-4 text-text-secondary text-sm sm:text-base leading-relaxed">
            <p>
              CardioSense uses an ensemble machine learning architecture trained to recognize patterns across <strong className="text-text-primary">5 distinct severity classes</strong>:
            </p>

            {/* 5 Severity Classes Visual Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-2">
              {[0, 1, 2, 3, 4].map((classId) => {
                const info = SEVERITY_CLASSES[classId];
                return (
                  <div
                    key={classId}
                    className="p-3 rounded-xl border text-center space-y-1 transition-all hover:scale-[1.02]"
                    style={{
                      backgroundColor: info.lightBg,
                      borderColor: info.borderColor,
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block mx-auto"
                      style={{ backgroundColor: info.color }}
                    />
                    <div
                      className="text-xs font-bold font-heading"
                      style={{ color: info.textColor }}
                    >
                      Class {classId}
                    </div>
                    <div className="text-[11px] font-medium text-text-secondary">
                      {info.label}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-sm pt-2">
              Unlike black-box diagnostic tools, CardioSense prioritizes <strong className="text-text-primary">interpretability</strong>. Every prediction reveals exactly which factors (such as resting blood pressure, max heart rate, or ST depression) contributed to shifting the prediction higher or lower.
            </p>
          </Card>
        </section>

        {/* SECTION 2: ABOUT THE DATASET */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-50 text-secondary-dark flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-text-primary">
              About the Dataset
            </h2>
          </div>

          <Card className="space-y-4 text-sm sm:text-base text-text-secondary leading-relaxed">
            <p>
              The underlying model is benchmarked against the renowned <strong className="text-text-primary">UCI Heart Disease Dataset</strong>. This standardized dataset incorporates <strong className="text-text-primary">920 clinical records</strong> aggregated across four prestigious medical centers:
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-text-primary font-medium pl-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                Cleveland Clinic Foundation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                Hungarian Institute of Cardiology
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                University Hospital, Zurich
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                VA Medical Center, Long Beach
              </li>
            </ul>

            <p className="text-xs sm:text-sm pt-1">
              It encompasses <strong className="text-text-primary">13 core clinical features</strong> spanning demographic vitals (age, biological sex), symptom characteristics (chest pain classification, exercise angina), metabolic indicators (fasting blood sugar, cholesterol), and resting/exercise ECG measurements.
            </p>

            <div className="pt-2">
              <a
                href="https://archive.ics.uci.edu/dataset/45/heart+disease"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                <span>View UCI Machine Learning Repository Dataset</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </Card>
        </section>

        {/* SECTION 3: HOW THE MODEL WORKS (3-STEP VISUAL) */}
        <section id="methodology" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-900 flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-text-primary">
              How the Model Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <Card padding="p-6" className="relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs font-heading">
                1
              </div>
              <h3 className="font-bold text-base text-text-primary font-heading">
                Enter Health Vitals
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Provide common physiological stats and exercise symptoms through a clean 4-step guided interface.
              </p>
            </Card>

            {/* Step 2 */}
            <Card padding="p-6" className="relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-xs font-heading">
                2
              </div>
              <h3 className="font-bold text-base text-text-primary font-heading">
                Ensemble Analysis
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                An ensemble of Random Forest, Support Vector Machines (SVM), and Neural Networks evaluates non-linear correlations.
              </p>
            </Card>

            {/* Step 3 */}
            <Card padding="p-6" className="relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs font-heading">
                3
              </div>
              <h3 className="font-bold text-base text-text-primary font-heading">
                Severity & SHAP
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Receive a 5-class probability spread alongside SHAP feature attributions showing which specific factors tipped the scale.
              </p>
            </Card>
          </div>
        </section>

        {/* SECTION 4: MODEL PERFORMANCE & BENCHMARK COMPARISON */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-900 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-heading text-text-primary">
                  Model Comparison & Benchmarks
                </h2>
                <p className="text-xs text-text-secondary">
                  5-Fold Stratified Cross-Validation & Holdout Evaluation (Heart Disease UCI Pipeline)
                </p>
              </div>
            </div>
          </div>

          {/* Model Comparison Table */}
          <div className="overflow-x-auto border border-border rounded-xl bg-surface shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-border font-semibold text-text-primary">
                <tr>
                  <th className="p-3">Model Architecture</th>
                  <th className="p-3">CV Accuracy</th>
                  <th className="p-3">Holdout Acc</th>
                  <th className="p-3">CV Macro-F1</th>
                  <th className="p-3">Severity-Weighted F1</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {benchmarksData && benchmarksData.models ? (
                  Object.entries(benchmarksData.models).map(([mName, mStats]) => (
                    <tr key={mName} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-text-primary">
                        {mName === "Random Forest" ? "🌲 Random Forest (Primary + SHAP)" : mName === "SVM" ? "⚡ Support Vector Machine (RBF)" : "🧠 Multi-Layer Perceptron (MLP)"}
                      </td>
                      <td className="p-3 font-mono-val">{(mStats.cv_accuracy * 100).toFixed(1)}%</td>
                      <td className="p-3 font-mono-val font-semibold text-primary">{(mStats.holdout_accuracy * 100).toFixed(1)}%</td>
                      <td className="p-3 font-mono-val">{mStats.cv_macro_f1.toFixed(3)}</td>
                      <td className="p-3 font-mono-val font-semibold text-emerald-600">{mStats.holdout_severity_f1.toFixed(3)}</td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr>
                      <td className="p-3 font-semibold text-text-primary">🌲 Random Forest (Primary + SHAP)</td>
                      <td className="p-3 font-mono-val">55.3%</td>
                      <td className="p-3 font-mono-val font-semibold text-primary">52.2%</td>
                      <td className="p-3 font-mono-val">0.312</td>
                      <td className="p-3 font-mono-val font-semibold text-emerald-600">0.292</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-text-primary">⚡ Support Vector Machine (RBF)</td>
                      <td className="p-3 font-mono-val">54.4%</td>
                      <td className="p-3 font-mono-val font-semibold text-primary">50.5%</td>
                      <td className="p-3 font-mono-val">0.301</td>
                      <td className="p-3 font-mono-val font-semibold text-emerald-600">0.293</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-text-primary">🧠 Multi-Layer Perceptron (MLP)</td>
                      <td className="p-3 font-mono-val">50.5%</td>
                      <td className="p-3 font-mono-val font-semibold text-primary">48.4%</td>
                      <td className="p-3 font-mono-val">0.278</td>
                      <td className="p-3 font-mono-val font-semibold text-emerald-600">0.246</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-center text-text-muted">
            * Evaluated on a 20% stratified holdout set with SMOTE class rebalancing & clinical threshold tuning for classes 3 & 4.
          </p>
        </section>

        {/* SECTION 5: LIMITATIONS CALLOUT BOX */}
        <section id="limitations">
          <div className="bg-amber-50/80 border-l-4 border-warning rounded-r-2xl p-6 sm:p-7 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-amber-900 font-bold font-heading text-lg">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
              <span>Model Limitations & Educational Boundaries</span>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-amber-950 leading-relaxed list-disc list-inside">
              <li>
                <strong>Small Historical Dataset:</strong> The 920-record UCI dataset is limited in sample size and collected primarily in historical clinical environments.
              </li>
              <li>
                <strong>Not Clinically Validated:</strong> CardioSense is an educational prototype and has not undergone formal clinical trial clearance or FDA/CE regulatory validation.
              </li>
              <li>
                <strong>Demographic Generalization:</strong> Historical datasets often underrepresent specific age groups, ethnicities, and gender-specific symptom expressions.
              </li>
              <li>
                <strong>Does Not Replace Diagnostic Testing:</strong> True cardiac diagnosis requires direct physician examination, 12-lead ECG, coronary angiography, echocardiograms, and targeted blood panels.
              </li>
              <li>
                <strong>For Educational Use Only:</strong> Never use predictions to modify prescribed therapies or self-diagnose cardiovascular disease.
              </li>
            </ul>
          </div>
        </section>

        {/* SECTION 6: QUESTIONS OR FEEDBACK */}
        <section className="text-center bg-surface border border-border rounded-2xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-xl font-bold font-heading text-text-primary">
              Questions or Feedback?
            </h3>
            <p className="text-sm text-text-secondary">
              We welcome questions regarding algorithm architecture, SHAP attribution methods, and educational dataset licensing.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              icon={Mail}
              onClick={() => setFeedbackModalOpen(true)}
            >
              Send Research Inquiry
            </Button>
            <Link to="/dashboard">
              <Button icon={ArrowRight} iconPosition="right">
                Explore Demo Dashboard
              </Button>
            </Link>
          </div>
        </section>
      </div>

      {/* Inquiry Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Contact Research Team"
        subtitle="Send questions or observations regarding the CardioSense demo."
        maxWidth="max-w-md"
      >
        {feedbackSent ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-text-primary font-heading">Message Dispatched</h4>
            <p className="text-xs text-text-secondary">
              Thank you for reaching out. We appreciate your feedback.
            </p>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
                Your Email
              </label>
              <input
                type="email"
                required
                placeholder="researcher@university.edu"
                className="w-full text-sm rounded-lg border border-border bg-surface p-2.5 focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
                Message / Inquiry
              </label>
              <textarea
                rows={4}
                required
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Inquire about SHAP formulas, dataset feature encodings, or reporting feedback..."
                className="w-full text-sm rounded-lg border border-border bg-surface p-2.5 focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFeedbackModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Send Message
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
