// src/components/NotasPeriodo.jsx
import { useState, useEffect } from "react";

export default function NotasPeriodo({ hijos = [], onVerNotas }) {
  const [hijoId, setHijoId] = useState("");

  useEffect(() => {
    if (hijos.length > 0 && !hijoId) {
      setHijoId(hijos[0].id);
    }
  }, [hijos, hijoId]);

  const [periodo, setPeriodo] = useState("1"); // Por ahora informativo

  const handleClick = () => {
    if (!hijoId) {
      alert("Seleccione un estudiante");
      return;
    }
    // Mandamos el id del estudiante al padre
    onVerNotas(Number(hijoId), periodo);
  };

  return (
    <div className="border-2 border-gray-700 p-6 bg-gray-100 h-full">
      <h3 className="text-xl font-semibold mb-4">Notas del periodo</h3>

      <div className="mb-4">
        <label className="block text-sm mb-1">Seleccione estudiante</label>
        <select
          value={hijoId}
          onChange={(e) => setHijoId(e.target.value)}
          className="w-full border rounded px-2 py-1"
        >
          {hijos.map((h) => (
            <option key={h.id} value={h.id}>
              {h.nombre} - {h.grado}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm mb-1">Periodo</label>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="w-full border rounded px-2 py-1"
        >
          <option value="1">Periodo 1</option>
          <option value="2">Periodo 2</option>
          <option value="3">Periodo 3</option>
          <option value="4">Periodo 4</option>
        </select>
      </div>

      <button
        onClick={handleClick}
        className="mt-2 bg-blue-800 text-white px-4 py-2 rounded w-full hover:bg-blue-900"
      >
        Ver notas
      </button>
    </div>
  );
}
