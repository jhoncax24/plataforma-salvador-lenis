import React from "react";

function dateDisplay(d) {
  if(!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString();
}

export default function TasksCard({ tasks = [] }) {
  return (
    <div className="cesl-panel">
      <h3 className="text-xl font-semibold mb-4 text-center">Tareas/Pendientes</h3>

      <div className="space-y-2 mb-4">
        {tasks.map(t => (
          <div key={t.id} className="p-2 rounded flex items-center" style={{background: t.color || '#e5e7eb'}}>
            <div className="flex-1">
              <div className="font-semibold">{t.title}</div>
              <div className="text-xs">{t.description}</div>
            </div>
            <div className="text-xs text-right">
              <div>{dateDisplay(t.due_date)}</div>
              <div className="mt-2">
                <button className="btn-cesl px-3 py-1">Ver Más Tareas</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        {/* Simple calendar placeholder */}
        <div className="text-center text-sm mb-2">Calendar</div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {"L M X J V S D".split(" ").map((d,i)=>(
            <div key={i} className="font-semibold">{d}</div>
          ))}
          {Array.from({length: 28}).map((_,i)=>(
            <div key={i} className="p-2 border rounded text-center">{i+1}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
