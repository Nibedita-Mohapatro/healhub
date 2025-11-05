import React, { useState } from "react";
import { useData } from "../context/DataContext";
import Modal from "../components/Modal";
import ReminderForm from "./ReminderForm";

export default function Reminders() {
  const { state, updateReminder, deleteReminder } = useData();
  const reminders = state.reminders || [];
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);

  const onAdd = () => { setEdit(null); setOpen(true); };
  const onEdit = (r) => { setEdit(r); setOpen(true); };

  const markTaken = async (r) => updateReminder({ ...r, taken: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Reminders</h2>
        <button onClick={onAdd} className="px-3 py-2 bg-blue-600 text-white rounded">Add Reminder</button>
      </div>

      {reminders.length === 0 ? <div className="p-4 bg-white dark:bg-gray-800 rounded">No reminders set.</div> : (
        <div className="space-y-3">
          {reminders.map(r => (
            <div key={r.id} className="p-3 bg-white dark:bg-gray-800 rounded flex justify-between items-center">
              <div>
                <div className="font-semibold">{r.title}</div>
                <div className="text-sm text-gray-500">{r.medicineId ? `Medicine: ${r.medicineId}` : ""} • {r.time ? new Date(r.time).toLocaleString() : ""}</div>
              </div>
              <div className="flex gap-2">
                {!r.taken && <button onClick={() => markTaken(r)} className="px-2 py-1 bg-green-500 text-white rounded">Mark taken</button>}
                <button onClick={() => onEdit(r)} className="px-2 py-1 border rounded">Edit</button>
                <button onClick={() => deleteReminder(r.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
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
