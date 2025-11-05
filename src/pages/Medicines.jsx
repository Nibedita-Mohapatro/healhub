import React, { useState } from "react";
import { Link } from "react-router-dom";
import MedicineCard from "../components/MedicineCard";
import Modal from "../components/Modal";
import MedicineForm from "./MedicineForm";
import { useData } from "../context/DataContext";
import { ROUTES } from "../constants/routes";

export default function Medicines() {
  const { state, deleteMedicine } = useData();
  const meds = state.medicines || [];
  const [openForm, setOpenForm] = useState(false);
  const [editMed, setEditMed] = useState(null);

  const onEdit = (m) => { setEditMed(m); setOpenForm(true); };
  const onAdd = () => { setEditMed(null); setOpenForm(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Medicines</h2>
        <div>
          <button onClick={onAdd} className="px-3 py-2 bg-blue-600 text-white rounded">Add Medicine</button>
        </div>
      </div>

      <div className="space-y-3">
        {meds.length === 0 && <div className="p-4 bg-white dark:bg-gray-800 rounded">No medicines yet. Add one.</div>}
        {meds.map(m => (
          <MedicineCard key={m.id} med={m} onEdit={onEdit} onDelete={deleteMedicine} onAddReminder={() => {}} />
        ))}
      </div>

      <Modal isOpen={openForm} title={editMed ? "Edit medicine" : "Add medicine"} onClose={() => setOpenForm(false)}>
        <MedicineForm existing={editMed} onDone={() => setOpenForm(false)} />
      </Modal>
    </div>
  );
}
