import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { obtenerEstadoMatricula, enviarMatriculaBD, obtenerFechaLimiteMatricula } from "../../api/perfilApi"; // 👇 AÑADIDA IMPORTACIÓN

const TODOS_LOS_CURSOS = [
  { id: 1, nombre: "1-1" }, { id: 2, nombre: "1-2" },
  { id: 3, nombre: "2-1" }, { id: 4, nombre: "2-2" },
  { id: 5, nombre: "3-1" }, { id: 6, nombre: "3-2" },
  { id: 7, nombre: "4-1" }, { id: 8, nombre: "4-2" },
  { id: 9, nombre: "5-1" }, { id: 10, nombre: "5-2" },
  { id: 11, nombre: "6-1" }, { id: 12, nombre: "6-2" },
  { id: 13, nombre: "7-1" }, { id: 14, nombre: "7-2" },
  { id: 15, nombre: "8-1" }, { id: 16, nombre: "8-2" },
  { id: 17, nombre: "9-1" }, { id: 18, nombre: "9-2" },
  { id: 19, nombre: "10-1" }, { id: 20, nombre: "10-2" },
  { id: 21, nombre: "11-1" }, { id: 22, nombre: "11-2" }
];

export default function MatriculaVista() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hijos = [] } = location.state || {};

  const [estudianteId, setEstudianteId] = useState("");
  const [loadingEstado, setLoadingEstado] = useState(false);
  const [estadoActual, setEstadoActual] = useState(null);

  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [anioLectivo, setAnioLectivo] = useState("2026");
  const [enviando, setEnviando] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);

  // 👇 EVALUACIÓN DE CIERRE BASADA EN LA BD
  const [fechaLimiteString, setFechaLimiteString] = useState("");
  const [isMatriculaAbierta, setIsMatriculaAbierta] = useState(true); // Abierto por defecto hasta verificar

  const estudianteSeleccionado = hijos.find(h => h.id === Number(estudianteId));

  useEffect(() => {
    // Al cargar la vista, primero consultamos la base de datos
    const verificarFecha = async () => {
      const limiteBD = await obtenerFechaLimiteMatricula();
      const fechaLimite = new Date(limiteBD);
      setFechaLimiteString(fechaLimite.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }));
      setIsMatriculaAbierta(new Date() <= fechaLimite);
    };
    verificarFecha();
  }, []);

  useEffect(() => {
    if (estudianteId) {
      const cargarEstado = async () => {
        setLoadingEstado(true);
        setMostrarQR(false);
        try {
          const res = await obtenerEstadoMatricula(estudianteId);
          setEstadoActual(res);
          if (res && res.id_curso && !res.promovido) {
            setCursoSeleccionado(res.id_curso);
          } else {
            setCursoSeleccionado("");
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
      setCursoSeleccionado("");
      setMostrarQR(false);
    }
  }, [estudianteId]);

  const handleProcesarMatricula = async (e) => {
    e.preventDefault();
    if (!estudianteId) return alert("Selecciona un estudiante");
    if (!cursoSeleccionado) return alert("Por favor selecciona el curso al que deseas matricularlo.");

    setEnviando(true);
    try {
      await enviarMatriculaBD({
        id_estudiante: Number(estudianteId),
        anio_lectivo: anioLectivo,
        id_curso: Number(cursoSeleccionado),
        documentos_url: "",
        firma_digital_hash: ""
      });
      setMostrarQR(true);
    } catch (error) {
      console.error("Error al enviar matrícula:", error);
      alert("Ocurrió un error al intentar enviar la matrícula.");
    } finally {
      setEnviando(false);
    }
  };

  const cursosFiltrados = TODOS_LOS_CURSOS.filter(curso => {
    if (!estadoActual || !estadoActual.grado_habilitado) return true;
    const gradoDelCurso = curso.nombre.split('-')[0];
    return gradoDelCurso === String(estadoActual.grado_habilitado);
  });

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8">
      {/* BLOQUE DE CIERRE TOTAL */}
      {!isMatriculaAbierta ? (
        <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200 shadow-md">
          <h2 className="text-3xl font-bold text-red-700 mb-4">Matrículas Cerradas</h2>
          <p className="text-gray-700 text-lg mb-6">El plazo para realizar la matrícula en línea finalizó el {fechaLimiteString}. Por favor, acérquese a la secretaría institucional.</p>
          <button onClick={() => navigate("/acudiente")} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition">
            Volver al Menú
          </button>
        </div>
      ) : (
        <>
          {mostrarQR ? (
            <div className="text-center p-8 bg-green-50 rounded-xl border border-green-200 shadow-md">
              <h2 className="text-3xl font-bold text-green-700 mb-4">¡Matrícula Radicada!</h2>
              <p className="text-gray-700 text-lg mb-4">
                La matrícula de <strong>{estudianteSeleccionado?.nombre}</strong> ha quedado en estado <span className="font-bold text-yellow-600">Pendiente</span>.
              </p>
              <p className="text-gray-700 mb-6">
                Para finalizar el proceso y cambiar el estado a <strong>Matriculado</strong>, realice el pago escaneando este código QR:
              </p>
              
              <div className="flex justify-center mb-6">
                <img 
                  src="/qr.pago.png" 
                  alt="Código QR de Pago" 
                  className="w-64 h-64 object-cover border-4 border-white shadow-lg rounded-xl"
                />
              </div>

              <p className="text-sm text-gray-500 mb-8">
                Una vez se verifique el pago, el estado se actualizará en el sistema.
              </p>

              <button 
                onClick={() => navigate("/acudiente")}
                className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition"
              >
                Volver al Menú
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              
              {/* AVISO INFORMATIVO DE PLAZO MÁXIMO VINCULADO A LA BD */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 mb-6 rounded-lg shadow-sm">
                  <p className="font-bold">⚠️ Atención: Plazo de Matrículas</p>
                  <p className="text-sm">El proceso de matrícula en línea estará habilitado únicamente hasta el <strong>{fechaLimiteString}</strong>.</p>
              </div>

              <h2 className="text-2xl font-bold mb-6 text-gray-800">Renovación de Matrícula</h2>
              
              <form onSubmit={handleProcesarMatricula}>
                <div className="mb-6">
                  <label className="block font-semibold mb-2">Seleccione el Estudiante</label>
                  <select 
                    value={estudianteId} 
                    onChange={(e) => setEstudianteId(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Seleccionar Hijo --</option>
                    {hijos.map(h => (
                      <option key={h.id} value={h.id}>{h.nombre}</option>
                    ))}
                  </select>
                </div>

                {loadingEstado && <p className="text-blue-500 mb-4 font-medium">Cargando estado...</p>}

                {estadoActual && !loadingEstado && (
                  <>
                    <div className="mb-6 bg-gray-50 p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-bold text-gray-700 mb-2">Estado Actual de la Matrícula</h3>
                      <p>
                        <span className="font-semibold text-gray-600">Estado: </span>
                        <span className={`px-2 py-1 rounded text-white text-sm ${
                          estadoActual.estado === 'Matriculado' ? 'bg-green-500' : 
                          estadoActual.estado === 'Pendiente' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                          {estadoActual.estado || "No Iniciado"}
                        </span>
                      </p>
                    </div>

                    <div className="mb-6 p-5 rounded-lg border border-gray-200 shadow-sm">
                      <h4 className="font-bold text-lg mb-3">Evaluación Académica</h4>
                      
                      {estadoActual.promovido ? (
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
                          <p className="font-semibold">¡Aprobado! El estudiante avanzará al grado {estadoActual.grado_habilitado}.</p>
                        </div>
                      ) : (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                          <p className="font-semibold">Reprobado. El estudiante perdió {estadoActual.materias_perdidas} materia(s).</p>
                          <p className="text-sm">Debe repetir el grado {estadoActual.grado_habilitado}.</p>
                        </div>
                      )}

                      <label className="block font-semibold mb-2 mt-4">Asignar al Curso:</label>
                      <select 
                        value={cursoSeleccionado}
                        onChange={(e) => setCursoSeleccionado(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">-- Seleccione un curso disponible --</option>
                        {cursosFiltrados.map(curso => (
                          <option key={curso.id} value={curso.id}>Curso {curso.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <button 
                  type="submit" 
                  disabled={!estudianteId || enviando}
                  className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {enviando ? "Procesando..." : "Enviar Matrícula"}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}