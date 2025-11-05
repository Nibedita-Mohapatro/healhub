import React from "react";

const TYPE_STYLES = {
  info: "bg-white text-gray-900 border",
  success: "bg-green-50 text-green-900 border-green-200",
  error: "bg-red-50 text-red-900 border-red-200",
  warn: "bg-yellow-50 text-yellow-900 border-yellow-200"
};

export default function ToastContainer({ toasts = [], onRemove = () => {} }) {
  return (
    <div aria-live="polite" className="fixed right-4 bottom-4 z-50 flex flex-col gap-2 items-end">
      {toasts.map(t => (
        <div
          key={t.id}
          role="status"
          onClick={() => onRemove(t.id)}
          className={`max-w-sm w-full shadow-lg rounded p-3 border ${TYPE_STYLES[t.type] || TYPE_STYLES.info} cursor-pointer`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="font-semibold text-sm">{t.title}</div>
              {t.description && <div className="text-xs mt-1 opacity-90">{t.description}</div>}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(t.id); }}
              aria-label="Close toast"
              className="text-sm text-gray-600 hover:text-gray-900 ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
