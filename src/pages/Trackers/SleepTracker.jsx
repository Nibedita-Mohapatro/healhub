// src/components/trackers/SleepTracker.jsx
import React, { useState, useMemo } from "react";
import { useData } from "../../context/DataContext";
import { useApp } from "../../context/AppContext";
import { v4 as uuidv4 } from "uuid";

export default function SleepTracker() {
  // Prefer AppContext; fallback to DataContext
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const appCtx = (() => { try { return useApp(); } catch { return null; } })();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const dataCtx = (() => { try { return useData(); } catch { return null; } })();

  const addTracker = appCtx?.addTracker ?? dataCtx?.addTracker;
  const state = appCtx?.state ?? dataCtx?.state ?? {};

  const [hours, setHours] = useState(7);
  const [quality, setQuality] = useState(3); // 1–5 rating

  // Normalize tracker data (array or grouped)
  const trackersArray = useMemo(() => {
    const raw = state.trackers ?? [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "object" && raw !== null) return Object.values(raw).flat();
    return [];
  }, [state.trackers]);

  // Calculate today's total sleep
  const today = new Date().toDateString();
  const todayTotal = trackersArray
    .filter(t => t.type === "sleep" && new Date(t.date).toDateString() === today)
    .reduce((sum, t) => sum + Number(t.value?.hours || t.value || 0), 0);

  const add = async () => {
    if (!addTracker) return alert("Tracker function not available");
    const payload = {
      id: uuidv4(),
      type: "sleep",
      value: { hours: Number(hours), quality: Number(quality) },
      unit: "hours",
      date: new Date().toISOString(),
    };
    try {
      await addTracker(payload);
      setHours(7);
      setQuality(3);
    } catch (err) {
      console.error(err);
      alert("Error adding sleep data");
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
      <h3 className="font-medium mb-2">Sleep Tracker</h3>
      <div className="flex gap-2 items-center flex-wrap">
        <input
          type="number"
          value={hours}
          min="0"
          step="0.1"
          onChange={(e) => setHours(e.target.value)}
          className="px-2 py-1 border rounded w-24"
          placeholder="Hours slept"
        />
        <select
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          <option value={1}>1 - Poor</option>
          <option value={2}>2 - Fair</option>
          <option value={3}>3 - Good</option>
          <option value={4}>4 - Very Good</option>
          <option value={5}>5 - Excellent</option>
        </select>
        <button
          onClick={add}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>
      <div className="mt-3 text-sm text-gray-500">
        Today: {todayTotal} hours
      </div>
    </div>
  );
}
