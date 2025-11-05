import React, { useState } from "react";
import { useData } from "../../context/DataContext";

export default function MoodTracker() {
  const { addTracker } = useData();
  const [mood, setMood] = useState("neutral");

  const add = async () => {
    await addTracker({ type: "mood", value: mood, date: new Date().toISOString() });
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
      <h3 className="font-medium mb-2">Mood Tracker</h3>
      <div className="flex gap-2 items-center">
        <select value={mood} onChange={(e)=>setMood(e.target.value)} className="px-2 py-1 border rounded">
          <option value="happy">Happy</option>
          <option value="neutral">Neutral</option>
          <option value="sad">Sad</option>
          <option value="anxious">Anxious</option>
        </select>
        <button onClick={add} className="px-3 py-1 bg-blue-600 text-white rounded">Log</button>
      </div>
    </div>
  );
}
