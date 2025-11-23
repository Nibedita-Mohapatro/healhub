// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Medicines from "./pages/Medicines";
import MedicineDetail from "./pages/MedicineDetail";
import Reminders from "./pages/Reminders";
import Trackers from "./pages/Trackers";
import Reports from "./pages/Reports";
import Badges from "./pages/Badges";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BMI from "./pages/BMI";
import Appointments from "./pages/Appointments";
import NotFound from "./pages/NotFound";
import { ROUTES } from "./constants/routes";

import { useApp } from "./context/AppContext"; // central AppContext (theme + data)
import { useReminders } from "./hooks/useReminders"; // <-- named import (correct)

export default function App() {
  // read theme from centralized AppContext (keeps UI consistent)
  const { state } = useApp(); // AppProvider must wrap <App /> in main.jsx

  // mount reminders watcher once (hook is called inside component body)
  useReminders();

  useEffect(() => {
    const theme = state?.theme || "light";

    // set data-theme attribute (for your CSS variables)
    try {
      document.documentElement.setAttribute("data-theme", theme);
      // eslint-disable-next-line no-empty, no-unused-vars
    } catch (e) {}

    // also toggle Tailwind 'dark' class so dark: utilities work
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state?.theme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />

      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.MEDICINES} element={<Medicines />} />
          <Route path={ROUTES.MEDICINE_DETAIL} element={<MedicineDetail />} />
          <Route path={ROUTES.REMINDERS} element={<Reminders />} />
          <Route path={ROUTES.TRACKERS} element={<Trackers />} />
          <Route path={ROUTES.REPORTS} element={<Reports />} />
          <Route path={ROUTES.BMI} element={<BMI />} />
          <Route path={ROUTES.APPOINTMENTS} element={<Appointments />} />
          <Route path={ROUTES.BADGES} element={<Badges />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={ROUTES.SETTINGS} element={<Settings />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
