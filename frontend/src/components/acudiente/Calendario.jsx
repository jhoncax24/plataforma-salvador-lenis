// Calendario.jsx
import { useState } from "react";

export default function Calendario() {
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());

  // Crear fecha inicial del mes actual
  const primerDia = new Date(anio, mes, 1);
  const diaSemana = primerDia.getDay(); // 0 domingo, 1 lunes...
  
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();

  // Cambiar mes
  const cambiarMes = (dir) => {
    let nuevoMes = mes + dir;
    let nuevoAnio = anio;

    if (nuevoMes < 0) {
      nuevoMes = 11;
      nuevoAnio--;
    } else if (nuevoMes > 11) {
      nuevoMes = 0;
      nuevoAnio++;
    }

    setMes(nuevoMes);
    setAnio(nuevoAnio);
  };

  const diasCalendario = [];

  // Rellenar días vacíos antes del día 1
  for (let i = 0; i < diaSemana; i++) {
    diasCalendario.push(null);
  }

  // Rellenar días del mes
  for (let i = 1; i <= diasEnMes; i++) {
    diasCalendario.push(i);
  }

  return (
    <div className="border-2 border-gray-700 p-6 bg-gray-100 h-full">
      <h3 className="text-xl font-semibold mb-4">Calendario</h3>

      {/* ENCABEZADO */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => cambiarMes(-1)}
          className="bg-blue-800 text-white px-3 py-1 rounded"
        >
          ◀
        </button>

        <h2 className="text-lg font-semibold">
          {meses[mes]} {anio}
        </h2>

        <button
          onClick={() => cambiarMes(1)}
          className="bg-blue-800 text-white px-3 py-1 rounded"
        >
          ▶
        </button>
      </div>

      {/* DÍAS DE LA SEMANA */}
      <div className="grid grid-cols-7 text-center font-semibold mb-2">
        <div>Dom</div>
        <div>Lun</div>
        <div>Mar</div>
        <div>Mié</div>
        <div>Jue</div>
        <div>Vie</div>
        <div>Sáb</div>
      </div>

      {/* GRID DEL CALENDARIO */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {diasCalendario.map((dia, i) => (
          <div
            key={i}
            className={`p-2 h-12 flex items-center justify-center rounded ${
              dia === hoy.getDate() &&
              mes === hoy.getMonth() &&
              anio === hoy.getFullYear()
                ? "bg-blue-800 text-white font-bold"
                : "bg-white"
            }`}
          >
            {dia || ""}
          </div>
        ))}
      </div>
    </div>
  );
}
