// src/pages/Reports.jsx
import React from "react";
import { useData } from "../context/DataContext";
import BarChartComponent from "../components/charts/BarChartComponent";
import PieChartComponent from "../components/charts/PieChartComponent";
import { exportToCSV, exportToJSON } from "../utils/exportUtils";

export default function Reports() {
  const { state } = useData();
  // normalize medicines & trackers (defensive)
  const medicines = Array.isArray(state?.medicines) ? state.medicines : [];
  const rawTrackers = state?.trackers ?? [];

  // trackers may be stored as an array OR as an object grouped by type
  const trackers = Array.isArray(rawTrackers)
    ? rawTrackers
    : (typeof rawTrackers === "object" && rawTrackers !== null)
    ? Object.values(rawTrackers).flat()
    : [];

  // Medicine stats (ensure boolean check)
  const medStats = [
    { name: "Taken", value: medicines.filter(m => !!m.taken).length },
    { name: "Not taken", value: medicines.filter(m => !m.taken).length }
  ];

  // Water per day aggregation
  const waterPerDay = trackers
    .filter(t => t.type === "water")
    .reduce((map, t) => {
      const d = t.date ? new Date(t.date).toLocaleDateString() : "Unknown";
      map[d] = (map[d] || 0) + Number(t.value || 0);
      return map;
    }, {});

  const barData = Object.entries(waterPerDay).map(([date, value]) => ({ date, value }));

  // Export helpers
  const handleExportTrackers = () => {
    // If trackers is empty or not an array of plain objects, fallback to JSON
    if (!trackers.length) {
      // download an empty JSON/placeholder
      return exportToJSON({ trackers: [] }, "trackers.json");
    }
    // If trackers is an array of plain objects, use CSV
    return exportToCSV(trackers, "trackers.csv");
  };

  const handleExportMedicines = () => {
    if (!medicines.length) {
      return exportToJSON({ medicines: [] }, "medicines.json");
    }
    return exportToCSV(medicines, "medicines.csv");
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Reports</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="font-medium mb-2">Medicine status</h3>
          <PieChartComponent data={medStats} dataKey="value" nameKey="name" />
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="font-medium mb-2">Water intake (per day)</h3>
          {barData.length ? (
            <BarChartComponent data={barData} dataKey="value" xKey="date" />
          ) : (
            <div className="text-sm text-gray-500">No water data</div>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          className="px-3 py-2 bg-indigo-600 text-white rounded"
          onClick={handleExportTrackers}
        >
          Export trackers (CSV / JSON fallback)
        </button>

        <button
          className="px-3 py-2 bg-gray-600 text-white rounded"
          onClick={handleExportMedicines}
        >
          Export medicines (CSV / JSON fallback)
        </button>
      </div>
    </div>
  );
}
