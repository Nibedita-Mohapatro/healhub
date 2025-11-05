import React from "react";
import Button from "./Button";

/**
 * ConfirmDialog
 * Props: open, title, message, onConfirm, onCancel
 */
export default function ConfirmDialog({ open, title = "Confirm", message = "", onConfirm = () => {}, onCancel = () => {} }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow max-w-sm w-full p-4">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button className="border" onClick={onCancel}>Cancel</Button>
          <Button className="bg-red-500 text-white" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </div>
  );
}
