// src/components/trackers/WaterTracker.jsx
import React, { useState, useMemo } from "react";
import { useData } from "../../context/DataContext";
import { useApp } from "../../context/AppContext";
import { v4 as uuidv4 } from "uuid";

export default function WaterTracker() {
  // Prefer AppContext (centralized); fall back to DataContext if AppContext not present
  const appCtx = (() => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useApp();
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      return null;
    }
  })();
  const dataCtx = (() => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useData();
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      return null;
    }
  })();

  // choose addTracker and state from whichever context is available
  const addTracker = appCtx?.addTracker ?? dataCtx?.addTracker;
  const state = appCtx?.state ?? dataCtx?.state ?? {};

  const [ml, setMl] = useState(250);
  const [saving, setSaving] = useState(false);

  // Normalize trackers into a flat array regardless of storage shape
  const trackersArray = useMemo(() => {
    const raw = state.trackers ?? [];
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object") {
      // raw could be { water: [], sleep: [], ... }
      return Object.values(raw).flat();
    }
    return [];
  }, [state.trackers]);

  // compute today's total water (in ml)
  const todayTotal = useMemo(() => {
    const todayStr = new Date().toDateString();
    return trackersArray
      .filter(t => t && t.type === "water" && new Date(t.date).toDateString() === todayStr)
      .reduce((s, t) => s + (Number(t.value) || 0), 0);
  }, [trackersArray]);

  const handleAdd = async () => {
    if (!addTracker) {
      alert("Tracker function not available. Make sure AppContext or DataContext provides addTracker.");
      return;
    }
    const value = Number(ml);
    if (!value || value <= 0) {
      return alert("Please enter a valid amount in ml");
    }

    const payload = {
      id: uuidv4(),
      type: "water",
      value,
      unit: "ml",
      date: new Date().toISOString()
    };

    try {
      setSaving(true);
      // addTracker might be async (DataContext might persist to localforage)
      await addTracker(payload);
    } catch (err) {
      console.error("Error adding water tracker:", err);
      alert("Could not add water entry. See console for details.");
    } finally {
      setSaving(false);
      setMl(250);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
      <h3 className="font-medium mb-2">Water Tracker</h3>
      <div className="flex gap-2 items-center">
        <input
          type="number"
          value={ml}
          onChange={(e) => setMl(e.target.value)}
          className="px-2 py-1 border rounded w-28"
          min="1"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={saving}
        >
          {saving ? "Adding..." : "Add (ml)"}
        </button>
      </div>
      <div className="mt-3 text-sm text-gray-500">Today: {todayTotal} ml</div>
    </div>
  );
}
