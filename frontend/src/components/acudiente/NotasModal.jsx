import React from "react";

export default function NotasModal({ isOpen, onClose, estudiante, notas = [] }) {
  if (!isOpen || !estudiante) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-5xl rounded-lg shadow-lg overflow-hidden relative">
        {/* Botón cerrar */}
        <button
          className="absolute top-3 right-4 text-2xl font-bold text-gray-700 hover:text-black"
          onClick={onClose}
        >
          ×
        </button>

        {/* Header azul como maqueta */}
        <div className="bg-blue-800 text-white px-8 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Bienvenidos al</h1>
            <h2 className="text-xl font-semibold">
              Centro Educativo Salvador Lenis
            </h2>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-gray-100 px-8 py-6">
          {/* Encabezado: datos del estudiante */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-semibold">Buenos Días</h3>
              <p className="text-lg text-gray-700">
                Acudiente de {estudiante.nombre}
              </p>
            </div>
          </div>

          {/* Datos del estudiante en una banda */}
          <div className="bg-white border px-4 py-3 mb-4">
            <p className="text-sm">
              <span className="font-semibold">Nombre del Estudiante: </span>
              {estudiante.nombre}
              <span className="ml-6 font-semibold">Grado: </span>
              {estudiante.grado}
              <span className="ml-6 font-semibold">ID del Estudiante: </span>
              {estudiante.documento}
            </p>
          </div>

          {/* Tabla de notas */}
          <div className="bg-white border p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-3 py-2 text-left">Materia</th>
                    <th className="border px-3 py-2 text-left">Docente</th>
                    <th className="border px-3 py-2 text-center">Periodo I</th>
                    <th className="border px-3 py-2 text-center">Periodo II</th>
                    <th className="border px-3 py-2 text-center">Periodo III</th>
                    <th className="border px-3 py-2 text-center">Nota Final</th>
                  </tr>
                </thead>
                <tbody>
                  {notas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="border px-3 py-4 text-center text-gray-500"
                      >
                        No hay notas registradas para este estudiante.
                      </td>
                    </tr>
                  ) : (
                    notas.map((n) => (
                      <tr key={n.id}>
                        <td className="border px-3 py-2">{n.materia}</td>
                        <td className="border px-3 py-2">{n.docente}</td>
                        <td className="border px-3 py-2 text-center">
                          {n.nota_p1 ?? "-"}
                        </td>
                        <td className="border px-3 py-2 text-center">
                          {n.nota_p2 ?? "-"}
                        </td>
                        <td className="border px-3 py-2 text-center">
                          {n.nota_p3 ?? "-"}
                        </td>
                        <td className="border px-3 py-2 text-center">
                          {n.nota_final ?? "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-center mt-4 text-gray-600">
              Para ver las notas sacadas en cada periodo (Tareas, Evaluaciones,
              Talleres), hacer clic en la materia que desea ver. (En esta versión
              solo se listan las notas generales por periodo).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
