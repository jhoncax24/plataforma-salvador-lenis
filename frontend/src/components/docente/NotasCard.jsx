import React from "react";

export default function NotasCard() {
  return (
    <div className="bg-[#e9ecef] border-2 border-gray-400 rounded p-6 flex flex-col h-full shadow-sm">
      <h3 className="text-2xl text-center text-gray-800 mb-6 border-b-2 border-gray-400 pb-4">
        Registro de Notas
      </h3>

      <div className="flex-1 flex flex-col gap-4 items-center px-4">
        <select className="w-full max-w-[200px] p-2 border border-gray-300 rounded text-gray-600 focus:outline-none text-center">
          <option>Grado</option>
        </select>
        <select className="w-full max-w-[200px] p-2 border border-gray-300 rounded text-gray-600 focus:outline-none text-center">
          <option>Materia</option>
        </select>
        <select className="w-full max-w-[200px] p-2 border border-gray-300 rounded text-gray-600 focus:outline-none text-center">
          <option>Estudiante</option>
        </select>
        <select className="w-full max-w-[200px] p-2 border border-gray-300 rounded text-gray-600 focus:outline-none text-center">
          <option>Periodo I</option>
        </select>
        
        <div className="mt-4 w-full flex flex-col items-center">
          <label className="text-gray-700 font-medium mb-2">Nota</label>
          <input 
            type="text" 
            className="w-full max-w-[200px] p-2 border border-gray-300 rounded text-center focus:outline-none"
            defaultValue="4.0"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <button className="bg-[#0033a0] text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 w-3/4 transition-colors">
          Registrar Nota
        </button>
        <button className="bg-[#0033a0] text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 w-3/4 transition-colors">
          Cambiar Nota
        </button>
      </div>
    </div>
  );
}