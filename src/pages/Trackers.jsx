// src/pages/Trackers.jsx
import React from "react";
import WaterTracker from "./Trackers/WaterTracker";
import SleepTracker from "./Trackers/SleepTracker";
import ExerciseTracker from "./Trackers/ExerciseTracker";
import MoodTracker from "./Trackers/MoodTracker";
import VitalTracker from "./Trackers/VitalTracker";
import MealTracker from "./Trackers/MealTracker";
/**
 * Main Trackers page that displays all trackers.
 */
export default function Trackers() {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-semibold mb-6 text-center">Health Trackers</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
