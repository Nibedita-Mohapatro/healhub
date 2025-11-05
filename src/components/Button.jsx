import React from "react";

/**
 * Reusable Button
 * Props: children, onClick, className, type, disabled
 */
export default function Button({ children, onClick, className = "", type = "button", disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 rounded-md shadow-sm inline-flex items-center gap-2 text-sm border focus:outline-none disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}
