import React, { useState } from "react";
import { useData } from "../../context/DataContext";

export default function SleepTracker() {
  const { addTracker } = useData();
  const [hours, setHours] = useState(7);

  const add = async () => {
    await addTracker({ type: "sleep", value: Number(hours), unit: "hours", date: new Date().toISOString() });
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
      <h3 className="font-medium mb-2">Sleep Tracker</h3>
      <div className="flex gap-2 items-center">
        <input type="number" value={hours} onChange={(e)=>setHours(e.target.value)} className="px-2 py-1 border rounded w-24" />
        <button onClick={add} className="px-3 py-1 bg-blue-600 text-white rounded">Add</button>
      </div>
    </div>
  );
}
