import React from "react";
import { Link } from "react-router-dom";
import { Activity, ShieldAlert, Heart, ExternalLink } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      {/* Persistent Mandatory Educational Disclaimer Banner */}
      <div className="bg-primary-50/60 border-b border-primary-100 py-3.5 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2.5 text-center text-xs sm:text-sm text-primary-900 font-medium">
          <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong>Educational Demo Only:</strong> CardioSense does not provide medical diagnosis or treatment advice. Always consult a qualified healthcare professional.
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold font-heading text-text-primary">
                Cardio<span className="text-primary">Sense</span>
              </span>
            </div>
            <p className="text-sm text-text-secondary max-w-sm">
              Understand your heart health patterns with clinical risk analysis and transparent factor attribution.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading mb-3">
              Application
            </h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  About CardioSense
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-primary transition-colors">
                  Patient Assessment
                </Link>
              </li>
              <li>
                <Link to="/results" className="hover:text-primary transition-colors">
                  Results & Analysis
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-primary transition-colors">
                  Community Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Reference & Research */}
          <div>
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading mb-3">
              Research & Guidance
            </h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <a
                  href="https://archive.ics.uci.edu/dataset/45/heart+disease"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <span>UCI Heart Dataset</span>
                  <ExternalLink className="w-3 h-3 text-text-muted" />
                </a>
              </li>
              <li>
                <Link to="/about#limitations" className="hover:text-primary transition-colors">
                  Clinical Boundaries
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  Assessment Procedure
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary transition-colors">
                  Guest / Account Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div>
            &copy; {new Date().getFullYear()} CardioSense. Designed for health education and machine learning research demonstration.
          </div>
        </div>
      </div>
    </footer>
  );
};
