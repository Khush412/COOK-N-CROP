import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CropCorner from "./pages/CropCorner";
import Login from "./pages/AuthPage";
import AuthCallback from "./pages/AuthCallback";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import Subscription from "./pages/Subscription";
import Dashboard from "./pages/Control_panel";
import Recipes from "./pages/Recipes";
import CartPage from "./pages/CartPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/community" element={<Community />} />
      <Route path="/CropCorner" element={<CropCorner />} />
      <Route path="/recipes" element={<Recipes />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/subscription" element={<Subscription />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/cart" element={<CartPage />} />
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}