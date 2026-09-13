import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerDetalleAsistencia } from "../../api/perfilApi"; 
import { MdWarning, MdCheckCircle, MdLightbulb, MdChevronRight } from "react-icons/md";

export default function AsistenciasEstudiante() {
  const navigate = useNavigate();
  const [datosAsistencia, setDatosAsistencia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [materiaExpandida, setMateriaExpandida] = useState(null);

  const userStr = localStorage.getItem("cesl_user") || localStorage.getItem("usuario");
  const user = userStr ? JSON.parse(userStr) : null;
  const idUsuario = user?.id_usuario || user?.id;

  useEffect(() => {
    if (idUsuario) {
      cargarAsistencias();
    } else {
      setLoading(false);
    }
  }, [idUsuario]);

  const cargarAsistencias = async () => {
    setLoading(true);
    const data = await obtenerDetalleAsistencia(idUsuario);
    setDatosAsistencia(data);
    setLoading(false);
  };

  const toggleExpandir = (id_materia) => {
    if (materiaExpandida === id_materia) {
      setMateriaExpandida(null);
    } else {
      setMateriaExpandida(id_materia);
    }
  };

  const renderEstadoPill = (porcentaje) => {
    if (porcentaje < 80) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-bold bg-red-100 text-red-700 border border-red-300 whitespace-nowrap shadow-sm">
          <MdWarning className="text-lg" /> EN RIESGO
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-bold bg-green-100 text-green-700 border border-green-300 whitespace-nowrap shadow-sm">
          <MdCheckCircle className="text-lg" /> AL DÍA
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
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-5 mb-8 bg-white rounded-xl shadow-sm border border-gray-200 border-l-[6px] border-modulo-asistencia gap-4">
        <div className="flex items-center gap-3">
          <MdLightbulb className="text-2xl text-modulo-asistencia" />
          <p className="text-gray-700 text-sm md:text-base m-0 font-medium">
            <span className="text-modulo-asistencia font-bold">Ayuda</span> Haz clic en la fila principal para ver el historial exacto de tus faltas o retrasos en el curso.
          </p>
        </div>
        <button 
          onClick={() => navigate('/estudiante')}
          className="w-full md:w-auto px-5 py-2.5 bg-modulo-asistencia hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          Volver al Menú
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-300 overflow-hidden">
        <div className="w-full overflow-x-auto shadow-[inset_-12px_0_8px_-12px_rgba(0,0,0,0.1)]">
          <table className="w-full text-left min-w-[800px] border-collapse">
            
            <thead className="bg-[#0033a0]">
              <tr>
                <th className="py-4 px-6 text-white text-xs sm:text-sm font-semibold tracking-wider">Módulo</th>
                <th className="py-4 px-6 text-white text-xs sm:text-sm font-semibold tracking-wider">Reporte por</th>
                <th className="py-4 px-6 text-white text-xs sm:text-sm font-semibold tracking-wider text-center">Días Evaluados</th>
                <th className="py-4 px-6 text-white text-xs sm:text-sm font-semibold tracking-wider text-center">Fallas Acumuladas</th>
                <th className="py-4 px-6 text-white text-xs sm:text-sm font-semibold tracking-wider text-center">% Asistencia</th>
                <th className="py-4 px-6 text-white text-xs sm:text-sm font-semibold tracking-wider text-center">Estado</th>
              </tr>
            </thead>
            
            <tbody>
              {datosAsistencia.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500 font-medium">
                    No hay registros de asistencia en tu curso actual.
                  </td>
                </tr>
              ) : (
                datosAsistencia.map((asistencia, index) => (
                  <React.Fragment key={asistencia.id_materia}>
                    
                    {/* FILA PRINCIPAL */}
                    <tr 
                      onClick={() => toggleExpandir(asistencia.id_materia)}
                      className={`group cursor-pointer transition-colors border-b border-gray-200 
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} 
                        hover:bg-blue-50`}
                    >
                      <td className="py-5 px-6 text-gray-800 font-bold text-xs sm:text-sm flex items-center gap-2">
                        <span className={`text-gray-400 transition-transform duration-200 flex items-center justify-center ${materiaExpandida === asistencia.id_materia ? 'rotate-90' : ''}`}>
                          <MdChevronRight className="text-xl" />
                        </span>
                        {asistencia.nombre_materia}
                      </td>
                      <td className="py-5 px-6 text-gray-600 text-xs sm:text-sm font-medium">{asistencia.docente}</td>
                      <td className="py-5 px-6 text-gray-800 font-bold text-xs sm:text-sm text-center">{asistencia.clases_totales}</td>
                      <td className="py-5 px-6 text-gray-800 font-bold text-xs sm:text-sm text-center">{asistencia.fallas_acumuladas}</td>
                      <td className="py-5 px-6 text-gray-800 font-bold text-xs sm:text-sm text-center">{asistencia.porcentaje.toFixed(1)}%</td>
                      <td className="py-5 px-6 text-center">{renderEstadoPill(asistencia.porcentaje)}</td>
                    </tr>

                    {/* FILA DE DETALLES */}
                    {materiaExpandida === asistencia.id_materia && (
                      <tr className="bg-blue-50/50 border-b border-gray-200">
                        <td colSpan="6" className="p-0">
                          <div className="py-6 px-10 border-l-[6px] border-modulo-asistencia ml-6">
                            
                            <h4 className="text-modulo-asistencia font-bold mb-4">Historial Completo de Asistencia</h4>
                            
                            {asistencia.detalle_faltas.length === 0 ? (
                              <div className="text-gray-500 italic p-4 text-sm">
                                El docente aún no ha registrado asistencias en esta materia.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {asistencia.detalle_faltas.map((falta) => (
                                  <div key={falta.id_falta} className="bg-white border border-gray-300 p-3 rounded-lg shadow-sm flex items-center gap-3">
                                    
                                    <div className={`p-2 rounded-full ${
                                      falta.estado === 'Ausente' ? 'bg-red-100 text-red-600' : 
                                      falta.estado === 'Llegada Tarde' ? 'bg-yellow-100 text-yellow-600' : 
                                      'bg-green-100 text-green-600'
                                    }`}>
                                      {falta.estado === 'Ausente' && (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                      )}
                                      {falta.estado === 'Llegada Tarde' && (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                      )}
                                      {(falta.estado === 'Presente' || falta.estado === 'Excusa') && (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                      )}
                                    </div>
                                    
                                    <div>
                                      <p className="text-gray-800 font-bold text-sm">{falta.fecha}</p>
                                      <p className="text-gray-500 text-xs font-medium uppercase">Estado: {falta.estado}</p>
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
                ))
              )}
            </tbody>
            
          </table>
        </div>
      </div>

    </div>
  );
}