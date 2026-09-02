import React from "react";

/**
 * Shimmer skeleton loader for loading states.
 */
export const Skeleton = ({ className = "", variant = "rect" }) => {
  const variantStyles = {
    rect: "rounded-lg",
    circle: "rounded-full",
    card: "rounded-xl",
  };

  return (
    <div
      className={`animate-pulse bg-slate-200/80 ${variantStyles[variant] || variantStyles.rect} ${className}`}
      aria-hidden="true"
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-surface border border-border rounded-xl p-6 shadow-card space-y-4">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-4 w-3/4" />
    <div className="space-y-2 pt-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
);
