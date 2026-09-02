import React from "react";
import { Check } from "lucide-react";

/**
 * 4-Step Progress Stepper component for the Patient Dashboard multi-step form.
 */
export const ProgressStepper = ({
  steps = [
    { id: 1, label: "Demographics", description: "Age & biological sex" },
    { id: 2, label: "Symptoms", description: "Chest pain & exertion" },
    { id: 3, label: "Vitals", description: "Blood pressure & cholesterol" },
    { id: 4, label: "Test Results", description: "ECG & diagnostic tests" },
  ],
  currentStep = 1,
  onStepClick,
}) => {
  return (
    <div className="w-full mb-8">
      {/* Desktop / Tablet Stepper */}
      <nav aria-label="Progress" className="hidden sm:block">
        <ol className="flex items-center justify-between w-full">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const isClickable = onStepClick && step.id < currentStep;

            return (
              <li
                key={step.id}
                className={`relative flex-1 ${
                  index !== steps.length - 1 ? "pr-4" : ""
                }`}
              >
                <div className="flex items-center">
                  <button
                    type="button"
                    disabled={!isClickable}
                    onClick={() => isClickable && onStepClick(step.id)}
                    className={`flex items-center gap-3 text-left focus:outline-none transition-colors ${
                      isClickable ? "cursor-pointer group" : "cursor-default"
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 transition-all ${
                        isCompleted
                          ? "bg-primary text-white"
                          : isCurrent
                          ? "bg-primary-100 text-primary-900 border-2 border-primary"
                          : "bg-slate-100 text-text-muted border border-border"
                      } ${isClickable ? "group-hover:ring-2 group-hover:ring-primary/40" : ""}`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 text-white stroke-[2.5]" />
                      ) : (
                        step.id
                      )}
                    </span>
                    <div>
                      <div
                        className={`text-xs font-semibold tracking-tight ${
                          isCurrent
                            ? "text-primary-dark font-heading"
                            : isCompleted
                            ? "text-text-primary"
                            : "text-text-muted"
                        }`}
                      >
                        {step.label}
                      </div>
                      <div className="text-[11px] text-text-secondary line-clamp-1 hidden md:block">
                        {step.description}
                      </div>
                    </div>
                  </button>
                </div>

                {index !== steps.length - 1 && (
                  <div
                    className={`absolute top-4.5 left-full -translate-x-full h-0.5 w-full -z-10 transition-colors ${
                      currentStep > step.id ? "bg-primary" : "bg-border"
                    }`}
                    style={{ left: "calc(50% + 20px)", width: "calc(100% - 40px)" }}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile Stepper Bar */}
      <div className="sm:hidden bg-surface p-4 rounded-xl border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-primary font-heading">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.label}
          </span>
          <span className="text-xs text-text-muted font-mono-val">
            {Math.round((currentStep / steps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
