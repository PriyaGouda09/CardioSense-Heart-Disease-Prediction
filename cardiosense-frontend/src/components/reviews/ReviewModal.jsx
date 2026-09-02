import React, { useState } from "react";
import { Star, ShieldCheck, Lock, Check } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

export const ReviewModal = ({
  isOpen,
  onClose,
  predictedSeverityClass = 2,
  onAddReview,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [ageRange, setAgeRange] = useState("40–50");
  const [outcome, setOutcome] = useState("Not yet diagnosed");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate mock save delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const newReview = {
      id: "rev-" + Date.now(),
      authorLabel: "Patient " + String.fromCharCode(65 + Math.floor(Math.random() * 26)),
      ageRange: ageRange,
      predictedClass: predictedSeverityClass,
      rating: rating,
      confirmedOutcome: outcome,
      confirmedByDoctor: outcome === "Confirmed similar" || outcome === "Confirmed different",
      timestamp: "Just now",
      comment: comment.trim() || "Shared feedback on prediction clarity and follow-up consultation.",
    };

    if (onAddReview) {
      onAddReview(newReview);
    }

    setIsSubmitting(false);
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setComment("");
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Your Experience"
      subtitle="Help other patients and researchers understand how CardioSense's educational patterns perform in practice."
      maxWidth="max-w-md"
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <h4 className="text-lg font-bold text-text-primary font-heading">Thank You!</h4>
          <p className="text-sm text-text-secondary">
            Your anonymized feedback has been safely shared with the community.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Privacy Notice Box */}
          <div className="bg-primary-50/70 border border-primary-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-primary-900">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <strong>Privacy Guaranteed:</strong> Exact clinical numbers (BP, cholesterol, ECG details) are NEVER published. Only your general age range, rating, and notes are shown.
            </div>
          </div>

          {/* Star Rating Input */}
          <div>
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
              How accurate / helpful did this result feel?
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition-colors"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs text-text-secondary font-medium ml-2 font-mono-val">
                {rating} / 5 stars
              </span>
            </div>
          </div>

          {/* Age Range Select (Safe anonymization) */}
          <div>
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
              Your Age Range (Anonymized)
            </label>
            <select
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              className="w-full text-sm rounded-lg border border-border bg-surface px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="20–30">20–30 years</option>
              <option value="30–40">30–40 years</option>
              <option value="40–50">40–50 years</option>
              <option value="50–60">50–60 years</option>
              <option value="60–70">60–70 years</option>
              <option value="70+">70+ years</option>
            </select>
          </div>

          {/* Real Outcome Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
              Did a doctor evaluate this afterwards? (Optional)
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full text-sm rounded-lg border border-border bg-surface px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="Not yet diagnosed">Not yet evaluated by a physician</option>
              <option value="Confirmed similar">Confirmed similar by physician / cardiologist</option>
              <option value="Confirmed different">Confirmed different after clinical tests</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          {/* Feedback Comment */}
          <div>
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
              Your Experience / Comments
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="E.g., Discussed the SHAP factors with my doctor during a routine checkup..."
              className="w-full text-sm rounded-lg border border-border bg-surface p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none placeholder:text-text-muted"
            />
          </div>

          {/* Locked Anonymous Checkbox */}
          <div className="flex items-center gap-2 text-xs text-text-secondary bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              id="anon-check"
              checked
              disabled
              className="rounded text-primary focus:ring-primary h-4 w-4"
            />
            <label htmlFor="anon-check" className="flex items-center gap-1 cursor-not-allowed">
              <Lock className="w-3 h-3 text-text-muted" />
              <span>Share anonymously without personal or exact clinical numbers</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} loadingText="Submitting...">
              Post Review
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
