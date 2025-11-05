import React from "react";

export default function Loader({ size = 6, className = "" }) {
  const s = `${size}rem`;
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        style={{ width: s, height: s }}
        className="animate-spin text-blue-600"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" fill="none" />
        <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </div>
  );
}
