import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ObservadorCard() {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-[350px] transition-all hover:shadow-md">
      
      {/* TÍTULO */}
      <div className="mb-4">
        <h3 className="text-xl font-extrabold text-[#0033a0] border-b-2 border-gray-100 pb-3 flex items-center gap-2">
          <span>📖</span> Observador del Alumno
        </h3>
      </div>

      {/* CONTENIDO DEL WIDGET */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
        <div className="bg-blue-50 p-5 rounded-full border border-blue-100 shadow-inner">
          <span className="text-5xl" role="img" aria-label="observador">✍️</span>
        </div>
        <p className="text-gray-500 font-medium text-sm px-2">
          Registra anotaciones disciplinarias, felicitaciones y revisa el historial de convivencia de tus estudiantes.
        </p>
      </div>

      {/* BOTÓN DE ACCIÓN PRINCIPAL */}
      <button
        onClick={() => navigate('/docente/observador')}
        className="w-full bg-[#0033a0] hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md flex justify-center items-center gap-2 mt-auto shrink-0"
      >
        <span>Abrir Observador</span>
        <span className="text-xl">→</span>
      </button>

    </div>
  );
}