import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AsistenciasEstudiante() {
  const navigate = useNavigate();
  const [datosAsistencia, setDatosAsistencia] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 👇 NUEVO ESTADO: Guarda el ID de la materia que está expandida actualmente. 
  // Si es null, todas están cerradas.
  const [materiaExpandida, setMateriaExpandida] = useState(null);

  // SIMULACIÓN DE CARGA
  useEffect(() => {
    const loadData = async () => {
      try {
        // Datos simulados. Agregamos "detalle_faltas" a cada materia.
        setTimeout(() => {
          setDatosAsistencia([
            { 
              id_materia: 1, nombre_materia: 'FILOSOFÍA', docente: 'Sin asignar', clases_totales: 36, fallas_acumuladas: 2, porcentaje: 94.4,
              detalle_faltas: [
                { id_falta: 101, fecha: '15 de Abril, 2026', hora: '08:00 AM' },
                { id_falta: 102, fecha: '22 de Abril, 2026', hora: '09:30 AM' }
              ]
            },
            { 
              id_materia: 2, nombre_materia: 'FÍSICA', docente: 'Sin asignar', clases_totales: 38, fallas_acumuladas: 1, porcentaje: 97.3,
              detalle_faltas: [
                { id_falta: 201, fecha: '02 de Mayo, 2026', hora: '10:00 AM' }
              ]
            },
            { 
              // 👇 MATERIA CON 0 FALTAS PARA PROBAR EL MENSAJE
              id_materia: 3, nombre_materia: 'MATEMÁTICAS', docente: 'Sin asignar', clases_totales: 40, fallas_acumuladas: 0, porcentaje: 100.0,
              detalle_faltas: [] 
            },
            { 
              id_materia: 4, nombre_materia: 'QUÍMICA', docente: 'Dr. Ruiz', clases_totales: 36, fallas_acumuladas: 3, porcentaje: 91.6,
              detalle_faltas: [
                { id_falta: 401, fecha: '10 de Marzo, 2026', hora: '07:00 AM' },
                { id_falta: 402, fecha: '12 de Marzo, 2026', hora: '07:00 AM' },
                { id_falta: 403, fecha: '28 de Abril, 2026', hora: '08:30 AM' }
              ]
            }
          ]);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error al cargar asistencias", error);
      }
    };
    loadData();
  }, []);

  // 👇 NUEVA FUNCIÓN: Abre o cierra el detalle de la materia al hacer clic
  const toggleExpandir = (id_materia) => {
    if (materiaExpandida === id_materia) {
      // Si le dio clic a la que ya estaba abierta, la cerramos
      setMateriaExpandida(null);
    } else {
      // Si le dio clic a una nueva, la abrimos
      setMateriaExpandida(id_materia);
    }
  };

  // Renderizador del "Pill" de Estado
  const renderEstadoPill = (porcentaje) => {
    if (porcentaje < 80) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-bold bg-red-100 text-red-700 border border-red-300 whitespace-nowrap shadow-sm">
          🚨 EN RIESGO
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-bold bg-green-100 text-green-700 border border-green-300 whitespace-nowrap shadow-sm">
          ✅ AL DÍA
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-[#0033a0]">
        Cargando tus asistencias...
      </div>
    );
  }

  return (
    <div className="w-[95%] max-w-[1800px] mx-auto pt-6 pb-12 animate-fade-in-up">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-5 mb-8 bg-white rounded-xl shadow-sm border border-gray-200 border-l-[5px] border-l-[#0033a0] gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <p className="text-gray-700 text-sm md:text-base m-0 font-medium">
            <span className="text-[#0033a0] font-bold">Tip:</span> Haz clic en cualquier materia para ver el historial exacto de tus faltas.
          </p>
        </div>
        <button 
          onClick={() => navigate('/estudiante')}
          className="w-full md:w-auto px-5 py-2.5 bg-[#0033a0] hover:bg-blue-800 text-white text-sm font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          Volver al Menú
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px] border-collapse">
            
            <thead className="bg-[#0033a0]">
              <tr>
                <th className="py-4 px-6 text-white text-sm font-semibold tracking-wider">Materia</th>
                <th className="py-4 px-6 text-white text-sm font-semibold tracking-wider">Docente</th>
                <th className="py-4 px-6 text-white text-sm font-semibold tracking-wider text-center">Clases Totales</th>
                <th className="py-4 px-6 text-white text-sm font-semibold tracking-wider text-center">Fallas Acumuladas</th>
                <th className="py-4 px-6 text-white text-sm font-semibold tracking-wider text-center">% Asistencia</th>
                <th className="py-4 px-6 text-white text-sm font-semibold tracking-wider text-center">Estado</th>
              </tr>
            </thead>
            
            <tbody>
              {datosAsistencia.map((asistencia, index) => (
                // Usamos React.Fragment para agrupar la fila principal y la fila de detalles
                <React.Fragment key={asistencia.id_materia}>
                  
                  {/* FILA PRINCIPAL (Al hacer clic ejecuta toggleExpandir) */}
                  <tr 
                    onClick={() => toggleExpandir(asistencia.id_materia)}
                    className={`group cursor-pointer transition-colors border-b border-gray-200 
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} 
                      hover:bg-blue-50`}
                  >
                    <td className="py-5 px-6 text-gray-800 font-bold text-[15px] flex items-center gap-2">
                      {/* Agregamos una flechita que gira si la fila está expandida */}
                      <span className={`text-gray-400 transition-transform duration-200 ${materiaExpandida === asistencia.id_materia ? 'rotate-90' : ''}`}>
                        ▶
                      </span>
                      {asistencia.nombre_materia}
                    </td>
                    <td className="py-5 px-6 text-gray-600 text-sm font-medium">{asistencia.docente}</td>
                    <td className="py-5 px-6 text-gray-800 font-bold text-center">{asistencia.clases_totales}</td>
                    <td className="py-5 px-6 text-gray-800 font-bold text-center">{asistencia.fallas_acumuladas}</td>
                    <td className="py-5 px-6 text-gray-800 font-bold text-center">{asistencia.porcentaje.toFixed(1)}%</td>
                    <td className="py-5 px-6 text-center">{renderEstadoPill(asistencia.porcentaje)}</td>
                  </tr>

                  {/* 👇 FILA DE DETALLES (Solo se dibuja si esta materia es la expandida) 👇 */}
                  {materiaExpandida === asistencia.id_materia && (
                    <tr className="bg-blue-50/50 border-b border-gray-200">
                      {/* colSpan="6" hace que esta celda ocupe todo el ancho de la tabla */}
                      <td colSpan="6" className="p-0">
                        <div className="py-6 px-10 border-l-[4px] border-[#0033a0] ml-6">
                          
                          <h4 className="text-[#0033a0] font-bold mb-4">Detalle de Inasistencias</h4>
                          
                          {/* Evaluamos si tiene faltas o no */}
                          {asistencia.fallas_acumuladas === 0 ? (
                            <div className="bg-green-100 text-green-800 p-4 rounded-lg flex items-center gap-3 font-medium border border-green-200 w-fit">
                              <span className="text-xl">🎉</span>
                              ¡Felicidades! No tienes faltas registradas en esta materia. Sigue así.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {/* Dibujamos la lista de fechas */}
                              {asistencia.detalle_faltas.map((falta) => (
                                <div key={falta.id_falta} className="bg-white border border-gray-300 p-3 rounded-lg shadow-sm flex items-center gap-3">
                                  <div className="bg-red-100 text-red-600 p-2 rounded-full">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                  </div>
                                  <div>
                                    <p className="text-gray-800 font-bold text-sm">{falta.fecha}</p>
                                    <p className="text-gray-500 text-xs">Hora de clase: {falta.hora}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
            
          </table>
        </div>
      </div>

    </div>
  );
}