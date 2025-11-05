import React from "react";

/**
 * Input wrapper
 * Props: label, name, value, onChange, type, placeholder, error
 */
export default function Input({ label, name, value, onChange, type = "text", placeholder = "", error = "" , ...rest}) {
  return (
    <div className="flex flex-col">
      {label && <label className="mb-1 text-sm font-medium">{label}</label>}
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 bg-white dark:bg-gray-700 dark:text-gray-100"
        {...rest}
      />
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  );
}
