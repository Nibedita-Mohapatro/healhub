// src/components/trackers/MealTracker.jsx
import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { useApp } from "../../context/AppContext";
import { v4 as uuidv4 } from "uuid";

export default function MealTracker() {
  // Prefer AppContext; fallback to DataContext
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const appCtx = (() => { try { return useApp(); } catch { return null; } })();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const dataCtx = (() => { try { return useData(); } catch { return null; } })();

  const addTracker = appCtx?.addTracker ?? dataCtx?.addTracker;

  const [meals, setMeals] = useState([
    { type: "Breakfast", taken: false, time: "08:00" },
    { type: "Lunch", taken: false, time: "13:00" },
    { type: "Dinner", taken: false, time: "20:00" }
  ]);

  const handleMealToggle = async (index) => {
    const newMeals = [...meals];
    newMeals[index].taken = !newMeals[index].taken;
    setMeals(newMeals);

    if (!addTracker) {
      console.warn("Tracker function unavailable");
      return;
    }

    try {
      const payload = {
        id: uuidv4(),
        type: "meals",
        date: new Date().toISOString(),
        value: newMeals
      };
      await addTracker(payload);
    } catch (err) {
      console.error("Error saving meal tracker:", err);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-6">Meal Tracker</h2>
      <div className="space-y-4">
        {meals.map((meal, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition"
          >
            <div>
              <h3 className="font-medium">{meal.type}</h3>
              <p className="text-sm text-gray-500">{meal.time}</p>
            </div>
            <button
              onClick={() => handleMealToggle(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                meal.taken
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {meal.taken ? "Logged" : "Not Logged"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
