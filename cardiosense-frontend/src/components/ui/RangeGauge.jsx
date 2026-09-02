import React from "react";
import { CLINICAL_REFERENCE_RANGES } from "../../utils/severityUtils";

/**
 * Visual horizontal mini-gauge displaying a patient value relative to typical healthy reference zones.
 */
export const RangeGauge = ({
  featureKey,
  value,
  customLabel,
  customUnit,
  customMin,
  customMax,
  customHealthyMin,
  customHealthyMax,
}) => {
  const refData = CLINICAL_REFERENCE_RANGES[featureKey] || {
    label: customLabel || featureKey,
    unit: customUnit || "",
    min: customMin || 0,
    max: customMax || 200,
    healthyMin: customHealthyMin || 60,
    healthyMax: customHealthyMax || 120,
    description: "",
  };

  const val = Number(value);
  const min = refData.min;
  const max = refData.max;
  const healthyMin = refData.healthyMin;
  const healthyMax = refData.healthyMax;

  // Calculate percentage positions (clamped between 0% and 100%)
  const clampPercent = (v) => Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
  const valPos = clampPercent(val);
  const healthyStart = clampPercent(healthyMin);
  const healthyEnd = clampPercent(healthyMax);
  const healthyWidth = healthyEnd - healthyStart;

  const isHealthy = val >= healthyMin && val <= healthyMax;
  const isElevated = val > healthyMax;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-card hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            {refData.label}
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold text-text-primary font-mono-val">
              {isNaN(val) ? "—" : val}
            </span>
            <span className="text-xs text-text-muted font-medium">{refData.unit}</span>
          </div>
        </div>

        <div>
          <span
            className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-medium ${
              isHealthy
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : isElevated
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : "bg-slate-50 text-slate-700 border border-slate-200"
            }`}
          >
            {isHealthy ? "Standard range" : isElevated ? "Elevated vs baseline" : "Below baseline"}
          </span>
        </div>
      </div>

      {/* Visual Slider / Gauge Bar */}
      <div className="mt-4 relative pt-4 pb-1">
        {/* Value Marker Pin */}
        <div
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
          style={{ left: `${valPos}%` }}
        >
          <span className="text-[10px] font-mono-val font-semibold px-1.5 py-0.5 rounded bg-text-primary text-white shadow-xs">
            {val}
          </span>
          <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-text-primary mt-0.5" />
        </div>

        {/* Track */}
        <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          {/* Healthy Range Highlight */}
          <div
            className="absolute top-0 bottom-0 bg-primary-200/90 rounded-full"
            style={{
              left: `${healthyStart}%`,
              width: `${healthyWidth}%`,
            }}
            title={`Healthy reference: ${healthyMin} – ${healthyMax} ${refData.unit}`}
          />
        </div>

        {/* Scale labels */}
        <div className="flex justify-between items-center text-[10px] text-text-muted mt-1.5 font-mono-val">
          <span>{min}</span>
          <span className="text-primary-dark font-medium">
            Optimal: {healthyMin}–{healthyMax} {refData.unit}
          </span>
          <span>{max}</span>
        </div>
      </div>

      {refData.description && (
        <p className="text-[11px] text-text-muted mt-2 border-t border-slate-100 pt-2 line-clamp-1">
          {refData.description}
        </p>
      )}
    </div>
  );
};
