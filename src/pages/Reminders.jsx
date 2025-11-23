// src/pages/Reminders.jsx
import React, { useState, useEffect } from "react";
import { useData } from "../context/DataContext";
import { useApp } from "../context/AppContext";
import Modal from "../components/Modal";
import ReminderForm from "./ReminderForm";

export default function Reminders() {
  // Prefer centralized AppContext; fall back to DataContext
  let appCtx = null;
  // eslint-disable-next-line react-hooks/rules-of-hooks, no-unused-vars
  try { appCtx = useApp(); } catch (e) { appCtx = null; }

  let dataCtx = null;
  // eslint-disable-next-line react-hooks/rules-of-hooks, no-unused-vars
  try { dataCtx = useData(); } catch (e) { dataCtx = null; }

  // Actions: prefer appCtx methods, otherwise dataCtx
  const updateReminderFn = appCtx?.updateReminder ?? dataCtx?.updateReminder;
  const deleteReminderFn = appCtx?.deleteReminder ?? dataCtx?.deleteReminder;

  // Source of truth for reminders: appCtx.state.reminders -> dataCtx.state.reminders -> local fallback
  const appReminders = appCtx?.state?.reminders ?? null;
  const dataReminders = dataCtx?.state?.reminders ?? null;

  const appMedicines = appCtx?.state?.medicines ?? null;
  const dataMedicines = dataCtx?.state?.medicines ?? null;
  const medicines = appMedicines ?? dataMedicines ?? [];

  const [reminders, setReminders] = useState(appReminders ?? dataReminders ?? []);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);

  // Keep local reminders in sync whenever context changes
  useEffect(() => {
    setReminders(appReminders ?? dataReminders ?? []);
  }, [appReminders, dataReminders]);

  const onAdd = () => { setEdit(null); setOpen(true); };
  const onEdit = (r) => { setEdit(r); setOpen(true); };

  // Mark as taken
  const markTaken = async (r) => {
    if (!updateReminderFn) {
      console.warn("updateReminder not available in context.");
      return;
    }
    try {
      await updateReminderFn({ ...r, taken: true });
    } catch (err) {
      console.error("Failed to mark reminder taken:", err);
      alert("Could not update reminder. See console for details.");
    }
  };

  const handleDelete = async (id) => {
    if (!deleteReminderFn) {
      console.warn("deleteReminder not available in context.");
      return;
    }
    if (!confirm("Are you sure you want to delete this reminder?")) return;
    try {
      await deleteReminderFn(id);
    } catch (err) {
      console.error("Failed to delete reminder:", err);
      alert("Could not delete reminder. See console for details.");
    }
  };

  // Helper to show medicine name instead of id (if available)
  const getMedicineName = (medicineId) => {
    if (!medicineId) return "";
    const found = medicines.find(m => String(m.id) === String(medicineId));
    return found ? found.name : medicineId;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Reminders</h2>
        <button onClick={onAdd} className="px-3 py-2 bg-blue-600 text-white rounded">Add Reminder</button>
      </div>

      {(!reminders || reminders.length === 0) ? (
        <div className="p-4 bg-white dark:bg-gray-800 rounded">No reminders set.</div>
      ) : (
        <div className="space-y-3">
          {reminders.map(r => (
            <div key={r.id} className="p-3 bg-white dark:bg-gray-800 rounded flex justify-between items-center">
              <div>
                <div className="font-semibold">{r.title}</div>
                <div className="text-sm text-gray-500">
                  {r.medicineId ? `Medicine: ${getMedicineName(r.medicineId)}` : ""}{" "}
                  {r.time ? `• ${new Date(r.time).toLocaleString()}` : ""}
                </div>
              </div>
              <div className="flex gap-2">
                {!r.taken && (
                  <button onClick={() => markTaken(r)} className="px-2 py-1 bg-green-500 text-white rounded">Mark taken</button>
                )}
                <button onClick={() => onEdit(r)} className="px-2 py-1 border rounded">Edit</button>
                <button onClick={() => handleDelete(r.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={open} title={edit ? "Edit reminder" : "Add reminder"} onClose={() => setOpen(false)}>
        <ReminderForm existing={edit} onDone={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
