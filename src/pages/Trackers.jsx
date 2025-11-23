// src/pages/Trackers.jsx
import React from "react";

// ✅ Correct import paths (no extra nested folder confusion)
import WaterTracker from "./Trackers/WaterTracker";
import SleepTracker from "./Trackers/SleepTracker";
import ExerciseTracker from "./Trackers/ExerciseTracker";
import MoodTracker from "./Trackers/MoodTracker";
import VitalTracker from "./Trackers/VitalTracker";
import MealTracker from "./Trackers/MealTracker";

/**
 * Main Trackers page that displays all health tracker widgets.
 * Each tracker manages its own local state & syncs to AppContext/DataContext.
 */
export default function Trackers() {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-semibold mb-6 text-center">Health Trackers</h2>

      {/* Responsive grid with flexible wrapping */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <WaterTracker />
        <SleepTracker />
        <ExerciseTracker />
        <MoodTracker />
        <MealTracker />
        <VitalTracker />
      </div>
    </div>
  );
}
