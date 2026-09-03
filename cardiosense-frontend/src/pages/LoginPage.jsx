import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Activity, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";

// Robust Email Regex matching RFC standard format
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

// Validation Schema for Log In
const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .required("Email address is required")
    .matches(EMAIL_REGEX, "Please enter a valid email address (e.g. user@example.com)"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// Validation Schema for Sign Up
const signupSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Display name is required")
    .min(2, "Name must be at least 2 characters"),
  email: yup
    .string()
    .trim()
    .required("Email address is required")
    .matches(EMAIL_REGEX, "Please enter a valid email address (e.g. user@example.com)"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password"), null], "Passwords must match"),
  consentDisclaimer: yup
    .boolean()
    .oneOf([true], "You must acknowledge the educational disclaimer to sign up"),
});

export const LoginPage = () => {
  const [activeTab, setActiveTab] = useState("login"); // "login" | "signup"
  const [authError, setAuthError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmailSent, setForgotEmailSent] = useState(false);

  const { login, signup, loginWithGoogle, continueAsGuest } = useAuth();
  const navigate = useNavigate();

  // Login Form Hook
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    setValue: setLoginValue,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
    reset: resetLoginForm,
  } = useForm({
    mode: "onTouched",
    resolver: yupResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Signup Form Hook
  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    watch: watchSignup,
    formState: { errors: signupErrors, isSubmitting: isSignupSubmitting },
    reset: resetSignupForm,
  } = useForm({
    mode: "onTouched",
    resolver: yupResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      consentDisclaimer: false,
    },
  });

  const consentDisclaimerChecked = watchSignup("consentDisclaimer");

  const onLogin = async (data) => {
    try {
      setAuthError("");
      await login(data.email.trim(), data.password);
      navigate("/dashboard");
    } catch (err) {
      setAuthError(err.message || "Invalid email or password. Please try again.");
    }
  };

  const onSignup = async (data) => {
    try {
      setAuthError("");
      await signup(data.name.trim(), data.email.trim(), data.password);
      navigate("/dashboard");
    } catch (err) {
      setAuthError(err.message || "Could not create account. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthError("");
      await loginWithGoogle();
      navigate("/dashboard");
    } catch {
      setAuthError("Google sign-in failed. Please try again.");
    }
  };

  const handleGuestContinue = () => {
    continueAsGuest();
    navigate("/dashboard");
  };

  const handleFillDemo = (demoEmail, demoPass = "patient123") => {
    setAuthError("");
    setLoginValue("email", demoEmail, { shouldValidate: true, shouldTouch: true });
    setLoginValue("password", demoPass, { shouldValidate: true, shouldTouch: true });
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setAuthError("");
    resetLoginForm();
    resetSignupForm();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-bg to-white">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white shadow-md mx-auto mb-2">
            <Activity className="w-7 h-7 animate-pulse-calm" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary tracking-tight">
            Welcome to Cardio<span className="text-primary">Sense</span>
          </h1>
          <p className="text-sm text-text-secondary">
            Sign in to track assessments, save results, and generate clinical reports
          </p>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="bg-red-50 border border-red-200 text-error rounded-xl p-3.5 flex items-start gap-2.5 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Main Card */}
        <Card className="shadow-lg border-border/80 p-6 sm:p-8">
          {/* Segmented Control Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200/80">
            <button
              type="button"
              onClick={() => switchTab("login")}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                activeTab === "login"
                  ? "bg-surface text-primary-dark shadow-xs"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => switchTab("signup")}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                activeTab === "signup"
                  ? "bg-surface text-primary-dark shadow-xs"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* LOG IN FORM */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
              {/* Demo Quick Fill Options */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-text-secondary">
                  <span className="uppercase tracking-wider">Quick Fill Demo</span>
                  <span className="text-text-muted">Click to fill</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleFillDemo("patient@cardiosense.com", "patient123")}
                    className="px-2.5 py-1 rounded-lg bg-surface hover:bg-primary-50 hover:border-primary-200 border border-border text-text-primary text-xs font-medium transition-colors shadow-xs"
                  >
                    👤 patient@cardiosense.com
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemo("doctor@cardiosense.com", "doctor123")}
                    className="px-2.5 py-1 rounded-lg bg-surface hover:bg-primary-50 hover:border-primary-200 border border-border text-text-primary text-xs font-medium transition-colors shadow-xs"
                  >
                    🩺 doctor@cardiosense.com
                  </button>
                </div>
              </div>

              <Input
                id="login-email"
                type="email"
                label="Email address"
                placeholder="name@example.com"
                helperText="Enter a valid email address (e.g. user@domain.com)"
                required
                error={loginErrors.email}
                {...registerLogin("email")}
              />

              <div>
                <Input
                  id="login-password"
                  type="password"
                  label="Password"
                  placeholder="••••••••"
                  required
                  error={loginErrors.password}
                  {...registerLogin("password")}
                />
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-primary hover:text-primary-dark font-medium transition-colors focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                size="md"
                isLoading={isLoginSubmitting}
                loadingText="Signing in..."
                className="mt-2"
              >
                Log In to CardioSense
              </Button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs text-text-muted bg-surface px-2">
                  <span>or continue with</span>
                </div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-border bg-surface hover:bg-slate-50 text-text-primary text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-4">
              <Input
                id="signup-name"
                label="Full name or alias"
                placeholder="Alex Morgan"
                required
                error={signupErrors.name}
                {...registerSignup("name")}
              />

              <Input
                id="signup-email"
                type="email"
                label="Email address"
                placeholder="name@example.com"
                helperText="Enter a valid email address (e.g. user@domain.com)"
                required
                error={signupErrors.email}
                {...registerSignup("email")}
              />

              <Input
                id="signup-password"
                type="password"
                label="Create password"
                placeholder="Min. 8 characters"
                helperText="Must contain at least 8 characters"
                required
                error={signupErrors.password}
                {...registerSignup("password")}
              />

              <Input
                id="signup-confirmPassword"
                type="password"
                label="Confirm password"
                placeholder="Re-type password"
                required
                error={signupErrors.confirmPassword}
                {...registerSignup("confirmPassword")}
              />

              {/* Required Educational Disclaimer Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 p-3 rounded-lg bg-primary-50/70 border border-primary-100 cursor-pointer">
                  <input
                    type="checkbox"
                    id="consent-checkbox"
                    className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4 shrink-0"
                    {...registerSignup("consentDisclaimer")}
                  />
                  <span className="text-xs text-primary-900 leading-relaxed">
                    <strong>Required:</strong> I understand CardioSense is an educational health tool and does not formulate a medical diagnosis.
                  </span>
                </label>
                {signupErrors.consentDisclaimer && (
                  <p className="flex items-center gap-1 text-xs text-error mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{signupErrors.consentDisclaimer.message}</span>
                  </p>
                )}
              </div>

              <Button
                type="submit"
                fullWidth
                size="md"
                disabled={!consentDisclaimerChecked || isSignupSubmitting}
                isLoading={isSignupSubmitting}
                loadingText="Creating account..."
                className="mt-2"
              >
                Create CardioSense Account
              </Button>
            </form>
          )}

          {/* Guest Link */}
          <div className="mt-6 pt-5 border-t border-border text-center">
            <button
              type="button"
              onClick={handleGuestContinue}
              className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary font-medium transition-colors"
            >
              <span>Continue as Guest</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <p className="text-[11px] text-text-muted mt-0.5">
              Guest visitors can test predictions freely without saving history
            </p>
          </div>
        </Card>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-text-primary font-heading">
              Reset Password
            </h3>
            {forgotEmailSent ? (
              <div className="space-y-3 text-center py-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-xs text-text-secondary">
                  If that email exists in our registry, a password reset link has been dispatched.
                </p>
                <Button
                  fullWidth
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotEmailSent(false);
                  }}
                >
                  Back to Log In
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-text-secondary">
                  Enter your registered email to receive password reset instructions.
                </p>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full text-sm rounded-lg border border-border bg-surface p-2.5 focus:ring-2 focus:ring-primary"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setForgotEmailSent(true)}
                  >
                    Send Reset Link
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
