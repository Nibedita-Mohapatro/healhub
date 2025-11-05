import React from "react";
import { useParams, Link } from "react-router-dom";
import { useData } from "../context/DataContext";

export default function MedicineDetail() {
  const { id } = useParams();
  const { state } = useData();
  const med = (state.medicines || []).find(m => String(m.id) === String(id));

  if (!med) return <div className="p-4 bg-white dark:bg-gray-800 rounded">Medicine not found.</div>;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded">
      <div className="flex gap-4">
        <div className="w-32 h-32 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
          {med.image ? <img src={med.image} alt={med.name} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full">No image</div>}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{med.name}</h2>
          <div className="text-sm text-gray-500">Dosage: {med.dosage}</div>
          <div className="text-sm text-gray-500">Doctor: {med.doctor}</div>
          <div className="mt-2">{med.notes}</div>
          <div className="mt-3 text-xs text-gray-400">Added: {med.createdAt ? new Date(med.createdAt).toLocaleString() : "-"}</div>
          <div className="mt-4">
            <Link to="/medicines" className="text-sm text-blue-600">Back to medicines</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
