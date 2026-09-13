// src/components/AddTaskModal.jsx
import React, { useState } from "react";

export default function AddTaskModal({ date, onClose, onSave }) {
  const [form, setForm] = useState({ title: "", description: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const save = () => {
    if (!form.title.trim()) return;
    onSave({ ...form, date });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 w-[calc(100vw-2rem)] max-w-md max-h-[90vh] overflow-y-auto px-4 rounded-xl shadow-md">
        <h2 className="text-lg font-bold mb-3">
          Nueva Tarea – {date.toLocaleDateString()}
        </h2>

        <label>Título</label>
        <input
          className="border p-2 w-full rounded mb-3"
          name="title"
          onChange={handleChange}
        />

        <label>Descripción</label>
        <textarea
          className="border p-2 w-full rounded mb-3"
          name="description"
          rows="3"
          onChange={handleChange}
        />

        <div className="flex justify-end gap-2 mt-3">
          <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={onClose}>
            Cancelar
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={save}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
