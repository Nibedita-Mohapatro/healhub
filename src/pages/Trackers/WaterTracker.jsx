import React, { useState } from "react";
import { useData } from "../../context/DataContext";

export default function WaterTracker() {
  const { addTracker, state } = useData();
  const [ml, setMl] = useState(250);

  const add = async () => {
    await addTracker({ type: "water", value: Number(ml), unit: "ml", date: new Date().toISOString() });
  };

  const todayTotal = (state.trackers || []).filter(t => t.type === "water" && new Date(t.date).toDateString() === new Date().toDateString())
    .reduce((s, t) => s + Number(t.value || 0), 0);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
      <h3 className="font-medium mb-2">Water Tracker</h3>
      <div className="flex gap-2 items-center">
        <input type="number" value={ml} onChange={(e)=>setMl(e.target.value)} className="px-2 py-1 border rounded w-28" />
        <button onClick={add} className="px-3 py-1 bg-blue-600 text-white rounded">Add (ml)</button>
      </div>
      <div className="mt-3 text-sm text-gray-500">Today: {todayTotal} ml</div>
    </div>
  );
}
