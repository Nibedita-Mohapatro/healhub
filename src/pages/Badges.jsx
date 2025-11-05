import React from "react";
import { useData } from "../context/DataContext";

export default function Badges() {
  const { state } = useData();
  const { badges = [] } = state;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Badges & Achievements</h2>
      {badges.length === 0 ? (
        <div className="p-4 bg-white dark:bg-gray-800 rounded">No badges yet — complete trackers and streaks to unlock badges.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {badges.map(b => (
            <div key={b.id} className="p-4 bg-white dark:bg-gray-800 rounded shadow text-center">
              <div className="text-xl font-bold">{b.name}</div>
              <div className="text-sm text-gray-500 mt-2">{b.description || "Achievement unlocked"}</div>
              <div className="mt-3 text-xs text-gray-400">Achieved: {new Date(b.date).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
