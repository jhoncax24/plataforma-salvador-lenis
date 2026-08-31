import React from "react";
import { useNavigate } from "react-router-dom";

export default function GradesCard({ grades = [] }) {
  const navigate = useNavigate();

  return (
    <div className="bg-[#e9ecef] border-2 border-gray-400 rounded-xl flex flex-col h-full shadow-sm overflow-hidden animate-fade-in-up">
      
      {/* CABECERA */}
      <h3 className="text-xl text-center text-gray-800 py-4 border-b-2 border-gray-400 m-0 font-bold shrink-0">
        Materias y Notas
      </h3>
      
      {/* ========================================== */}
      {/* ÁREA BLANCA PRINCIPAL (Crece dinámicamente)  */}
      {/* ========================================== */}
      <div className="bg-white p-4 flex-1 flex flex-col min-h-0">
        
        {/* Tabla con Scroll Automático solo si es necesario */}
        <div className="flex-1 overflow-y-auto overflow-x-auto pr-1">
          <table className="w-full border-collapse text-left text-sm text-gray-700">
            <thead className="bg-blue-50 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-3 font-bold text-[#0033a0] border-b-2 border-blue-200 text-xs sm:text-sm">Materia</th>
                <th className="py-3 px-3 font-bold text-[#0033a0] border-b-2 border-blue-200 text-center text-xs sm:text-sm">Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grades.length === 0 ? (
                <tr>
                  <td colSpan="2" className="py-6 text-center text-gray-500 italic text-xs sm:text-sm">
                    No hay notas registradas.
                  </td>
                </tr>
              ) : (
                grades.map((nota, index) => {
                  const notaNum = parseFloat(nota.definitiva);
                  
                  return (
                    <tr key={index} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="py-3 px-3 font-semibold text-gray-800 text-xs sm:text-sm">
                        {nota.materia}
                      </td>
                      <td className="py-3 px-3 text-center text-xs sm:text-sm">
                        {/* Píldora de color para la nota */}
                        <span className={`px-3 py-1 rounded-full font-bold text-xs shadow-sm inline-block w-12 text-center
                          ${nota.definitiva === "0.0" || nota.definitiva === 0 
                              ? 'bg-gray-200 text-gray-600' 
                              : notaNum < 3.0 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {nota.definitiva}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Botón Principal pegado a la tabla */}
        <div className="pt-4 mt-2 border-t border-gray-100 shrink-0">
          <button 
            onClick={() => navigate("/estudiante/notas")}
            className="w-full bg-[#0033a0] text-white px-4 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-all shadow-md hover:shadow-lg"
          >
            Ver Notas por Periodo
          </button>
        </div>

      </div>

      {/* ========================================== */}
      {/* ÁREA GRIS INFERIOR (Historial Académico)     */}
      {/* ========================================== */}
      <div className="bg-[#e9ecef] flex flex-col items-center justify-center border-t-2 border-gray-400 p-5 shrink-0">
        <p className="text-xs text-gray-600 mb-2 font-medium text-center">
          Consulta tus notas de años anteriores
        </p>
        <button 
          // Este enlace lo prepararemos en el próximo sprint
          onClick={() => navigate("/estudiante/historial")}
          className="w-full bg-white border-2 border-[#0033a0] text-[#0033a0] px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-sm"
        >
          Ver Boletines Pasados
        </button>
      </div>

    </div>
  );
}