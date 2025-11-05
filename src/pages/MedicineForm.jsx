import React, { useEffect } from "react";
import useForm from "../hooks/useForm";
import ImageUpload from "../components/ImageUpload";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";

export default function MedicineForm({ existing = null, onDone = () => {} }) {
  const { addMedicine, updateMedicine } = useData();
  const { addToast } = useToast();

  const { values, handleChange, handleSubmit, setValues } = useForm({
    initialValues: {
      name: "",
      dosage: "",
      doctor: "",
      notes: "",
      image: null
    },
    validate: (v) => {
      const e = {};
      if (!v.name) e.name = "Name required";
      return e;
    },
    onSubmit: async (vals) => {
      if (existing) {
        await updateMedicine({ ...existing, ...vals });
        addToast({ title: "Medicine updated", type: "success" });
      } else {
        await addMedicine(vals);
        addToast({ title: "Medicine added", type: "success" });
      }
      onDone();
    }
  });

  useEffect(() => {
    if (existing) setValues({ name: existing.name || "", dosage: existing.dosage || "", doctor: existing.doctor || "", notes: existing.notes || "", image: existing.image || null });
  }, [existing, setValues]);

  const onFileSelected = (base64) => {
    handleChange("image", base64);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-sm">Name</label>
        <input name="name" value={values.name || ""} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
      </div>
      <div>
        <label className="text-sm">Dosage</label>
        <input name="dosage" value={values.dosage || ""} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
      </div>
      <div>
        <label className="text-sm">Doctor</label>
        <input name="doctor" value={values.doctor || ""} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
      </div>
      <div>
        <label className="text-sm">Notes</label>
        <textarea name="notes" value={values.notes || ""} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
      </div>

      <div>
        <label className="text-sm block mb-1">Image</label>
        <ImageUpload onFileSelected={(b) => onFileSelected(b)} previewUrl={values.image} />
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="px-3 py-2 border rounded">Cancel</button>
        <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Save</button>
      </div>
    </form>
  );
}
