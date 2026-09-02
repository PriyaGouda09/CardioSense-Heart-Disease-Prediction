import React from "react";
import { getSeverityInfo } from "../../utils/severityUtils";

/**
 * Standardized Badge and Pill component for severity classes and tags.
 */
export const Badge = ({
  children,
  variant = "default",
  severityClass,
  size = "md",
  icon: Icon,
  className = "",
}) => {
  const sizeStyles = {
    sm: "text-xs px-2.5 py-0.5 gap-1",
    md: "text-xs px-3 py-1 gap-1.5 font-medium",
    lg: "text-sm px-4 py-1.5 gap-2 font-semibold",
  };

  if (severityClass !== undefined && severityClass !== null) {
    const sev = getSeverityInfo(severityClass);
    return (
      <span
        style={{
          backgroundColor: sev.lightBg,
          color: sev.textColor,
          borderColor: sev.borderColor,
        }}
        className={`inline-flex items-center rounded-full border shadow-xs ${sizeStyles[size]} ${className}`}
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: sev.color }}
        />
        <span>{children || sev.badgeLabel}</span>
      </span>
    );
  }

  const variantStyles = {
    default: "bg-slate-100 text-text-secondary border-slate-200",
    primary: "bg-primary-100 text-primary-900 border-primary-200",
    secondary: "bg-secondary-50 text-secondary-dark border-secondary-light",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    error: "bg-red-50 text-red-800 border-red-200",
    doctorConfirmed: "bg-[#EBF7F2] text-[#1B6F52] border-[#B9E5D4]",
    outline: "border border-border text-text-secondary bg-surface",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.default} ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};
