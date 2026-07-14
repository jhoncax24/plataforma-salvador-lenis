import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NotasPeriodo({ hijos = [], onVerNotas }) {
  const [hijoId, setHijoId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (hijos.length > 0 && !hijoId) {
      setHijoId(hijos[0].id);
    }
  }, [hijos, hijoId]);

  const handleClickNotas = () => {
    if (!hijoId) return alert("Seleccione un estudiante");
    onVerNotas(Number(hijoId)); 
  };

  const handleVerComportamiento = () => {
    if (!hijoId) return alert("Seleccione un estudiante");
    const estudianteSeleccionado = hijos.find(h => h.id === Number(hijoId));
    // Navegamos a la nueva ruta pasándole los datos del hijo
    navigate("/acudiente/comportamiento", { state: { estudiante: estudianteSeleccionado } });
  };

  return (
    <div className="flex flex-col h-full">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Estudiante a consultar:</label>
        <select
          value={hijoId}
          onChange={(e) => setHijoId(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-[#0033a0] font-medium text-gray-700 transition-colors bg-white shadow-sm"
        >
          {hijos.length === 0 && <option value="">Sin estudiantes asignados</option>}
          {hijos.map((h) => (
            <option key={h.id} value={h.id}>
              {h.nombre} - {h.grado}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1"></div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-3">
        <button
          onClick={handleClickNotas}
          className="w-full bg-[#0033a0] text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-all shadow-md flex justify-center items-center gap-2"
        >
          📊 Ver Calificaciones
        </button>
        <button
          onClick={handleVerComportamiento}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all shadow-md flex justify-center items-center gap-2"
        >
          👀 Observador y Asistencia
        </button>
      </div>
    </div>
  );
}