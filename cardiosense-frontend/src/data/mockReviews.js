/**
 * Initial dataset of anonymized, privacy-safe community reviews.
 * Adheres strictly to:
 * - Anonymous labels (Patient A, Patient B)
 * - Age range ONLY (no exact ages)
 * - Severity class + rating + qualitative feedback
 * - No exact clinical numbers
 */

export const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    authorLabel: "Patient A",
    ageRange: "50–60",
    predictedClass: 2,
    rating: 5,
    confirmedOutcome: "Confirmed similar",
    confirmedByDoctor: true,
    timestamp: "3 days ago",
    comment: "The model predicted Moderate severity due to blood pressure trends and age. Brought the printout to my regular GP checkup, and my doctor confirmed mild-to-moderate hypertension and recommended a low-sodium diet and 30-minute daily walks.",
  },
  {
    id: "rev-2",
    authorLabel: "Patient M",
    ageRange: "40–50",
    predictedClass: 0,
    rating: 5,
    confirmedOutcome: "Confirmed similar",
    confirmedByDoctor: true,
    timestamp: "1 week ago",
    comment: "Predicted No Disease. I had routine preventive blood work done the following week and my cholesterol and resting vitals were completely in the clear. App was reassuring and easy to navigate.",
  },
  {
    id: "rev-3",
    authorLabel: "Patient R",
    ageRange: "60–70",
    predictedClass: 3,
    rating: 4,
    confirmedOutcome: "Confirmed similar",
    confirmedByDoctor: true,
    timestamp: "2 weeks ago",
    comment: "Showed Severe severity mainly driven by exercise chest tightness and elevated blood pressure. Visited my cardiologist for a stress echocardiogram, which revealed moderate arterial narrowing. Very glad this demo prompted me to book an appointment.",
  },
  {
    id: "rev-4",
    authorLabel: "Patient T",
    ageRange: "30–40",
    predictedClass: 1,
    rating: 4,
    confirmedOutcome: "Not yet diagnosed",
    confirmedByDoctor: false,
    timestamp: "2 weeks ago",
    comment: "Showed Mild severity due to borderline cholesterol levels. It was helpful to see which specific habits were influencing the score through the SHAP chart. Planning to recheck next month.",
  },
  {
    id: "rev-5",
    authorLabel: "Patient K",
    ageRange: "50–60",
    predictedClass: 2,
    rating: 5,
    confirmedOutcome: "Confirmed similar",
    confirmedByDoctor: true,
    timestamp: "3 weeks ago",
    comment: "The SHAP breakdown clearly explained how my peak heart rate and resting BP factored into the result. My doctor appreciated having my recent self-logged vitals organized so cleanly.",
  },
  {
    id: "rev-6",
    authorLabel: "Patient E",
    ageRange: "40–50",
    predictedClass: 0,
    rating: 4,
    confirmedOutcome: "Not yet diagnosed",
    confirmedByDoctor: false,
    timestamp: "1 month ago",
    comment: "Clean and calm interface with no alarmist language. Found the range gauges comparing my resting stats against typical populations very informative.",
  },
  {
    id: "rev-7",
    authorLabel: "Patient L",
    ageRange: "60–70",
    predictedClass: 4,
    rating: 5,
    confirmedOutcome: "Confirmed similar",
    confirmedByDoctor: true,
    timestamp: "1 month ago",
    comment: "Inputs highlighted multiple elevated risk areas (Class 4). I followed up with my clinic promptly and underwent a full cardiovascular assessment. The calm tone helped me take action without panic.",
  },
  {
    id: "rev-8",
    authorLabel: "Patient G",
    ageRange: "50–60",
    predictedClass: 1,
    rating: 4,
    confirmedOutcome: "Confirmed different",
    confirmedByDoctor: true,
    timestamp: "1 month ago",
    comment: "Predicted Mild, but further clinical tests showed my heart vessels are completely healthy. It was a good reminder that this is an educational tool and clinical diagnosis is always required.",
  },
];
