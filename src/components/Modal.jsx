import React from "react";

/**
 * Generic modal (portal not used for simplicity)
 * Props: isOpen, title, children, onClose, footer
 */
export default function Modal({ isOpen, title, children, onClose, footer }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow max-w-2xl w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-sm px-2 py-1">✕</button>
        </div>
        <div className="p-4">
          {children}
        </div>
        {footer && <div className="p-4 border-t dark:border-gray-700">{footer}</div>}
      </div>
    </div>
  );
}
