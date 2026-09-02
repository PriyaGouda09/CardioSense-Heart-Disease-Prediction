import React, { useState, useMemo } from "react";
import {
  Users,
  Star,
  CheckCircle2,
  Filter,
  MessageSquarePlus,
  ShieldCheck,
  User,
  Search,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { INITIAL_REVIEWS } from "../data/mockReviews";
import { SEVERITY_CLASSES } from "../utils/severityUtils";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ReviewModal } from "../components/reviews/ReviewModal";
import { useAuth } from "../context/AuthContext";
import { usePrediction } from "../context/PredictionContext";

export const ReviewsPage = () => {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [selectedSeverity, setSelectedSeverity] = useState("all"); // "all" | "0" | "1" | "2" | "3" | "4"
  const [onlyConfirmed, setOnlyConfirmed] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { isLoggedIn, isGuest } = useAuth();
  const { currentPrediction } = usePrediction();

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((item) => {
      // Filter by class
      if (selectedSeverity !== "all" && item.predictedClass !== parseInt(selectedSeverity, 10)) {
        return false;
      }
      // Filter by confirmed outcome
      if (onlyConfirmed && !item.confirmedByDoctor) {
        return false;
      }
      // Search query in comment
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.comment.toLowerCase().includes(q) ||
          item.authorLabel.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reviews, selectedSeverity, onlyConfirmed, searchQuery]);

  // Aggregate stats calculations
  const totalReviewsCount = reviews.length;
  const positiveAccuracyPct = Math.round(
    (reviews.filter((r) => r.rating >= 4).length / (reviews.length || 1)) * 100
  );
  const confirmedDiagnosisPct = Math.round(
    (reviews.filter((r) => r.confirmedByDoctor).length / (reviews.length || 1)) * 100
  );

  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddReview = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  const severityFilterOptions = [
    { value: "all", label: "All Severity Classes" },
    { value: "0", label: "Class 0 (No Disease)" },
    { value: "1", label: "Class 1 (Mild)" },
    { value: "2", label: "Class 2 (Moderate)" },
    { value: "3", label: "Class 3 (Severe)" },
    { value: "4", label: "Class 4 (Very Severe)" },
  ];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header & Tagline */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <Badge variant="primary" size="sm" className="mb-2">
            Community Observations
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary">
            Community Reviews & Feedback
          </h1>
          <p className="text-sm text-text-secondary mt-1 max-w-2xl">
            Anonymized, opt-in feedback from users who compared CardioSense's educational pattern predictions with real clinical follow-ups.
          </p>
        </div>

        {/* CTA Button */}
        <Button
          icon={MessageSquarePlus}
          onClick={() => setIsModalOpen(true)}
          className="shadow-sm shrink-0"
        >
          Share Your Experience
        </Button>
      </div>

      {/* 1. HEADER STATS SECTION */}
      <section className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card padding="p-6" className="text-center space-y-1 bg-surface">
            <div className="text-3xl font-extrabold text-primary font-heading">
              1,428
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Total Reviews Submitted
            </div>
            <p className="text-[11px] text-text-secondary">
              Community contributors across all age groups
            </p>
          </Card>

          <Card padding="p-6" className="text-center space-y-1 bg-surface">
            <div className="text-3xl font-extrabold text-emerald-700 font-heading">
              88.4%
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Reported Prediction Felt Accurate
            </div>
            <p className="text-[11px] text-text-secondary">
              Rated 4 or 5 stars for clarity and relevance
            </p>
          </Card>

          <Card padding="p-6" className="text-center space-y-1 bg-surface">
            <div className="text-3xl font-extrabold text-secondary font-heading">
              64.2%
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Confirmed with Real Diagnosis
            </div>
            <p className="text-[11px] text-text-secondary">
              Validated during physician checkup or lab panel
            </p>
          </Card>
        </div>

        <p className="text-xs text-center text-text-muted italic pt-1">
          * Based on unverified, self-reported user feedback — not clinical data.
        </p>
      </section>

      {/* 2. FILTER BAR & CONTROLS */}
      <section className="bg-surface border border-border rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Class Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-text-muted" /> Filter:
            </span>
            {severityFilterOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedSeverity(opt.value)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  selectedSeverity === opt.value
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-100 text-text-secondary hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search & Confirmed Toggle */}
          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
            {/* Confirmed outcome toggle */}
            <label className="flex items-center gap-2 text-xs font-medium text-text-primary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyConfirmed}
                onChange={(e) => setOnlyConfirmed(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
              <span>Only show confirmed doctor outcomes</span>
            </label>

            {/* Quick search input */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search comments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-lg border border-border bg-slate-50 pl-8 pr-3 py-1.5 focus:bg-surface focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. REVIEW CARDS GRID */}
      <section>
        {filteredReviews.length === 0 ? (
          /* 4. EMPTY STATE */
          <div className="text-center py-16 bg-surface border border-dashed border-border rounded-2xl p-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-text-muted flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-text-primary font-heading">
                No reviews yet for this filter
              </h3>
              <p className="text-xs text-text-secondary">
                Try selecting "All Severity Classes" or unchecking the confirmed outcome filter.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedSeverity("all");
                setOnlyConfirmed(false);
                setSearchQuery("");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredReviews.map((review) => {
              const isLongComment = review.comment.length > 130;
              const isExpanded = expandedCards[review.id];
              const displayedText = isLongComment && !isExpanded
                ? `${review.comment.substring(0, 130)}...`
                : review.comment;

              return (
                <Card
                  key={review.id}
                  padding="p-5 sm:p-6"
                  className="flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all shadow-card"
                >
                  {/* Top metadata */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {/* Generic anonymous avatar icon — never photos */}
                        <div className="w-9 h-9 rounded-full bg-primary-50 text-primary flex items-center justify-center shrink-0 border border-primary-100">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-text-primary font-heading flex items-center gap-1.5">
                            <span>{review.authorLabel}</span>
                            <span className="text-[10px] text-text-muted font-normal">
                              (Age {review.ageRange})
                            </span>
                          </div>
                          <span className="text-[11px] text-text-muted">
                            {review.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* Predicted Severity Badge */}
                      <Badge
                        severityClass={review.predictedClass}
                        size="sm"
                      />
                    </div>

                    {/* Star Rating & Doctor Confirmation */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              review.rating >= s ? "fill-amber-400" : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>

                      {review.confirmedByDoctor && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B6F52] bg-[#EBF7F2] border border-[#B9E5D4] px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Confirmed by doctor
                        </span>
                      )}
                    </div>

                    {/* Qualitative Review Comment */}
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed pt-1">
                      "{displayedText}"
                    </p>

                    {isLongComment && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(review.id)}
                        className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors focus:outline-none"
                      >
                        {isExpanded ? "Show less" : "Read more"}
                      </button>
                    )}
                  </div>

                  {/* Outcome Tag Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-muted">
                    <span className="truncate">
                      Status: <strong className="text-text-secondary font-medium">{review.confirmedOutcome}</strong>
                    </span>
                    <span className="text-slate-400 font-mono-val">
                      {review.id}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Floating CTA for Mobile/Sticky Experience */}
      <div className="fixed bottom-6 right-6 z-30 lg:hidden">
        <Button
          size="md"
          icon={MessageSquarePlus}
          onClick={() => setIsModalOpen(true)}
          className="shadow-lg"
        >
          Share Review
        </Button>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        predictedSeverityClass={currentPrediction?.predictedClass || 2}
        onAddReview={handleAddReview}
      />
    </div>
  );
};
