// src/pages/ReminderForm.jsx
import React, { useEffect } from "react";
import useForm from "../hooks/useForm";
import { useData } from "../context/DataContext";

export default function ReminderForm({ existing = null, onDone = () => {} }) {
  const { addReminder, updateReminder } = useData();

  const { values, handleChange, handleSubmit, setValues } = useForm({
    initialValues: { title: "", medicineId: "", time: "", repeat: "once", notes: "" },
    validate: (v) => {
      const e = {};
      if (!v.title) e.title = "Title required";
      if (!v.time) e.time = "Time required";
      return e;
    },
    onSubmit: async (vals) => {
      const payload = {
        ...vals,
        time: vals.time ? new Date(vals.time).toISOString() : null,
        // ensure tracking flags exist
        taken: existing ? existing.taken ?? false : false,
        skipped: existing ? existing.skipped ?? false : false,
      };

      if (existing) {
        await updateReminder({ ...existing, ...payload });
      } else {
        await addReminder(payload);
      }
      onDone();
    }
  });

  useEffect(() => {
    if (existing) {
      setValues({
        title: existing.title || "",
        medicineId: existing.medicineId || "",
        time: existing.time ? new Date(existing.time).toISOString().slice(0,16) : "",
        repeat: existing.repeat || "once",
        notes: existing.notes || ""
      });
    }
  }, [existing, setValues]);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-sm">Title</label>
        <input name="title" value={values.title || ""} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
      </div>
      <div>
        <label className="text-sm">Medicine ID (optional)</label>
        <input name="medicineId" value={values.medicineId || ""} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
      </div>
      <div>
        <label className="text-sm">Date & Time</label>
        <input name="time" type="datetime-local" value={values.time || ""} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
      </div>

      <div>
        <label className="text-sm">Repeat</label>
        <select name="repeat" value={values.repeat || "once"} onChange={handleChange} className="w-full px-3 py-2 border rounded">
          <option value="once">Once</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      <div>
        <label className="text-sm">Notes (optional)</label>
        <textarea name="notes" value={values.notes || ""} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="px-3 py-2 border rounded">Cancel</button>
        <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Save Reminder</button>
      </div>
    </form>
  );
}
