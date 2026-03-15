import React from "react";

export default function ScheduleCard({ student }) {
  return (
    <div className="bg-[#e9ecef] border-2 border-gray-400 rounded flex flex-col h-full shadow-sm">
      <h3 className="text-xl text-center text-gray-800 py-4 border-b-2 border-gray-400 m-0">Tu horario e información</h3>
      
      {/* Tabla del Horario */}
      <div className="bg-white p-4">
        <table className="w-full border-collapse border border-gray-300 text-center text-xs text-gray-600 mb-4">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="py-2 border-r border-gray-300 font-semibold">Lunes</th>
              <th className="py-2 border-r border-gray-300 font-semibold">Martes</th>
              <th className="py-2 border-r border-gray-300 font-semibold">Miércoles</th>
              <th className="py-2 border-r border-gray-300 font-semibold">Jueves</th>
              <th className="py-2 font-semibold">Viernes</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="p-4 border-r border-gray-300 border-b"></td><td className="border-r border-gray-300 border-b"></td><td className="border-r border-gray-300 border-b"></td><td className="border-r border-gray-300 border-b"></td><td className="border-b border-gray-300"></td></tr>
            <tr><td className="p-4 border-r border-gray-300 border-b"></td><td className="border-r border-gray-300 border-b"></td><td className="border-r border-gray-300 border-b"></td><td className="border-r border-gray-300 border-b"></td><td className="border-b border-gray-300"></td></tr>
            <tr><td className="p-4 border-r border-gray-300"></td><td className="border-r border-gray-300"></td><td className="border-r border-gray-300"></td><td className="border-r border-gray-300"></td><td></td></tr>
          </tbody>
        </table>
      </div>

      {/* Info del estudiante en el fondo gris */}
      <div className="bg-[#e9ecef] flex flex-col items-center border-t-2 border-gray-400 p-6 flex-1">
        <button className="bg-[#0033a0] text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition-colors mb-6 w-3/4">
          Descargar Horario
        </button>
        
        <div className="w-full text-center text-sm text-gray-800 space-y-3">
          <p>Nombre: {student?.nombre || 'Juan Lucumi'}</p>
          <p>Edad: 14</p>
          <p>Documento de Identidad: {student?.documento || '1234567890'}</p>
          <p>Grado Escolar: {student?.grado || 'Noveno'}</p>
          <p>Acudiente(s): {student?.acudiente || 'Jhon Solano'}</p>
        </div>
      </div>
    </div>
  );
}