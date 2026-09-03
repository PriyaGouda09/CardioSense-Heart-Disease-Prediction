import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Activity,
  Heart,
  HeartPulse,
  Info,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Smile,
  AlertCircle,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Tooltip } from "../components/ui/Tooltip";
import { ProgressStepper } from "../components/ui/ProgressStepper";
import { usePrediction } from "../context/PredictionContext";
import { SAMPLE_INPUTS } from "../data/samplePredictions";

// Step 1 Yup Schema: Demographics
const step1Schema = yup.object({
  age: yup
    .number()
    .typeError("Please enter a valid age")
    .required("Age is required")
    .min(20, "Age must be between 20 and 100")
    .max(100, "Age must be between 20 and 100"),
  sex: yup
    .number()
    .required("Please select your biological sex")
    .oneOf([0, 1], "Please select Male or Female"),
});

// Step 2 Yup Schema: Symptoms
const step2Schema = yup.object({
  cp: yup
    .number()
    .required("Please select a chest discomfort pattern")
    .oneOf([0, 1, 2, 3]),
  exang: yup
    .number()
    .required("Please indicate if chest discomfort occurs during physical activity")
    .oneOf([0, 1]),
  fbs: yup
    .string()
    .required("Please select your fasting blood sugar status"),
});

// Step 3 Yup Schema: Vitals
const step3Schema = yup.object({
  trestbps: yup
    .number()
    .typeError("Please enter your resting blood pressure")
    .required("Resting blood pressure is required")
    .min(60, "Resting BP must be between 60 and 220 mmHg")
    .max(220, "Resting BP must be between 60 and 220 mmHg"),
  chol: yup
    .number()
    .typeError("Please enter your cholesterol level")
    .required("Cholesterol level is required")
    .min(100, "Cholesterol must be between 100 and 600 mg/dl")
    .max(600, "Cholesterol must be between 100 and 600 mg/dl"),
  thalach: yup
    .number()
    .typeError("Please enter your peak heart rate")
    .required("Peak heart rate is required")
    .min(60, "Peak heart rate must be between 60 and 220 bpm")
    .max(220, "Peak heart rate must be between 60 and 220 bpm"),
});

// Step 4 Yup Schema: Test Results
const step4Schema = yup.object({
  restecg: yup.string().required("Please choose a resting ECG option"),
  oldpeak: yup
    .string()
    .required("Please enter ST depression or choose 'I don't know'"),
  slope: yup.string().required("Please choose an ST slope option"),
  ca: yup.string().required("Please choose a fluoroscopy vessel option"),
  thal: yup.string().required("Please choose a thalassemia/perfusion option"),
});

const STEP_SCHEMAS = [step1Schema, step2Schema, step3Schema, step4Schema];

