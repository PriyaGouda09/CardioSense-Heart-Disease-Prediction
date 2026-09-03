import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Database,
  ClipboardList,
  BarChart2,
  FileText,
  AlertTriangle,
  Mail,
  ExternalLink,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Heart,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { SEVERITY_CLASSES } from "../utils/severityUtils";
import { Modal } from "../components/ui/Modal";

export const AboutPage = () => {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

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
      <div className="max-w-4xl mx-auto space-y-12">
        {/* HERO SECTION */}
        <section className="text-center space-y-4 pt-2">
          <Badge variant="primary" size="md">
            Clinical Health Intelligence & Screening
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-text-primary tracking-tight">
            About Cardio<span className="text-primary">Sense</span>
          </h1>
          <p className="text-lg text-primary-dark font-medium font-heading">
            Understand your cardiovascular health patterns with clarity
          </p>
          <p className="text-base text-text-secondary leading-relaxed max-w-2xl mx-auto">
            CardioSense is an interactive health evaluation system designed to interpret physiological measurements, assess heart health indicators, and provide structured risk insights to help you make informed decisions with your doctor.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link to="/dashboard">
              <Button size="lg" icon={ArrowRight} iconPosition="right" className="shadow-sm">
                Start Health Assessment
              </Button>
            </Link>
          </div>
        </section>

        {/* SECTION 1: WHAT IS CARDIOSENSE */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-900 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-heading text-text-primary">
                What is CardioSense?
              </h2>
              <p className="text-xs text-text-muted">
                5-Tier cardiovascular risk classification & pattern analysis
              </p>
            </div>
          </div>

          <Card className="space-y-6 text-text-secondary text-sm sm:text-base leading-relaxed">
            <p>
              CardioSense evaluates a combination of demographic factors, cardiovascular symptoms, resting vitals, and diagnostic indicators to categorize heart disease risk across <strong className="text-text-primary">5 distinct severity tiers</strong>:
            </p>

            {/* 5 Severity Classes Visual Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[0, 1, 2, 3, 4].map((classId) => {
                const info = SEVERITY_CLASSES[classId];
                return (
                  <div
                    key={classId}
                    className="p-4 rounded-xl border text-center space-y-2 transition-all hover:shadow-sm"
                    style={{
                      backgroundColor: info.lightBg,
                      borderColor: info.borderColor,
                    }}
                  >
                    <span
                      className="w-3 h-3 rounded-full inline-block mx-auto"
                      style={{ backgroundColor: info.color }}
                    />
                    <div
                      className="text-sm font-bold font-heading"
                      style={{ color: info.textColor }}
                    >
                      Class {classId}
                    </div>
                    <div className="text-xs font-semibold text-text-primary">
                      {info.label}
                    </div>
                    <p className="text-[11px] text-text-secondary line-clamp-3 leading-tight pt-1">
                      {classId === 0 && "Optimal vitals with no indicative patterns"}
                      {classId === 1 && "Mild physiological variations from baseline"}
                      {classId === 2 && "Moderate elevations in blood pressure or lipids"}
                      {classId === 3 && "Substantial indicators warranting doctor consultation"}
                      {classId === 4 && "Critical factors requiring direct specialist attention"}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="text-sm pt-2">
              Unlike generic calculators, CardioSense provides transparent, factor-by-factor explanations showing which specific metrics—such as resting blood pressure, cholesterol levels, exercise tolerance, or ST depression—contributed to your assessment.
            </p>
          </Card>
        </section>

        {/* SECTION 2: HOW IT WORKS & USER PROCEDURE */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-900 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-heading text-text-primary">
                How to Use CardioSense
              </h2>
              <p className="text-xs text-text-muted">
                Step-by-step procedure from vital entry to clinical report generation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1 */}
            <Card padding="p-6" className="space-y-4 relative border-t-4 border-t-primary hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary flex items-center justify-center font-bold text-base font-heading">
                1
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-base text-text-primary font-heading flex items-center gap-2">
                  <span>Enter Health Vitals</span>
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Provide your baseline physiological measurements across 4 easy-to-follow steps:
                </p>
              </div>
              <ul className="text-xs text-text-secondary space-y-1.5 pl-1 border-t border-border pt-3">
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span><strong>Demographics:</strong> Age & biological sex</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span><strong>Symptoms:</strong> Chest discomfort type & exercise angina</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span><strong>Core Vitals:</strong> Blood pressure, cholesterol & peak HR</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span><strong>Clinical Tests:</strong> Resting ECG & ST segment readings</span>
                </li>
              </ul>
            </Card>

            {/* Step 2 */}
            <Card padding="p-6" className="space-y-4 relative border-t-4 border-t-secondary-dark hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-secondary-50 text-secondary-dark flex items-center justify-center font-bold text-base font-heading">
                2
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-base text-text-primary font-heading flex items-center gap-2">
                  <span>Receive Risk Insights</span>
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Instantly obtain a personalized risk breakdown and factor attribution:
                </p>
              </div>
              <ul className="text-xs text-text-secondary space-y-1.5 pl-1 border-t border-border pt-3">
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-secondary-dark shrink-0" />
                  <span><strong>Severity Tier:</strong> Immediate Class 0–4 assessment</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-secondary-dark shrink-0" />
                  <span><strong>Probability Distribution:</strong> Confidence spread across tiers</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-secondary-dark shrink-0" />
                  <span><strong>Key Contributing Factors:</strong> Metrics influencing your score</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-secondary-dark shrink-0" />
                  <span><strong>Clinical Guidance:</strong> Actionable next steps and habits</span>
                </li>
              </ul>
            </Card>

            {/* Step 3 */}
            <Card padding="p-6" className="space-y-4 relative border-t-4 border-t-emerald-600 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base font-heading">
                3
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-base text-text-primary font-heading flex items-center gap-2">
                  <span>Generate Health Report</span>
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Export and share a structured health summary with your healthcare provider:
                </p>
              </div>
              <ul className="text-xs text-text-secondary space-y-1.5 pl-1 border-t border-border pt-3">
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>PDF Export:</strong> One-click formatted printout</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Account History:</strong> Save and track results over time</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Doctor Sharing:</strong> Ready to present during clinical visits</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Privacy First:</strong> Your medical inputs remain secure</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* SECTION 3: CLINICAL REFERENCE & DATASET */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-50 text-secondary-dark flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-heading text-text-primary">
                Clinical Reference Foundation
              </h2>
              <p className="text-xs text-text-muted">
                Standardized reference cohort from leading medical research institutions
              </p>
            </div>
          </div>

          <Card className="space-y-4 text-sm sm:text-base text-text-secondary leading-relaxed">
            <p>
              CardioSense is calibrated using the standardized <strong className="text-text-primary">UCI Heart Disease Clinical Reference Cohort</strong>, representing <strong className="text-text-primary">920 comprehensive patient records</strong> compiled across four medical institutions:
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-text-primary font-medium pl-1">
              <li className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span>Cleveland Clinic Foundation</span>
              </li>
              <li className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span>Hungarian Institute of Cardiology</span>
              </li>
              <li className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span>University Hospital, Zurich</span>
              </li>
              <li className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span>VA Medical Center, Long Beach</span>
              </li>
            </ul>

            <p className="text-xs sm:text-sm pt-2">
              The reference system evaluates 13 core indicators including physiological vitals, symptom types, metabolic indices, and electrocardiographic readings to establish baseline patterns.
            </p>

            <div className="pt-1">
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

        {/* SECTION 4: CLINICAL BOUNDARIES & DISCLAIMER */}
        <section id="limitations">
          <div className="bg-amber-50/90 border-l-4 border-warning rounded-r-2xl p-6 sm:p-7 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-amber-900 font-bold font-heading text-lg">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
              <span>Important Medical Boundaries & Educational Purpose</span>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-amber-950 leading-relaxed list-disc list-inside">
              <li>
                <strong>Educational & Screening Tool:</strong> CardioSense provides pattern-matching insights for health awareness and does not formulate a definitive medical diagnosis.
              </li>
              <li>
                <strong>Does Not Replace Diagnostic Testing:</strong> True clinical cardiac diagnosis requires physician consultation, 12-lead ECG, echocardiograms, coronary angiography, and comprehensive laboratory blood tests.
              </li>
              <li>
                <strong>Always Consult a Doctor:</strong> Never adjust prescribed medications, treatments, or medical therapies based solely on CardioSense evaluations.
              </li>
              <li>
                <strong>Emergency Notice:</strong> If you or someone around you experiences severe chest pressure, radiating pain, shortness of breath, or dizziness, seek immediate emergency medical services (e.g. 911 / 112).
              </li>
            </ul>
          </div>
        </section>

        {/* SECTION 5: QUESTIONS OR INQUIRIES */}
        <section className="text-center bg-surface border border-border rounded-2xl p-8 space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-xl font-bold font-heading text-text-primary">
              Questions or Observations?
            </h3>
            <p className="text-sm text-text-secondary">
              Have inquiries regarding feature interpretations, reference indicators, or clinical workflow feedback?
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              icon={Mail}
              onClick={() => setFeedbackModalOpen(true)}
            >
              Send Inquiry / Feedback
            </Button>
            <Link to="/dashboard">
              <Button icon={ArrowRight} iconPosition="right">
                Start Health Assessment
              </Button>
            </Link>
          </div>
        </section>
      </div>

      {/* Inquiry Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Contact CardioSense Team"
        subtitle="Send your questions or feedback regarding the CardioSense platform."
        maxWidth="max-w-md"
      >
        {feedbackSent ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-text-primary font-heading">Message Sent</h4>
            <p className="text-xs text-text-secondary">
              Thank you for reaching out. We appreciate your observations.
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
                placeholder="user@example.com"
                className="w-full text-sm rounded-lg border border-border bg-surface p-2.5 focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
                Message / Feedback
              </label>
              <textarea
                rows={4}
                required
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your questions, feedback on vital inputs, or report generation experience..."
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
