import React, { useState } from "react";
import { useData } from "../../context/DataContext";

export default function ExerciseTracker() {
  const { addTracker } = useData();
  const [mins, setMins] = useState(20);
  const [type, setType] = useState("Walking");

  const add = async () => {
    await addTracker({ type: "exercise", subType: type, value: Number(mins), unit: "minutes", date: new Date().toISOString() });
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
      <h3 className="font-medium mb-2">Exercise Tracker</h3>
      <div className="flex gap-2 items-center mb-2">
        <input type="number" value={mins} onChange={(e)=>setMins(e.target.value)} className="px-2 py-1 border rounded w-24" />
        <select value={type} onChange={(e)=>setType(e.target.value)} className="px-2 py-1 border rounded">
          <option>Walking</option>
          <option>Running</option>
          <option>Yoga</option>
          <option>Gym</option>
        </select>
        <button onClick={add} className="px-3 py-1 bg-blue-600 text-white rounded">Add</button>
      </div>
    </div>
  );
}