export const DashboardPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const navigate = useNavigate();
  const { generatePrediction, currentPrediction, selectedModel, applyThresholds } = usePrediction();

  // Cycling analysis messages for full-page loading state
  const loadingMessages = [
    "Analyzing vital measurements against clinical reference cohort...",
    "Evaluating cardiovascular indicators and risk patterns...",
    "Calculating factor attributions and preparing clinical summary report...",
  ];

  useEffect(() => {
    let timer;
    if (isAnalyzing) {
      timer = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 700);
    }
    return () => clearInterval(timer);
  }, [isAnalyzing, loadingMessages.length]);

  // Main Form Hook initialized with user's last assessment or standard defaults
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      age: currentPrediction?.patientInputs?.age || 54,
      sex: currentPrediction?.patientInputs?.sex !== undefined ? currentPrediction.patientInputs.sex : 1,
      cp: currentPrediction?.rawInputs?.cp !== undefined ? currentPrediction.rawInputs.cp : 0,
      exang: currentPrediction?.patientInputs?.exang !== undefined ? currentPrediction.patientInputs.exang : 0,
      fbs: currentPrediction?.rawInputs?.fbs !== undefined ? String(currentPrediction.rawInputs.fbs) : "0",
      trestbps: currentPrediction?.patientInputs?.trestbps || 128,
      chol: currentPrediction?.patientInputs?.chol || 220,
      thalach: currentPrediction?.patientInputs?.thalach || 152,
      restecg: currentPrediction?.rawInputs?.restecg !== undefined ? String(currentPrediction.rawInputs.restecg) : "0",
      oldpeak: currentPrediction?.rawInputs?.oldpeak !== undefined ? String(currentPrediction.rawInputs.oldpeak) : "0.8",
      slope: currentPrediction?.rawInputs?.slope !== undefined ? String(currentPrediction.rawInputs.slope) : "0",
      ca: currentPrediction?.rawInputs?.ca !== undefined ? String(currentPrediction.rawInputs.ca) : "0",
      thal: currentPrediction?.rawInputs?.thal !== undefined ? String(currentPrediction.rawInputs.thal) : "1",
    },
  });

  const formValues = watch();

  // Quick preset loader helper
  const loadPreset = (presetKey) => {
    const data = SAMPLE_INPUTS[presetKey];
    if (data) {
      Object.keys(data).forEach((key) => {
        setValue(key, String(data[key]));
      });
      // Ensure types for numbers
      setValue("age", data.age);
      setValue("sex", data.sex);
      setValue("cp", data.cp);
      setValue("exang", data.exang);
      setValue("trestbps", data.trestbps);
      setValue("chol", data.chol);
      setValue("thalach", data.thalach);
    }
  };

  // Step advancement validation
  const handleContinue = async () => {
    // Determine which fields belong to current step
    let fieldsToValidate = [];
    if (currentStep === 1) fieldsToValidate = ["age", "sex"];
    if (currentStep === 2) fieldsToValidate = ["cp", "exang", "fbs"];
    if (currentStep === 3) fieldsToValidate = ["trestbps", "chol", "thalach"];
    if (currentStep === 4) fieldsToValidate = ["restecg", "oldpeak", "slope", "ca", "thal"];

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      if (currentStep < 4) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // Final submission
        await onSubmitFinal(formValues);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmitFinal = async (data) => {
    setIsAnalyzing(true);
    try {
      const result = await generatePrediction(data, selectedModel, applyThresholds);
      setIsAnalyzing(false);
      navigate(`/results/${result.id}`);
    } catch (err) {
      console.error("Submission error:", err);
      setIsAnalyzing(false);
    }
  };

  // FULL-PAGE LOADING STATE (Calm pulsing heart + cycling messages)
  if (isAnalyzing) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 sm:p-10 shadow-lg space-y-6 animate-in fade-in duration-300">
          {/* Calm Pulsing Heart Icon */}
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary-100 animate-ping opacity-30" />
            <div className="w-20 h-20 rounded-full bg-primary-50 border-2 border-primary-200 flex items-center justify-center text-primary shadow-inner">
              <Heart className="w-10 h-10 text-primary fill-primary-100 animate-pulse-calm" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-text-primary font-heading">
              Processing Health Profile
            </h2>
            <div className="h-10 flex items-center justify-center">
              <p className="text-xs sm:text-sm text-primary-dark font-medium transition-all duration-300">
                {loadingMessages[loadingMessageIndex]}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full animate-pulse transition-all duration-500 w-3/4" />
          </div>

          <p className="text-[11px] text-text-muted">
            Estimating multi-class severity distribution and computing SHAP attribution values...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Title & Preset Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary">
              Patient Assessment
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              Enter your physiological indicators to explore multi-class patterns.
            </p>
          </div>

          {/* Quick Demo Preset Picker */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] text-text-muted font-medium">Demo presets:</span>
            <button
              type="button"
              onClick={() => loadPreset("healthy")}
              className="text-[11px] px-2.5 py-1 bg-surface border border-border rounded-lg text-text-secondary hover:text-primary hover:border-primary-200 transition-colors"
            >
              Low Risk
            </button>
            <button
              type="button"
              onClick={() => loadPreset("moderate")}
              className="text-[11px] px-2.5 py-1 bg-surface border border-border rounded-lg text-text-secondary hover:text-primary hover:border-primary-200 transition-colors"
            >
              Moderate
            </button>
            <button
              type="button"
              onClick={() => loadPreset("severe")}
              className="text-[11px] px-2.5 py-1 bg-surface border border-border rounded-lg text-text-secondary hover:text-primary hover:border-primary-200 transition-colors"
            >
              Severe
            </button>
          </div>
        </div>

        {/* 4-Step Progress Stepper */}
        <ProgressStepper
          currentStep={currentStep}
          onStepClick={(stepId) => setCurrentStep(stepId)}
        />

        {/* Helpful Population Note on Step 4 */}
        {currentStep === 4 && (
          <div className="bg-primary-50/70 border border-primary-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-primary-900 animate-in fade-in">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <strong>Don't have a diagnostic test result?</strong> Select <em>"I don't know"</em> next to any field — CardioSense will reliably substitute baseline population statistics from the UCI reference cohort.
            </div>
          </div>
        )}

        {/* Multi-Step Form Card */}
        <Card className="shadow-card border-border/90 p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmitFinal)} className="space-y-6">
            {/* STEP 1: DEMOGRAPHICS */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-border pb-3">
                  <h2 className="text-lg font-bold text-text-primary font-heading">
                    Step 1: Patient Demographics
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Basic demographic factors used for age-adjusted baseline baselines.
                  </p>
                </div>

                {/* Age Input with Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="age-input"
                      className="text-sm font-semibold text-text-primary"
                    >
                      Patient Age (Years) <span className="text-error">*</span>
                    </label>
                    <span className="text-lg font-bold font-mono-val text-primary">
                      {formValues.age || 50} yrs
                    </span>
                  </div>

                  <input
                    type="range"
                    id="age-slider"
                    min="20"
                    max="100"
                    value={formValues.age || 50}
                    onChange={(e) => setValue("age", parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  />

                  <Input
                    id="age-input"
                    type="number"
                    min="20"
                    max="100"
                    placeholder="Enter age (20–100)"
                    helperText="Reference cohort ranges from 20 to 100 years of age."
                    error={errors.age}
                    {...register("age", { valueAsNumber: true })}
                  />
                </div>

                {/* Sex Segmented Control */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-text-primary">
                    Biological Sex <span className="text-error">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setValue("sex", 1)}
                      className={`p-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        formValues.sex === 1
                          ? "border-primary bg-primary-50 text-primary-900 shadow-xs"
                          : "border-border bg-surface text-text-secondary hover:bg-slate-50"
                      }`}
                    >
                      <span>Male</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("sex", 0)}
                      className={`p-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        formValues.sex === 0
                          ? "border-primary bg-primary-50 text-primary-900 shadow-xs"
                          : "border-border bg-surface text-text-secondary hover:bg-slate-50"
                      }`}
                    >
                      <span>Female</span>
                    </button>
                  </div>
                  {errors.sex && (
                    <p className="text-xs text-error mt-1">{errors.sex.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: SYMPTOMS */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-border pb-3">
                  <h2 className="text-lg font-bold text-text-primary font-heading">
                    Step 2: Symptoms & Physical Exertion
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Characterize chest tightness patterns and physical exertion responses.
                  </p>
                </div>

                {/* Chest Pain Type (4 Card Select Options) */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-text-primary">
                    Chest Discomfort Classification <span className="text-error">*</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        value: 0,
                        title: "Typical Angina",
                        desc: "Pressure, squeezing, or heaviness across chest provoked by physical stress or cold.",
                      },
                      {
                        value: 1,
                        title: "Atypical Angina",
                        desc: "Discomfort with atypical timing, shortness of breath, or sharp sensation.",
                      },
                      {
                        value: 2,
                        title: "Non-Anginal Pain",
                        desc: "Sharp localized pain unrelated to physical activity or heart workload.",
                      },
                      {
                        value: 3,
                        title: "Asymptomatic / No Noticeable Pain",
                        desc: "No noticeable chest pain during routine daily tasks or resting periods.",
                      },
                    ].map((item) => (
                      <div
                        key={item.value}
                        onClick={() => setValue("cp", item.value)}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          formValues.cp === item.value
                            ? "border-primary bg-primary-50/80 shadow-xs ring-1 ring-primary"
                            : "border-border bg-surface hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-bold font-heading ${
                              formValues.cp === item.value
                                ? "text-primary-dark"
                                : "text-text-primary"
                            }`}
                          >
                            {item.title}
                          </span>
                          <input
                            type="radio"
                            name="cp-radio"
                            checked={formValues.cp === item.value}
                            onChange={() => setValue("cp", item.value)}
                            className="text-primary focus:ring-primary h-3.5 w-3.5"
                          />
                        </div>
                        <p className="text-[11px] text-text-secondary leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exercise Induced Angina (Yes / No) */}
                <div className="space-y-2 pt-2">
                  <label className="block text-sm font-semibold text-text-primary">
                    Do you experience chest discomfort during exercise or exertion? <span className="text-error">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setValue("exang", 1)}
                      className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                        formValues.exang === 1
                          ? "border-primary bg-primary-50 text-primary-900 shadow-xs"
                          : "border-border bg-surface text-text-secondary hover:bg-slate-50"
                      }`}
                    >
                      Yes, during exercise
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("exang", 0)}
                      className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                        formValues.exang === 0
                          ? "border-primary bg-primary-50 text-primary-900 shadow-xs"
                          : "border-border bg-surface text-text-secondary hover:bg-slate-50"
                      }`}
                    >
                      No, never during exercise
                    </button>
                  </div>
                </div>

                {/* Fasting Blood Sugar > 120 (3-way toggle) */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-sm font-semibold text-text-primary">
                      Fasting Blood Sugar &gt; 120 mg/dl
                    </label>
                    <Tooltip
                      title="Fasting Blood Sugar (FBS)"
                      content="Blood glucose measured after at least 8 hours without eating. Levels above 120 mg/dl indicate potential metabolic stress or diabetes."
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "0", label: "No (<= 120 mg/dl)" },
                      { value: "1", label: "Yes (> 120 mg/dl)" },
                      { value: "unknown", label: "I don't know" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setValue("fbs", opt.value)}
                        className={`p-2.5 rounded-lg border text-xs font-medium transition-all ${
                          formValues.fbs === opt.value
                            ? "border-primary bg-primary-50 text-primary-900 font-semibold shadow-xs"
                            : "border-border bg-surface text-text-secondary hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: VITALS */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-border pb-3">
                  <h2 className="text-lg font-bold text-text-primary font-heading">
                    Step 3: Clinical Vitals & Lab Measurements
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Resting physiological vitals recorded during standard health checkups.
                  </p>
                </div>

                {/* Resting Blood Pressure */}
                <Input
                  id="trestbps"
                  type="number"
                  label="Resting Blood Pressure (Systolic)"
                  suffix="mmHg"
                  placeholder="E.g. 120"
                  helperText="Typical optimal resting systolic pressure is 90–120 mmHg."
                  required
                  error={errors.trestbps}
                  {...register("trestbps", { valueAsNumber: true })}
                />

                {/* Serum Cholesterol */}
                <Input
                  id="chol"
                  type="number"
                  label="Serum Cholesterol"
                  suffix="mg/dl"
                  placeholder="E.g. 200"
                  helperText="Desirable total cholesterol is generally under 200 mg/dl."
                  required
                  error={errors.chol}
                  {...register("chol", { valueAsNumber: true })}
                />

                {/* Max Heart Rate Achieved */}
                <Input
                  id="thalach"
                  type="number"
                  label="Maximum Heart Rate Achieved"
                  suffix="bpm"
                  placeholder="E.g. 155"
                  helperText="Peak heart rate during physical stress test (typically 220 minus age)."
                  required
                  error={errors.thalach}
                  {...register("thalach", { valueAsNumber: true })}
                />
              </div>
            )}

            {/* STEP 4: TEST RESULTS */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-border pb-3">
                  <h2 className="text-lg font-bold text-text-primary font-heading">
                    Step 4: Specialized Electrocardiogram & Diagnostic Tests
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Diagnostic parameters often available from previous ECG or lab reports.
                  </p>
                </div>

                {/* Resting ECG */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <label className="text-sm font-semibold text-text-primary">
                        Resting Electrocardiogram (ECG)
                      </label>
                      <Tooltip
                        title="Resting ECG Results"
                        content="Electrical rhythm of the heart at rest. Can detect ventricular hypertrophy or abnormal ST-T wave patterns."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { value: "0", label: "Normal ECG" },
                      { value: "1", label: "ST-T Wave Abnormality" },
                      { value: "2", label: "Left Ventricular Hypertrophy" },
                      { value: "unknown", label: "I don't know (Use baseline)" },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setValue("restecg", item.value)}
                        className={`p-2.5 rounded-lg border text-xs text-left font-medium transition-all ${
                          formValues.restecg === item.value
                            ? "border-primary bg-primary-50 text-primary-900 font-semibold ring-1 ring-primary"
                            : "border-border bg-surface text-text-secondary hover:bg-slate-50"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ST Depression (Oldpeak) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <label className="text-sm font-semibold text-text-primary">
                        ST Depression Induced by Exercise (Oldpeak)
                      </label>
                      <Tooltip
                        title="ECG ST Depression (Oldpeak)"
                        content="Measured in millimeters (0–10 mm) on an ECG graph. Indicates the degree the ST segment drops below baseline during exertion."
                      />
                    </div>
                    {formValues.oldpeak === "unknown" ? (
                      <span className="text-xs text-primary font-medium font-mono-val">
                        Estimated (0.8 mm)
                      </span>
                    ) : (
                      <span className="text-xs text-text-primary font-mono-val font-semibold">
                        {formValues.oldpeak} mm
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      disabled={formValues.oldpeak === "unknown"}
                      value={formValues.oldpeak === "unknown" ? "" : formValues.oldpeak}
                      onChange={(e) => setValue("oldpeak", e.target.value)}
                      placeholder="0.0 - 10.0 mm"
                      className="w-full text-sm rounded-lg border border-border bg-surface p-2.5 focus:ring-2 focus:ring-primary disabled:bg-slate-100 disabled:text-text-muted"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setValue(
                          "oldpeak",
                          formValues.oldpeak === "unknown" ? "0.8" : "unknown"
                        )
                      }
                      className={`shrink-0 px-3 py-2.5 text-xs font-semibold rounded-lg border transition-all ${
                        formValues.oldpeak === "unknown"
                          ? "bg-primary-100 text-primary-900 border-primary-200"
                          : "border-border text-text-secondary hover:bg-slate-50"
                      }`}
                    >
                      {formValues.oldpeak === "unknown" ? "Using Default" : "I don't know"}
                    </button>
                  </div>
                </div>

                {/* Slope of Peak Exercise ST Segment */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <label className="text-sm font-semibold text-text-primary">
                      Slope of Peak Exercise ST Segment
                    </label>
                    <Tooltip
                      title="ST Segment Slope"
                      content="The upward or downward trajectory of the ECG waveform at peak exercise capacity."
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: "0", label: "Upsloping" },
                      { value: "1", label: "Flat" },
                      { value: "2", label: "Downsloping" },
                      { value: "unknown", label: "I don't know" },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setValue("slope", item.value)}
                        className={`p-2 rounded-lg border text-xs text-center font-medium transition-all ${
                          formValues.slope === item.value
                            ? "border-primary bg-primary-50 text-primary-900 font-semibold ring-1 ring-primary"
                            : "border-border bg-surface text-text-secondary hover:bg-slate-50"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Major Vessels Colored by Fluoroscopy (ca) */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <label className="text-sm font-semibold text-text-primary">
                      Major Vessels Colored by Fluoroscopy (0–3)
                    </label>
                    <Tooltip
                      title="Fluoroscopy Vessels (CA)"
                      content="Number of major coronary vessels highlighted via fluoroscopic contrast dye during specialized cardiac imaging."
                    />
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {["0", "1", "2", "3", "unknown"].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setValue("ca", val)}
                        className={`p-2 rounded-lg border text-xs text-center font-medium transition-all ${
                          formValues.ca === val
                            ? "border-primary bg-primary-50 text-primary-900 font-semibold ring-1 ring-primary"
                            : "border-border bg-surface text-text-secondary hover:bg-slate-50"
                        }`}
                      >
                        {val === "unknown" ? "Don't know" : `${val} vessels`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thalassemia (thal) */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <label className="text-sm font-semibold text-text-primary">
                      Thallium Stress Scintigraphy / Perfusion
                    </label>
                    <Tooltip
                      title="Thallium Perfusion Status"
                      content="Nuclear imaging marker evaluating blood flow to heart muscle: Normal, Fixed defect (past scar), or Reversible defect (stress-induced ischemia)."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { value: "1", label: "Normal Blood Flow" },
                      { value: "2", label: "Fixed Defect" },
                      { value: "3", label: "Reversible Defect" },
                      { value: "unknown", label: "I don't know (Estimate)" },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setValue("thal", item.value)}
                        className={`p-2.5 rounded-lg border text-xs text-left font-medium transition-all ${
                          formValues.thal === item.value
                            ? "border-primary bg-primary-50 text-primary-900 font-semibold ring-1 ring-primary"
                            : "border-border bg-surface text-text-secondary hover:bg-slate-50"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="pt-6 border-t border-border flex items-center justify-between gap-3">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  icon={ArrowLeft}
                  onClick={handleBack}
                >
                  Back
                </Button>
              ) : (
                <div />
              )}

              <Button
                type="button"
                onClick={handleContinue}
                icon={currentStep === 4 ? HeartPulse : ArrowRight}
                iconPosition="right"
                size="md"
              >
                {currentStep === 4 ? "Get My Results" : "Continue to Step " + (currentStep + 1)}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
