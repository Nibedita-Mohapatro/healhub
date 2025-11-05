import React from "react";

/**
 * Simple Card wrapper
 * Props: children, className
 */
export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
