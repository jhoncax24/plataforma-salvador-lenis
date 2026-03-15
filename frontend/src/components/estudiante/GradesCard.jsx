import React from "react";

export default function GradesCard({ grades = [] }) {
  return (
    <div className="bg-[#e9ecef] border-2 border-gray-400 rounded flex flex-col h-full shadow-sm">
      <h3 className="text-xl text-center text-gray-800 py-4 border-b-2 border-gray-400 m-0">Materias y Notas</h3>
      
      <div className="flex-1 bg-white p-4 flex flex-col">
        <table className="w-full text-left border-collapse mb-auto">
          <thead>
            <tr className="text-gray-700 border-b border-gray-300">
              <th className="py-3 px-3 font-semibold text-center">Materia</th>
              <th className="py-3 px-3 font-semibold text-center">Nota Final</th>
            </tr>
          </thead>
          <tbody>
            {grades.length === 0 ? (
              <tr><td colSpan="2" className="py-4 text-center text-gray-500">No hay notas</td></tr>
            ) : (
              grades.map((g, i) => (
                <tr key={i} className="border-b border-gray-200 last:border-0">
                  <td className="py-4 px-3 text-center text-gray-800">{g.materia || 'Materia'}</td>
                  <td className="py-4 px-3 text-center font-bold text-gray-800">
                    {(g.nota_final !== undefined && g.nota_final !== null) ? Number(g.nota_final).toFixed(1) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Sección inferior igual al mockup */}
        <div className="mt-8 text-center text-sm text-gray-800 mb-4">
          Para ver las notas de cada periodo, haga clic en el botón
        </div>
        <div className="flex justify-center">
          <button className="bg-[#0033a0] text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition-colors w-3/4">
            Ver Notas por Periodo
          </button>
        </div>
      </div>
    </div>
  );
}