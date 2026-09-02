import React, { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

/**
 * Accessible Input with inline validation error (icon + text) and focus states.
 */
export const Input = forwardRef(({
  id,
  name,
  label,
  type = "text",
  placeholder,
  helperText,
  error,
  required = false,
  suffix,
  prefix,
  className = "",
  disabled = false,
  ...props
}, ref) => {
  const inputId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        {prefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-text-muted text-sm">{prefix}</span>
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          className={`block w-full rounded-lg text-text-primary bg-surface transition-colors duration-150 text-sm py-2.5 px-3.5 border ${
            error
              ? "border-error focus:border-error focus:ring-1 focus:ring-error"
              : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
          } ${prefix ? "pl-9" : ""} ${suffix ? "pr-16" : ""} ${
            disabled ? "bg-slate-50 text-text-muted cursor-not-allowed" : ""
          }`}
          {...props}
        />

        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
            <span className="text-text-secondary text-xs font-mono-val font-medium">{suffix}</span>
          </div>
        )}
      </div>

      {error ? (
        <div id={`${inputId}-error`} className="flex items-center gap-1.5 mt-1.5 text-xs text-error">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error.message || error}</span>
        </div>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="text-xs text-text-secondary mt-1.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Input.displayName = "Input";
