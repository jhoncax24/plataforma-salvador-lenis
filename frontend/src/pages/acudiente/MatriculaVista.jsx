import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// 👇 AHORA SÍ importamos las funciones que creamos en perfilApi.js
import { obtenerEstadoMatricula, enviarMatriculaBD } from "../../api/perfilApi";

export default function MatriculaVista() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hijos = [] } = location.state || {};

  const [estudianteId, setEstudianteId] = useState("");
  const [loadingEstado, setLoadingEstado] = useState(false);
  const [estadoActual, setEstadoActual] = useState(null);

  const [documentosUrl, setDocumentosUrl] = useState("");
  const [firmaHash, setFirmaHash] = useState("");
  const [anioLectivo, setAnioLectivo] = useState("2026");
  const [enviando, setEnviando] = useState(false);

  const estudianteSeleccionado = hijos.find(h => h.id === Number(estudianteId));

  // 👇 Efecto REAL: Ahora sí va al backend a preguntar cómo está la matrícula
  useEffect(() => {
    if (estudianteId) {
      const cargarEstado = async () => {
        setLoadingEstado(true);
        try {
          const res = await obtenerEstadoMatricula(estudianteId);
          setEstadoActual(res);
          
          // Si ya hay un proceso, precargamos los datos para que el usuario los vea
          if (res && res.id_matricula) {
            setDocumentosUrl(res.documentos_url || "");
            setFirmaHash(res.firma_digital_hash || "");
          } else {
            setDocumentosUrl("");
            setFirmaHash("");
          }
        } catch (error) {
          console.error("Error al cargar estado de matrícula:", error);
        } finally {
          setLoadingEstado(false);
        }
      };
      cargarEstado();
    } else {
      setEstadoActual(null);
      setDocumentosUrl("");
      setFirmaHash("");
    }
  }, [estudianteId]);

  const handleProcesarMatricula = async () => {
    if (!estudianteId) return alert("Selecciona un estudiante");
    if (!documentosUrl.trim()) return alert("Por favor ingresa la URL con los documentos adjuntos (Cédula, Registro Civil, etc.)");
    if (!firmaHash.trim()) return alert("Por favor escribe tu identificación en el campo de firma como aceptación legal.");

    setEnviando(true);
    try {
      // 👇 ENVÍO REAL: Ahora sí manda la orden a la base de datos PostgreSQL
      await enviarMatriculaBD({
        id_estudiante: Number(estudianteId),
        documentos_url: documentosUrl,
        firma_digital_hash: firmaHash,
        anio_lectivo: anioLectivo,
        id_curso: estudianteSeleccionado?.degreeId || estudianteSeleccionado?.id_curso || 1
      });
      
      alert("¡El formulario de matrícula ha sido enviado a revisión exitosamente!");
      navigate("/acudiente");
    } catch (error) {
      alert("Ocurrió un error al procesar el trámite.");
      console.error(error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 sm:p-4 lg:p-6 flex flex-col items-center">
      <div className="bg-white border-0 sm:border-2 sm:border-gray-200 rounded-none sm:rounded-xl shadow-none sm:shadow-md p-4 sm:p-6 md:p-8 w-full max-w-[1800px] flex-1 sm:flex-none">
        
        {/* Banner Informativo */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 bg-blue-50 p-4 rounded-lg border-l-4 border-[#0033a0] shadow-sm gap-4">
          <div className="flex-1 text-left px-2">
            <p className="text-[#0033a0] text-sm md:text-base leading-relaxed">
              <span className="font-extrabold text-lg mr-2 block sm:inline mb-1 sm:mb-0">💡 Proceso Legal:</span>
              Adjunta las carpetas de requisitos en formato digital. Al rellenar la firma digital, das consentimiento del proceso de matrícula institucional.
            </p>
          </div>
          <button onClick={() => navigate(-1)} className="w-full md:w-auto bg-[#0033a0] text-white px-6 py-3 md:py-2 rounded-lg font-bold hover:bg-blue-800 transition-all shadow text-center">
            Volver al Menú
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0033a0]">Matrícula en Línea</h2>
          <p className="text-sm sm:text-base text-gray-500 font-medium mt-1">Realiza la vinculación oficial para el siguiente ciclo escolar</p>
        </div>

        {/* Formulario Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          
          {/* Columna Izquierda: Selección */}
          <div className="space-y-4 bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 w-full">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Seleccionar Estudiante a Matricular:</label>
              <select 
                value={estudianteId} 
                onChange={e => setEstudianteId(e.target.value)}
                className="w-full border sm:border-2 border-gray-300 sm:border-gray-200 rounded-lg p-3 bg-white font-medium text-gray-700 focus:outline-none focus:border-[#0033a0]"
              >
                <option value="">-- Selecciona un estudiante --</option>
                {hijos.map(h => <option key={h.id} value={h.id}>{h.nombre} - {h.grado}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Año Lectivo:</label>
                <input type="text" value={anioLectivo} disabled className="w-full border sm:border-2 border-gray-300 sm:border-gray-200 bg-gray-100 rounded-lg p-3 font-bold text-[#0033a0]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Estado del Trámite:</label>
                <div className="pt-2">
                  {loadingEstado ? (
                    <span className="text-gray-400 text-sm font-medium">Consultando...</span>
                  ) : !estudianteId ? (
                    <span className="text-gray-400 font-bold text-sm">—</span>
                  ) : (
                    <span className={`px-4 py-1.5 rounded-full font-black text-xs uppercase border inline-block ${
                      !estadoActual?.id_matricula ? 'bg-gray-100 text-gray-600 border-gray-300' :
                      estadoActual.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                      estadoActual.estado === 'Aprobado' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'
                    }`}>
                      {estadoActual?.estado || "No Iniciado"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Carga de Requisitos */}
          {estudianteId && (
            <div className="space-y-4 bg-white border border-gray-200 p-4 sm:p-6 rounded-xl shadow-sm w-full">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Enlace de Documentación (Drive/Cloud):</label>
                <input 
                  type="text" 
                  value={documentosUrl}
                  onChange={e => setDocumentosUrl(e.target.value)}
                  disabled={estadoActual?.estado === "Aprobado"}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full border sm:border-2 border-gray-300 sm:border-gray-200 rounded-lg p-3 focus:outline-none focus:border-[#0033a0] text-gray-700 font-medium"
                />
                <p className="text-gray-400 text-xs mt-2 leading-relaxed">Sube en una sola carpeta PDF: Registro civil, foto del alumno, carnet de vacunas y documento del acudiente.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Firma Digital (Documento de Identidad):</label>
                <input 
                  type="text" 
                  value={firmaHash}
                  onChange={e => setFirmaHash(e.target.value)}
                  disabled={estadoActual?.estado === "Aprobado"}
                  placeholder="Tu ID equivale a tu firma"
                  className="w-full border sm:border-2 border-gray-300 sm:border-gray-200 rounded-lg p-3 focus:outline-none focus:border-[#0033a0] text-gray-700 font-medium"
                />
              </div>

              {estadoActual?.estado !== "Aprobado" ? (
                <button
                  onClick={handleProcesarMatricula}
                  disabled={enviando}
                  className="w-full bg-[#0033a0] text-white py-3.5 sm:py-3 rounded-lg font-bold hover:bg-blue-800 transition-all shadow-md mt-4 text-sm sm:text-base"
                >
                  {enviando ? "Guardando Trámite..." : "Radicar Formulario de Matrícula"}
                </button>
              ) : (
                <div className="bg-green-50 text-green-800 p-4 rounded-lg border border-green-300 font-bold text-center text-sm leading-relaxed mt-4">
                  🔒 Este proceso de matrícula escolar ya fue aprobado y cerrado para el año lectivo actual.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}