import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { LoginPage } from "./pages/LoginPage";
import { AboutPage } from "./pages/AboutPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ResultsPage } from "./pages/ResultsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Index redirects to About tab first */}
        <Route index element={<Navigate to="/about" replace />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="results/:id" element={<ResultsPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="login" element={<LoginPage />} />
        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/about" replace />} />
      </Route>
    </Routes>
  );
}
