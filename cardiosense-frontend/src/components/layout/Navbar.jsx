import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Activity, Heart, Menu, X, User, LogOut, Sparkles, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePrediction } from "../../context/PredictionContext";
import { Button } from "../ui/Button";

export const Navbar = () => {
  const { user, isLoggedIn, isGuest, logout } = useAuth();
  const { currentPrediction } = usePrediction();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate("/login");
  };

  const navLinkClasses = ({ isActive }) =>
    `text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
      isActive
        ? "text-primary font-semibold bg-primary-50"
        : "text-text-secondary hover:text-text-primary hover:bg-slate-50"
    }`;

  const resultsUrl = currentPrediction ? `/results/${currentPrediction.id}` : "/results";

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border transition-shadow">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm group-hover:bg-primary-dark transition-colors">
              <Activity className="w-5 h-5 animate-pulse-calm" />
            </div>
            <div>
              <span className="text-xl font-bold font-heading text-text-primary tracking-tight group-hover:text-primary transition-colors">
                Cardio<span className="text-primary">Sense</span>
              </span>
              <span className="block text-[10px] text-text-muted uppercase tracking-widest font-semibold -mt-1">
                Pattern Analyzer
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/dashboard" className={navLinkClasses}>
              Dashboard
            </NavLink>
            <NavLink to={resultsUrl} className={navLinkClasses}>
              Results & SHAP
            </NavLink>
            <NavLink to="/reviews" className={navLinkClasses}>
              Community Reviews
            </NavLink>
            <NavLink to="/about" className={navLinkClasses}>
              About the Model
            </NavLink>
          </nav>

          {/* User Auth Action & CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 text-sm text-text-primary bg-slate-50 border border-border px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-900 flex items-center justify-center text-xs font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="font-medium truncate max-w-[120px]">{user.name}</span>
                  {isGuest && (
                    <span className="text-[10px] bg-slate-200 text-text-secondary px-1.5 py-0.5 rounded font-mono-val">
                      Guest
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-lg border border-border py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-border text-xs text-text-secondary">
                      <div className="font-semibold text-text-primary truncate">{user.name}</div>
                      <div className="text-[11px] truncate text-text-muted">{user.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-error hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isGuest ? "Exit Guest Mode" : "Sign Out"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Log In
                </Button>
              </Link>
            )}

            <Link to="/dashboard">
              <Button size="sm" icon={Heart} className="shadow-xs">
                Check Health Pattern
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface px-4 pt-2 pb-6 space-y-2 shadow-lg">
          <NavLink
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-text-primary hover:bg-slate-50"
          >
            Dashboard
          </NavLink>
          <NavLink
            to={resultsUrl}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-text-primary hover:bg-slate-50"
          >
            Results & SHAP Analysis
          </NavLink>
          <NavLink
            to="/reviews"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-text-primary hover:bg-slate-50"
          >
            Community Reviews
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-text-primary hover:bg-slate-50"
          >
            About the Model
          </NavLink>

          <div className="pt-4 border-t border-border flex flex-col gap-2">
            {isLoggedIn ? (
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                <div className="text-xs">
                  <div className="font-semibold text-text-primary">{user.name}</div>
                  <div className="text-text-muted">{user.email}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={handleLogout} className="text-error">
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" fullWidth size="md">
                  Log In / Sign Up
                </Button>
              </Link>
            )}
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button fullWidth size="md" icon={Heart}>
                Start New Evaluation
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
