// src/components/trackers/ExerciseTracker.jsx
import React, { useState, useMemo } from "react";
import { useData } from "../../context/DataContext";
import { useApp } from "../../context/AppContext";
import { v4 as uuidv4 } from "uuid";

export default function ExerciseTracker() {
  // Prefer AppContext; fallback to DataContext
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const appCtx = (() => { try { return useApp(); } catch { return null; } })();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const dataCtx = (() => { try { return useData(); } catch { return null; } })();

  const addTracker = appCtx?.addTracker ?? dataCtx?.addTracker;
  const state = appCtx?.state ?? dataCtx?.state ?? {};

  const [mins, setMins] = useState(20);
  const [type, setType] = useState("Walking");

  // Normalize trackers (works if stored as array or grouped object)
  const trackersArray = useMemo(() => {
    const raw = state.trackers ?? [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "object" && raw !== null) return Object.values(raw).flat();
    return [];
  }, [state.trackers]);

  // Calculate today's total exercise minutes
  const today = new Date().toDateString();
  const todayTotal = trackersArray
    .filter(t => t.type === "exercise" && new Date(t.date).toDateString() === today)
    .reduce((sum, t) => sum + Number(t.value?.duration || t.value || 0), 0);

  const add = async () => {
    if (!addTracker) return alert("Tracker function not available");
    const payload = {
      id: uuidv4(),
      type: "exercise",
      value: { duration: Number(mins), activity: type },
      unit: "minutes",
      date: new Date().toISOString(),
    };
    try {
      await addTracker(payload);
      setMins(20);
      setType("Walking");
    } catch (err) {
      console.error(err);
      alert("Error adding exercise data");
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
      <h3 className="font-medium mb-2">Exercise Tracker</h3>
      <div className="flex gap-2 items-center mb-2 flex-wrap">
        <input
          type="number"
          value={mins}
          min="0"
          onChange={(e) => setMins(e.target.value)}
          className="px-2 py-1 border rounded w-24"
          placeholder="Minutes"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          <option>Walking</option>
          <option>Running</option>
          <option>Yoga</option>
          <option>Gym</option>
          <option>Cycling</option>
        </select>
        <button
          onClick={add}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        Today: {todayTotal} minutes
      </div>
    </div>
  );
}
