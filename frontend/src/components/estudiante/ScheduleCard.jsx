import React from "react";

function weekdayName(n) {
  return ["Lunes","Martes","Miércoles","Jueves","Viernes"][n-1] || "";
}

export default function ScheduleCard({ schedule = [], student }) {
  // schedule: [{day_of_week, start_time, end_time, subject, location}, ...]
  const grouped = [1,2,3,4,5].map(d => schedule.filter(s => s.day_of_week === d));

  const downloadSchedule = () => {
    // simple CSV export
    let csv = "Día,Hora inicio,Hora fin,Asignatura,Ubicación\n";
    schedule.forEach(s => {
      csv += `${weekdayName(s.day_of_week)},${s.start_time || ''},${s.end_time || ''},${s.subject || ''},${s.location || ''}\n`;
    });
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'horario.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="cesl-panel">
      <h3 className="text-xl font-semibold mb-4 text-center">Tu horario e información</h3>

      <div className="mb-4">
        <table className="w-full border">
          <thead>
            <tr>
              <th className="p-2 text-left">Lunes</th>
              <th className="p-2 text-left">Martes</th>
              <th className="p-2 text-left">Miércoles</th>
              <th className="p-2 text-left">Jueves</th>
              <th className="p-2 text-left">Viernes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {grouped.map((arr, i) => (
                <td key={i} className="p-3 align-top">
                  {arr.map((it, idx) => (
                    <div key={idx} className="mb-2 bg-gray-100 p-2 rounded">
                      <div className="font-semibold">{it.subject}</div>
                      <div className="text-xs text-gray-600">{it.start_time} - {it.end_time}</div>
                    </div>
                  ))}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-center mb-4">
        <button onClick={downloadSchedule} className="btn-cesl px-6 py-2">Descargar Horario</button>
      </div>

      <div className="bg-gray-100 p-3 rounded">
        <div className="text-sm"><strong>Nombre:</strong> {student.full_name}</div>
        <div className="text-sm"><strong>Edad:</strong> {/* approximate */}
          {student.birth_date ? Math.max(0, new Date().getFullYear() - new Date(student.birth_date).getFullYear()) : '14'}</div>
        <div className="text-sm"><strong>Documento:</strong> {student.enrollment_number || '1234567890'}</div>
        <div className="text-sm"><strong>Grado Escolar:</strong> {student.grade_level || 'Noveno'}</div>
        <div className="text-sm"><strong>Acudiente(s):</strong> {student.guardian_contact || ''}</div>
      </div>
    </div>
  );
}
