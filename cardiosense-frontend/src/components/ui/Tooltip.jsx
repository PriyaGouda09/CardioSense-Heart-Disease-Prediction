import React, { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

/**
 * Accessible Clinical Info Tooltip for plain-language medical explanations.
 */
export const Tooltip = ({
  content,
  title,
  children,
  position = "top",
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target)
      ) {
        setIsVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const positionStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Clinical information"
        aria-expanded={isVisible}
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="text-text-muted hover:text-primary transition-colors p-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {children || <Info className="w-4 h-4" />}
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`absolute z-50 w-64 max-w-xs p-3 bg-text-primary text-white text-xs rounded-lg shadow-lg pointer-events-none transition-all duration-150 ${positionStyles[position]}`}
        >
          {title && <div className="font-semibold text-primary-200 mb-1">{title}</div>}
          <div className="leading-relaxed text-slate-200">{content}</div>
        </div>
      )}
    </div>
  );
};
