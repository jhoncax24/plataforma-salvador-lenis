import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerResumenCursos } from '../../api/perfilApi';

export default function Opciones() {
  const navigate = useNavigate();
  const [resumen, setResumen] = useState([]);
  const [cargando, setCargando] = useState(true);

  const userStr = localStorage.getItem("cesl_user") || localStorage.getItem("usuario");
  const user = userStr ? JSON.parse(userStr) : null;
  const idUsuario = user?.id_usuario || user?.id;

  useEffect(() => {
    if (idUsuario) {
      cargarResumen();
    }
  }, [idUsuario]);

  const cargarResumen = async () => {
    const data = await obtenerResumenCursos(idUsuario);
    setResumen(data);
    setCargando(false);
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-full transition-all hover:shadow-md md:col-span-2">
      
      {/* TÍTULO PRINCIPAL */}
      <div className="mb-4">
        <h3 className="text-xl font-extrabold text-[#0033a0] border-b-2 border-gray-100 pb-3 flex items-center gap-2">
          <span>🏫</span> Panel de Gestión Académica
        </h3>
      </div>

      {/* SECCIÓN 1: MIS CLASES ASIGNADAS */}
      <div className="mb-2">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mis Clases Actuales</h4>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6 space-y-3 min-h-[120px] max-h-[200px]">
        {cargando ? (
          <div className="h-full flex items-center justify-center text-gray-400 font-medium">Cargando clases...</div>
        ) : resumen.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <span className="text-2xl mb-1">🤷‍♂️</span>
            <p className="text-sm font-medium">Aún no tienes asignación académica.</p>
          </div>
        ) : (
          resumen.map((clase, index) => (
            <div key={index} className="flex justify-between items-center bg-blue-50/60 p-3 rounded-lg border border-blue-100">
              <div>
                <h4 className="font-bold text-gray-800 text-sm">{clase.materia_nombre}</h4>
                <div className="text-xs text-[#0033a0] font-bold mt-0.5">
                  Curso: {clase.curso_nombre} {clase.nivel ? `(${clase.nivel})` : ''}
                </div>
              </div>
              <div className="text-right bg-white px-3 py-1 rounded-md border shadow-sm flex flex-col items-center">
                <span className="block font-extrabold text-lg text-[#0033a0] leading-none mb-0.5">
                  {clase.total_estudiantes}
                </span>
                <span className="text-[9px] text-gray-500 uppercase font-bold leading-none">Alumnos</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SECCIÓN 2: ACCIONES RÁPIDAS (MÓDULOS) */}
      <div className="mt-auto border-t-2 border-gray-100 pt-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Módulos de Gestión</h4>
        
        {/* Cambiamos a sm:grid-cols-3 para que quepan los 3 botones */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* BOTÓN: NOTAS */}
          <button onClick={() => navigate('/docente/notas')} className="group flex flex-col items-start text-left p-4 rounded-xl border border-gray-200 bg-white hover:border-[#0033a0] hover:bg-blue-50 transition-all shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl group-hover:scale-110 transition-transform">📊</span>
              <span className="font-extrabold text-gray-800 group-hover:text-[#0033a0]">Notas</span>
            </div>
            <p className="text-xs text-gray-500 font-medium line-clamp-2">Califica actividades y promedios.</p>
          </button>

          {/* BOTÓN: OBSERVADOR */}
          <button onClick={() => navigate('/docente/observador')} className="group flex flex-col items-start text-left p-4 rounded-xl border border-gray-200 bg-white hover:border-green-600 hover:bg-green-50 transition-all shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl group-hover:scale-110 transition-transform">📖</span>
              <span className="font-extrabold text-gray-800 group-hover:text-green-700">Observador</span>
            </div>
            <p className="text-xs text-gray-500 font-medium line-clamp-2">Anotaciones disciplinarias.</p>
          </button>

          {/* BOTÓN: ASISTENCIA (¡EL NUEVO!) */}
          <button onClick={() => navigate('/docente/asistencia')} className="group flex flex-col items-start text-left p-4 rounded-xl border border-gray-200 bg-white hover:border-orange-500 hover:bg-orange-50 transition-all shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl group-hover:scale-110 transition-transform">✅</span>
              <span className="font-extrabold text-gray-800 group-hover:text-orange-600">Asistencia</span>
            </div>
            <p className="text-xs text-gray-500 font-medium line-clamp-2">Llamado a lista diario.</p>
          </button>

        </div>
      </div>

    </div>
  );
}