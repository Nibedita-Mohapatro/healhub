import React from "react";

/**
 * Simple progress bar
 * Props: value (0..1), label
 */
export default function ProgressBar({ value = 0, label = "" }) {
  const pct = Math.min(Math.max(value, 0), 1) * 100;
  return (
    <div>
      {label && <div className="text-sm font-medium mb-1">{label}</div>}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
        <div style={{ width: `${pct}%` }} className="h-4 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      </div>
      <div className="text-xs text-gray-500 mt-1">{Math.round(pct)}%</div>
    </div>
  );
}
