import React, { useState, useEffect } from 'react';
import { getMatriculasPendientes, aprobarMatriculaAdmin, rechazarMatriculaAdmin } from '../../api/perfilApi';

export default function MatriculasPendientes() {
  const [matriculas, setMatriculas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Modal de Validación
  const [selectedMatricula, setSelectedMatricula] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Estados para el flujo de rechazo
  const [showRechazoInput, setShowRechazoInput] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  useEffect(() => {
    cargarMatriculas();
  }, []);

  const cargarMatriculas = async () => {
    setLoading(true);
    try {
      const data = await getMatriculasPendientes();
      setMatriculas(data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando matrículas:", error);
      setLoading(false);
    }
  };

  const abrirValidacion = (matricula) => {
    setSelectedMatricula(matricula);
    setShowRechazoInput(false);
    setMotivoRechazo('');
    setIsModalOpen(true);
  };

  const handleAprobar = async () => {
    setIsActionLoading(true);
    try {
      await aprobarMatriculaAdmin(selectedMatricula.id_matricula);
      
      alert(`Matrícula aprobada exitosamente. Se ha enviado el certificado digital al acudiente.`);
      // Como fue aprobada y activada, la removemos de la tabla de pendientes/auditoría
      setMatriculas(matriculas.filter(m => m.id_matricula !== selectedMatricula.id_matricula));
      setIsModalOpen(false);
    } catch (error) {
      alert('Error al aprobar la matrícula.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) {
      alert('Debes ingresar un motivo para devolver la matrícula.');
      return;
    }
    
    setIsActionLoading(true);
    try {
      await rechazarMatriculaAdmin(selectedMatricula.id_matricula, motivoRechazo);
      
      alert('Matrícula devuelta. Se ha notificado al acudiente con el motivo registrado.');
      // Volvemos a cargar las matrículas para que se refleje el estado 'Rechazada' en la tabla
      await cargarMatriculas();
      setIsModalOpen(false);
    } catch (error) {
      alert('Error al rechazar la matrícula.');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* HEADER DE LA TABLA */}
      <div className="bg-[#0033a0] p-5 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Auditoría y Validación de Matrículas
        </h2>
        <span className="bg-white text-[#0033a0] text-xs font-bold px-3 py-1 rounded-full">
          {matriculas.length} En Revisión
        </span>
      </div>

      {/* CUERPO DE LA TABLA */}
      <div className="p-0 overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-gray-500 font-bold animate-pulse">
            Cargando solicitudes de matrícula...
          </div>
        ) : matriculas.length === 0 ? (
          <div className="p-10 text-center text-gray-500 font-bold">
            No hay matrículas pendientes o devueltas en este momento. ¡Todo al día!
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-bold text-xs sm:text-sm">Estado</th>
                <th className="p-4 font-bold text-xs sm:text-sm">Estudiante</th>
                <th className="p-4 font-bold text-xs sm:text-sm">Curso a Matricular</th>
                <th className="p-4 font-bold text-xs sm:text-sm">Acudiente</th>
                <th className="p-4 font-bold text-center text-xs sm:text-sm">Fecha Solicitud</th>
                <th className="p-4 font-bold text-center text-xs sm:text-sm">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {matriculas.map((mat) => {
                const esRechazada = mat.estado === 'Rechazada' || mat.estado === 'Devuelta';

                return (
                  <tr key={mat.id_matricula} className="hover:bg-blue-50 transition-colors">
                    {/* COLUMNA DE ESTADO BADGE */}
                    <td className="p-4">
                      {esRechazada ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-700 border border-red-200">
                          <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          Devuelta
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                          <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          Pendiente
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-xs sm:text-sm">
                      <p className="font-bold text-gray-800">{mat.estudiante}</p>
                      <p className="text-xs text-gray-500">Doc: {mat.documento}</p>
                    </td>
                    <td className="p-4 text-xs sm:text-sm">
                      <span className="font-semibold text-[#0033a0] bg-blue-100 px-2.5 py-1 rounded text-sm">
                        {mat.curso_destino}
                      </span>
                    </td>
                    <td className="p-4 text-xs sm:text-sm">
                      <p className="font-medium text-gray-700">{mat.acudiente}</p>
                      <p className="text-xs text-gray-500">Tel: {mat.telefono_acudiente}</p>
                    </td>
                    <td className="p-4 text-center text-sm font-medium text-gray-600 text-xs sm:text-sm">
                      {mat.fecha_solicitud}
                    </td>
                    <td className="p-4 text-center text-xs sm:text-sm">
                      <button 
                        onClick={() => abrirValidacion(mat)}
                        className={`text-sm font-bold text-white px-4 py-2 rounded-lg shadow-sm transition-all ${
                          esRechazada 
                            ? 'bg-amber-600 hover:bg-amber-700' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {esRechazada ? 'Revisar' : 'Validar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ========================================== */}
      {/* MODAL GIGANTE DE VALIDACIÓN                */}
      {/* ========================================== */}
      {isModalOpen && selectedMatricula && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="bg-white rounded-xl shadow-2xl w-full h-full sm:w-auto sm:h-auto sm:max-w-5xl sm:max-h-[95vh] overflow-y-auto flex flex-col">
            
            {/* Header del Modal */}
            <div className="bg-[#0033a0] p-5 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Auditoría y Aprobación de Matrícula
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-gray-300 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Cuerpo del Modal con Scroll */}
            <div className="p-6 overflow-y-auto bg-gray-50">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* TARJETA DATOS PERSONALES */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-400 uppercase mb-4 border-b pb-2">Datos de Solicitud</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Estudiante</p>
                        <p className="font-bold text-lg text-gray-800">{selectedMatricula.estudiante}</p>
                        <p className="text-sm text-gray-600">Documento: {selectedMatricula.documento}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Grado a Cursar</p>
                        <span className="inline-block mt-1 font-bold text-white bg-[#0033a0] px-3 py-1 rounded">
                          {selectedMatricula.curso_destino}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500 font-bold uppercase">Acudiente Responsable</p>
                        <p className="font-semibold text-gray-700">{selectedMatricula.acudiente}</p>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN BOTÓN DE COMPROBANTE DE PAGO */}
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-2">Comprobante de Pago</p>
                    {selectedMatricula.comprobante_pago || selectedMatricula.documentos_url ? (
                      <a 
                        href={selectedMatricula.comprobante_pago || selectedMatricula.documentos_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center justify-center w-full gap-2 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 py-2.5 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        Ver Comprobante Adjunto
                      </a>
                    ) : (
                      <div className="bg-red-50 text-red-600 text-sm font-semibold p-2.5 rounded-lg border border-red-100 text-center flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        No se ha adjuntado comprobante
                      </div>
                    )}
                  </div>
                </div>

                {/* TARJETA DE RENDIMIENTO (Notas y Asistencia) */}
                <div className="space-y-4">
                  {/* Académico */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-extrabold text-gray-400 uppercase mb-1">Rendimiento Académico Previo</h3>
                      <p className="font-bold text-gray-800">Promedio general: {selectedMatricula.academico?.promedio || "N/A"}</p>
                      <p className="text-sm text-red-500 font-semibold">{selectedMatricula.academico?.materias_perdidas || 0} Materias perdidas</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${selectedMatricula.academico?.estado === 'Aprobado' ? 'bg-green-500' : 'bg-orange-500'}`}>
                      {selectedMatricula.academico?.estado === 'Aprobado' ? 'A' : 'C'}
                    </div>
                  </div>

                  {/* Asistencia y Observador */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-extrabold text-gray-400 uppercase mb-3">Comportamiento y Asistencia</h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-red-50 rounded p-2 border border-red-100">
                        <p className="text-2xl font-black text-red-600">{selectedMatricula.disciplina?.total_inasistencias || 0}</p>
                        <p className="text-xs font-bold text-red-800 uppercase">Inasistencias</p>
                      </div>
                      <div className="bg-orange-50 rounded p-2 border border-orange-100">
                        <p className="text-2xl font-black text-orange-600">{selectedMatricula.disciplina?.anotaciones_observador || 0}</p>
                        <p className="text-xs font-bold text-orange-800 uppercase">Anotaciones</p>
                      </div>
                    </div>
                    {selectedMatricula.disciplina?.anotaciones_observador > 0 && (
                      <div className="mt-3 text-xs text-gray-600 bg-gray-100 p-2 rounded italic">
                        <strong>Última anotación:</strong> "{selectedMatricula.disciplina.ultima_anotacion}"
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECCIÓN DE RECHAZO (Condicional) */}
              {showRechazoInput && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4 animate-fade-in-up">
                  <label className="block text-sm font-bold text-red-800 mb-2">Motivo de la devolución / rechazo:</label>
                  <textarea 
                    className="w-full border border-red-300 rounded-lg p-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
                    rows="3"
                    placeholder="Ej: Falta adjuntar el recibo de pago, o la imagen del comprobante no es legible..."
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                  ></textarea>
                </div>
              )}

            </div>

            {/* Footer del Modal (Botones) */}
            <div className="bg-white p-5 flex justify-between items-center border-t border-gray-200 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isActionLoading}
                className="px-5 py-2.5 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>

              <div className="flex gap-3">
                {showRechazoInput ? (
                  <>
                    <button 
                      onClick={() => setShowRechazoInput(false)}
                      disabled={isActionLoading}
                      className="px-4 py-2.5 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Cancelar Rechazo
                    </button>
                    <button 
                      onClick={handleRechazar}
                      disabled={isActionLoading}
                      className="px-5 py-2.5 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      {isActionLoading ? 'Procesando...' : 'Confirmar Devolución'}
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setShowRechazoInput(true)}
                      className="px-5 py-2.5 rounded-lg font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                    >
                      Devolver / Rechazar
                    </button>
                    <button 
                      onClick={handleAprobar}
                      disabled={isActionLoading}
                      className="px-6 py-2.5 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 shadow-md transition-colors flex items-center gap-2"
                    >
                      {isActionLoading ? 'Firmando...' : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                          Aprobar y Firmar
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}