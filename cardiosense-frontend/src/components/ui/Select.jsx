import React, { forwardRef } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";

/**
 * Accessible Select component with inline error and options support.
 */
export const Select = forwardRef(({
  id,
  name,
  label,
  options = [],
  placeholder = "Select an option",
  helperText,
  error,
  required = false,
  className = "",
  disabled = false,
  children,
  ...props
}, ref) => {
  const selectId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        <select
          ref={ref}
          id={selectId}
          name={name}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
          }
          className={`block w-full appearance-none rounded-lg text-text-primary bg-surface transition-colors duration-150 text-sm py-2.5 pl-3.5 pr-10 border ${
            error
              ? "border-error focus:border-error focus:ring-1 focus:ring-error"
              : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
          } ${disabled ? "bg-slate-50 text-text-muted cursor-not-allowed" : ""}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-muted">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error ? (
        <div id={`${selectId}-error`} className="flex items-center gap-1.5 mt-1.5 text-xs text-error">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error.message || error}</span>
        </div>
      ) : helperText ? (
        <p id={`${selectId}-helper`} className="text-xs text-text-secondary mt-1.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Select.displayName = "Select";
