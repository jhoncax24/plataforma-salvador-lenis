import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { obtenerObservacionesHijo, obtenerAsistenciaHijo } from "../../api/perfilApi";

export default function ObservadorAsistenciaVista() {
  const location = useLocation();
  const navigate = useNavigate();
  const { estudiante } = location.state || {};

  const [pestaña, setPestaña] = useState("observador");
  const [observaciones, setObservaciones] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!estudiante) return;
    
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const [dataObs, dataAsis] = await Promise.all([
          obtenerObservacionesHijo(estudiante.id),
          obtenerAsistenciaHijo(estudiante.id)
        ]);
        setObservaciones(dataObs || []);
        setAsistencias(dataAsis || []);
      } catch (error) {
        console.error("Error cargando datos del estudiante:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [estudiante]);

  if (!estudiante) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">No se seleccionó ningún estudiante. <button onClick={() => navigate(-1)} className="ml-2 text-blue-600 underline">Volver</button></div>;

  return (
    <div className="w-full min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6 animate-fade-in-up font-sans flex flex-col">
      
      {/* HEADER PRINCIPAL */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 sm:p-6 rounded-xl shadow-sm border-l-[6px] border-green-600 mb-4 sm:mb-6 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 m-0">Comportamiento y Asistencia</h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1 font-medium">
            Expediente de: <strong className="text-green-700 uppercase">{estudiante.nombre}</strong>
          </p>
        </div>
        <button onClick={() => navigate(-1)} className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-lg transition-colors shadow text-center">
          Volver al Inicio
        </button>
      </div>

      <div className="w-full max-w-5xl mx-auto flex flex-col flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* SELECTOR DE PESTAÑAS */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button 
            onClick={() => setPestaña("observador")} 
            className={`flex-1 py-4 font-bold text-sm sm:text-base transition-colors ${pestaña === "observador" ? "text-green-700 border-b-4 border-green-600 bg-white" : "text-gray-500 hover:bg-gray-100"}`}
          >
            📖 Observador (Anotaciones)
          </button>
          <button 
            onClick={() => setPestaña("asistencia")} 
            className={`flex-1 py-4 font-bold text-sm sm:text-base transition-colors ${pestaña === "asistencia" ? "text-orange-600 border-b-4 border-orange-500 bg-white" : "text-gray-500 hover:bg-gray-100"}`}
          >
            ✅ Control de Asistencia
          </button>
        </div>

        {/* CONTENIDO DE LAS PESTAÑAS */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto bg-gray-50/50 custom-scrollbar">
          {cargando ? (
            <p className="text-center text-gray-500 font-bold p-10">Cargando expediente...</p>
          ) : (
            <>
              {/* PESTAÑA: OBSERVADOR */}
              {pestaña === "observador" && (
                <div className="space-y-4">
                  {observaciones.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl border border-dashed border-green-300 text-center text-green-700 font-medium shadow-sm">
                      <span className="text-4xl block mb-2">✨</span>
                      Este estudiante tiene un expediente de comportamiento impecable.
                    </div>
                  ) : (
                    observaciones.map((obs) => {
                      let colorBorder = "border-blue-200"; let colorBg = "bg-blue-50"; let colorBadge = "bg-blue-100 text-blue-800";
                      if (obs.tipo === "Falta Leve") { colorBorder = "border-yellow-300"; colorBg = "bg-yellow-50"; colorBadge = "bg-yellow-200 text-yellow-800"; }
                      if (obs.tipo === "Falta Grave") { colorBorder = "border-red-300"; colorBg = "bg-red-50"; colorBadge = "bg-red-100 text-red-800"; }
                      if (obs.tipo === "Felicitación") { colorBorder = "border-green-300"; colorBg = "bg-green-50"; colorBadge = "bg-green-100 text-green-800"; }

                      return (
                        <div key={obs.id_observacion} className={`p-4 rounded-lg border ${colorBorder} ${colorBg} shadow-sm`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${colorBadge}`}>{obs.tipo}</span>
                            <span className="text-xs font-bold text-gray-500">{obs.fecha_formato}</span>
                          </div>
                          <p className="text-gray-800 text-sm mt-2">{obs.descripcion}</p>
                          <p className="text-xs text-gray-500 mt-3 font-medium border-t border-black/5 pt-2">Registrado por el docente: {obs.nombre_docente}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* PESTAÑA: ASISTENCIA */}
              {pestaña === "asistencia" && (
                <div className="space-y-4">
                  {asistencias.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500 font-medium shadow-sm">
                      Aún no hay registros de asistencia para este estudiante.
                    </div>
                  ) : (
                    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                      <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                          <tr className="bg-gray-100 text-gray-600 text-xs uppercase">
                            <th className="p-3 font-bold border-b text-center">Fecha</th>
                            <th className="p-3 font-bold border-b">Materia</th>
                            <th className="p-3 font-bold border-b">Docente</th>
                            <th className="p-3 font-bold border-b text-center">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {asistencias.map((asis, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="p-3 text-center text-sm font-bold text-gray-700">{asis.fecha_formato}</td>
                              <td className="p-3 font-medium text-sm text-gray-800">{asis.materia}</td>
                              <td className="p-3 text-sm text-gray-600">{asis.docente}</td>
                              <td className="p-3 text-center">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full 
                                  ${asis.estado === 'Presente' ? 'bg-green-100 text-green-700' : 
                                    asis.estado === 'Ausente' ? 'bg-red-100 text-red-700' : 
                                    asis.estado === 'Excusa' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-800'}`}
                                >
                                  {asis.estado}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}