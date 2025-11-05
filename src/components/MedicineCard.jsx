import React from "react";
import Button from "./Button";

/**
 * MedicineCard - shows medicine details and quick actions
 * Props: med {id, name, dosage, doctor, image, notes}, onEdit, onDelete, onAddReminder
 */
export default function MedicineCard({ med, onEdit = () => {}, onDelete = () => {}, onAddReminder = () => {} }) {
  return (
    <div className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded shadow-sm">
      <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        {med.image ? <img src={med.image} alt={med.name} className="w-full h-full object-cover" /> : <div className="text-xs text-gray-500">No image</div>}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{med.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-300">{med.dosage}</div>
          </div>
          <div className="text-sm text-gray-400">{med.doctor}</div>
        </div>
        {med.notes && <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">{med.notes}</div>}
        <div className="mt-3 flex gap-2">
          <Button className="border" onClick={() => onEdit(med)}>Edit</Button>
          <Button className="bg-blue-600 text-white" onClick={() => onAddReminder(med)}>Remind</Button>
          <Button className="bg-red-500 text-white" onClick={() => onDelete(med.id)}>Delete</Button>
        </div>
      </div>
    </div>
  );
}
