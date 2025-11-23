// src/pages/BMI.jsx
import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";

/**
 * BMI page (plain JSX)
 *
 * - Accepts weight & height in metric (kg, cm) or imperial (lb, in).
 * - Calculates BMI, saves a tracker entry via AppContext.addTracker().
 * - Shows recent BMI entries from centralized trackers (type: 'bmi' or 'vitals.bmi').
 */

export default function BMI() {
  const {
    state = {},
    addTracker = () => {},
  } = useApp();

  // form state
  const [units, setUnits] = useState("metric"); // "metric" or "imperial"
  const [weight, setWeight] = useState(""); // kg or lb
  const [height, setHeight] = useState(""); // cm or in
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  // pull recent BMI entries from trackers
  const recentBMIs = useMemo(() => {
    const trackers = Array.isArray(state.trackers) ? state.trackers : state.trackers && typeof state.trackers === "object"
      ? Object.values(state.trackers).flat() : [];

    // Accept entries saved with type 'bmi' or vitals entries containing value.bmi
    return (trackers || [])
      .filter(t => t && (String(t.type).toLowerCase() === "bmi" || (t.type === "vitals" && t.value && t.value.bmi)))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
  }, [state.trackers]);

  // utils
  const toNumber = (v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(String(v).trim());
    return Number.isFinite(n) ? n : null;
  };

  const computeBMI_metric = (kg, cm) => {
    if (!kg || !cm) return null;
    const m = Number(cm) / 100;
    if (m <= 0) return null;
    const bmi = Number(kg) / (m * m);
    return Number(bmi.toFixed(1));
  };

  const computeBMI_imperial = (lb, inch) => {
    if (!lb || !inch) return null;
    // BMI = 703 * lb / (in^2)
    const bmi = 703 * Number(lb) / (Number(inch) * Number(inch));
    return Number(bmi.toFixed(1));
  };

  const bmiCategory = (bmi) => {
    if (!bmi && bmi !== 0) return "N/A";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const handleCalculate = (e) => {
    e && e.preventDefault();
    setError(null);
    setResult(null);
    const w = toNumber(weight);
    const h = toNumber(height);

    if (units === "metric") {
      if (!w || !h) {
        setError("Please provide valid weight (kg) and height (cm).");
        return;
      }
      const bmi = computeBMI_metric(w, h);
      if (bmi == null || Number.isNaN(bmi)) {
        setError("Calculation failed — check values.");
        return;
      }
      setResult({ bmi, weight: w, height: h, units: "metric", category: bmiCategory(bmi) });
      return;
    }

    // imperial
    if (!w || !h) {
      setError("Please provide valid weight (lb) and height (in).");
      return;
    }
    const bmi = computeBMI_imperial(w, h);
    if (bmi == null || Number.isNaN(bmi)) {
      setError("Calculation failed — check values.");
      return;
    }
    setResult({ bmi, weight: w, height: h, units: "imperial", category: bmiCategory(bmi) });
  };

  const handleSave = async () => {
    if (!result) {
      setError("Nothing to save — calculate BMI first.");
      return;
    }
    setSaving(true);
    try {
      // Save as a tracker entry. Use type "bmi" for clarity.
      const payload = {
        id: Date.now().toString(),
        type: "bmi",
        date: new Date().toISOString(),
        value: {
          bmi: result.bmi,
          weight: result.weight,
          height: result.height,
          units: result.units,
          category: result.category,
        },
      };
      await addTracker(payload);
    } catch (e) {
      console.warn("Failed to save BMI tracker", e);
      setError("Save failed. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setWeight("");
    setHeight("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">BMI Calculator</h2>

      <form onSubmit={handleCalculate} className="space-y-4 bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Units</label>
          <select value={units} onChange={(e) => setUnits(e.target.value)} className="p-2 border rounded">
            <option value="metric">Metric (kg, cm)</option>
            <option value="imperial">Imperial (lb, in)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">{units === "metric" ? "Weight (kg)" : "Weight (lb)"}</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={units === "metric" ? "e.g. 70" : "e.g. 154"}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{units === "metric" ? "Height (cm)" : "Height (in)"}</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder={units === "metric" ? "e.g. 170" : "e.g. 67"}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Calculate</button>
          <button type="button" onClick={handleReset} className="px-4 py-2 bg-gray-200 rounded">Reset</button>
          {result && (
            <button type="button" onClick={handleSave} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded">
              {saving ? "Saving..." : "Save"}
            </button>
          )}
        </div>

        {result && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-xl font-bold">{result.bmi} BMI</div>
            <div className="text-sm text-gray-600">Category: <span className="font-medium">{result.category}</span></div>
            <div className="text-xs text-gray-500 mt-2">Saved to trackers when you click Save</div>
          </div>
        )}
      </form>

      {/* Recent BMI history */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">Recent BMI entries</h3>
        <div className="space-y-3">
          {recentBMIs.length === 0 && <div className="text-sm text-gray-500">No BMI entries yet.</div>}
          {recentBMIs.map((t) => {
            const dt = new Date(t.date);
            const label = dt.toLocaleString();
            const val = t.type === "bmi" ? t.value : (t.value && t.value.bmi);
            return (
              <div key={t.id || `${t.type}_${t.date}`} className="p-3 bg-white dark:bg-gray-800 rounded shadow-sm flex justify-between items-center">
                <div>
                  <div className="font-medium">{val?.bmi ?? val}</div>
                  <div className="text-xs text-gray-500">{val?.units ? `${val.units} • ${val.weight}${val.units === "metric" ? "kg" : "lb"} • ${val.height}${val.units === "metric" ? "cm" : "in"}` : null}</div>
                  <div className="text-xs text-gray-400 mt-1">{label}</div>
                </div>
                <div className="text-sm text-gray-600">{val?.category ?? (t.value && t.value.category)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
