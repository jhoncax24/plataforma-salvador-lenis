import React from "react";

export default function GradesCard({ grades = [] }) {
  return (
    <div className="cesl-panel">
      <h3 className="text-xl font-semibold mb-4 text-center">Materias y Notas</h3>
      <div className="overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2">Materia</th>
              <th className="py-2 text-right">Nota Final</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g, i) => (
              <tr key={i} className={i % 2 ? '' : 'bg-gray-50'}>
                <td className="py-3">{g.course_name || g.course || 'Materia'}</td>
                <td className="py-3 text-right font-semibold">{(g.grade !== undefined) ? g.grade.toFixed(1) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-center">
        <button className="btn-cesl px-6 py-2">Ver Notas por Periodo</button>
      </div>
    </div>
  );
}
