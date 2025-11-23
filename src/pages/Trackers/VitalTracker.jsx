// src/components/trackers/VitalsTracker.jsx
import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { useApp } from "../../context/AppContext";
import { v4 as uuidv4 } from "uuid";

export default function VitalsTracker() {
  // Prefer AppContext; fallback to DataContext
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const appCtx = (() => { try { return useApp(); } catch { return null; } })();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const dataCtx = (() => { try { return useData(); } catch { return null; } })();

  const addTracker = appCtx?.addTracker ?? dataCtx?.addTracker;

  const [vitals, setVitals] = useState({
    bp: "",
    hr: "",
    temp: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!addTracker) return alert("Tracker function not available");

    try {
      const payload = {
        id: uuidv4(),
        type: "vitals",
        date: new Date().toISOString(),
        value: {
          bp: vitals.bp.trim(),
          hr: Number(vitals.hr),
          temp: Number(vitals.temp)
        }
      };
      await addTracker(payload);
      setVitals({ bp: "", hr: "", temp: "" });
    } catch (err) {
      console.error("Error saving vitals:", err);
      alert("Failed to save vitals data");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-6">Vitals Tracker</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Blood Pressure</label>
          <input
            type="text"
            value={vitals.bp}
            onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
            placeholder="120/80"
            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Heart Rate (bpm)</label>
          <input
            type="number"
            value={vitals.hr}
            onChange={(e) => setVitals({ ...vitals, hr: e.target.value })}
            placeholder="72"
            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Temperature (°C)</label>
          <input
            type="number"
            step="0.1"
            value={vitals.temp}
            onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
            placeholder="36.6"
            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Vitals
        </button>
      </form>
    </div>
  );
}
