import React from "react";

/**
 * Standardized Card component:
 * White surface, 1px border (#E2E8E6), rounded-xl, soft minimal shadow.
 */
export const Card = ({
  children,
  className = "",
  padding = "p-6 md:p-8",
  hover = false,
  onClick,
  ...props
}) => {
  const hoverStyles = hover ? "transition-all duration-200 hover:shadow-md hover:border-primary-200 cursor-pointer" : "";

  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-border rounded-xl shadow-card ${hoverStyles} ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = "" }) => (
  <div className={`flex items-start justify-between gap-4 mb-5 ${className}`}>
    <div>
      {title && <h3 className="text-lg md:text-xl font-semibold text-text-primary">{title}</h3>}
      {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div className={`mt-6 pt-5 border-t border-border flex items-center justify-between gap-3 ${className}`}>
    {children}
  </div>
);
