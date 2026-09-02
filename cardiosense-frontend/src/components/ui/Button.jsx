import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Standardized Button component.
 * Follows the medical teal aesthetic and accessibility standards.
 */
export const Button = ({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  isLoading = false,
  loadingText,
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,
  className = "",
  onClick,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  const variantStyles = {
    primary: "bg-primary hover:bg-primary-dark text-white shadow-sm hover:shadow focus:ring-primary active:bg-primary-dark",
    secondary: "bg-secondary hover:bg-secondary-dark text-white shadow-sm hover:shadow focus:ring-secondary",
    outline: "border border-primary text-primary hover:bg-primary-50 bg-transparent focus:ring-primary",
    outlineSecondary: "border border-border text-text-primary hover:bg-slate-50 bg-surface focus:ring-primary",
    ghost: "text-text-secondary hover:text-text-primary hover:bg-slate-100 bg-transparent focus:ring-primary",
    danger: "bg-error text-white hover:bg-red-700 focus:ring-error",
    softTeal: "bg-primary-100 text-primary-900 hover:bg-primary-200 focus:ring-primary",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === "right" && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};
