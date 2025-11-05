import React from "react";
import { useData } from "../context/DataContext";
import BarChartComponent from "../components/charts/BarChartComponent";
import PieChartComponent from "../components/charts/PieChartComponent";
import { exportToCSV } from "../utils/exportUtils";

export default function Reports() {
  const { state } = useData();
  const { medicines = [], trackers = [] } = state;

  const medStats = [
    { name: "Taken", value: medicines.filter(m => m.taken).length },
    { name: "Not taken", value: medicines.filter(m => !m.taken).length }
  ];

  const waterPerDay = trackers.filter(t => t.type === "water")
    .reduce((map, t) => {
      const d = new Date(t.date).toLocaleDateString();
      map[d] = (map[d] || 0) + Number(t.value || 0);
      return map;
    }, {});

  const barData = Object.entries(waterPerDay).map(([date, value]) => ({ date, value }));

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
          {barData.length ? <BarChartComponent data={barData} dataKey="value" xKey="date" /> : <div>No water data</div>}
        </div>
      </div>

      <div className="mt-4">
        <button className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={() => exportToCSV(trackers, "trackers.csv")}>Export trackers (CSV)</button>
      </div>
    </div>
  );
}
