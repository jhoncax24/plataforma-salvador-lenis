import React from "react";

export default function ObservadorCard() {
  return (
    <div className="bg-[#e9ecef] border-2 border-gray-400 rounded p-6 flex flex-col h-full shadow-sm">
      <h3 className="text-2xl font-bold text-center text-[#0033a0] mb-6 border-b-2 border-gray-400 pb-4">
        Observador de Estudiantes
      </h3>

      {/* MITAD SUPERIOR: CONSULTA */}
      <div className="mb-6 pb-6 border-b border-gray-300">
        <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Consultar Observaciones</h4>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <select className="flex-1 p-2 border border-gray-300 rounded text-sm text-gray-600 focus:outline-none">
              <option>Grado</option>
              <option>5-1</option>
              <option>6-1</option>
            </select>
            <select className="flex-1 p-2 border border-gray-300 rounded text-sm text-[#0033a0] focus:outline-none">
              <option>Tipo</option>
              <option>Positiva</option>
              <option>Negativa</option>
              <option>Académica</option>
            </select>
          </div>
          <select className="w-full p-2 border border-gray-300 rounded text-sm text-[#0033a0] focus:outline-none">
            <option>Seleccionar Estudiante</option>
            <option>Juan Lucumi</option>
            <option>Jhon Solano</option>
          </select>
          <div className="flex justify-center mt-2">
            <button className="bg-[#0033a0] text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 w-3/4 transition-colors">
              Ver Observaciones
            </button>
          </div>
        </div>
      </div>

      {/* MITAD INFERIOR: REGISTRO */}
      <div className="flex-1 flex flex-col">
        <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Registrar Nueva Observación</h4>
        
        <div className="flex gap-2 mb-3">
            <select className="flex-1 p-2 border border-gray-300 rounded text-sm text-gray-600 focus:outline-none">
              <option>Grado</option>
              <option>5-1</option>
              <option>6-1</option>
            </select>
            <select className="flex-1 p-2 border border-gray-300 rounded text-sm text-[#0033a0] focus:outline-none">
              <option>Estudiante</option>
              <option>Juan Lucumi</option>
              <option>Jhon Solano</option>
            </select>
        </div>

        <div className="flex gap-2 mb-3">
            <input 
              type="date" 
              className="flex-1 p-2 border border-gray-300 rounded text-sm text-gray-600 focus:outline-none"
            />
            <select className="flex-1 p-2 border border-gray-300 rounded text-sm text-[#0033a0] focus:outline-none">
              <option>Nivel de Falta</option>
              <option>Leve</option>
              <option>Media</option>
              <option>Grave</option>
            </select>
        </div>

        <div className="flex-1 flex flex-col items-center mb-4">
          <textarea 
            className="w-full p-3 border border-gray-300 rounded resize-none h-24 focus:outline-none text-sm"
            placeholder="Detalle de la observación..."
          ></textarea>
        </div>

        <div className="flex justify-center mt-auto">
          <button className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 w-3/4 transition-colors">
            Agregar Observación
          </button>
        </div>
      </div>
    </div>
  );
}