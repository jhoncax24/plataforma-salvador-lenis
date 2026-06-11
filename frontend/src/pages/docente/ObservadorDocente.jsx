import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  obtenerAsignaciones, 
  obtenerEstudiantesCurso, 
  obtenerHistorialObservaciones, 
  guardarObservacion 
} from "../../api/perfilApi";

export default function ObservadorDocente() {
  const navigate = useNavigate();
  
  // Usuario logueado
  const userStr = localStorage.getItem("cesl_user") || localStorage.getItem("usuario");
  const user = userStr ? JSON.parse(userStr) : null;
  const idUsuario = user?.id_usuario || user?.id;

  // Estados de la lista izquierda
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(false);

  // Estados del panel derecho
  const [estudianteActivo, setEstudianteActivo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  
  // Estado del formulario
  const [nuevaObs, setNuevaObs] = useState({ tipo: "Llamado de atención", descripcion: "" });

  // 1. Cargar los cursos del docente al iniciar
  useEffect(() => {
    if (idUsuario) {
      cargarCursosDocente();
    }
  }, [idUsuario]);

  const cargarCursosDocente = async () => {
    const data = await obtenerAsignaciones(idUsuario);
    setCursos(data.cursos || []);
  };

  // 2. Buscar estudiantes cuando se selecciona un curso
  const handleCambioCurso = async (e) => {
    const idCurso = e.target.value;
    setCursoSeleccionado(idCurso);
    setEstudianteActivo(null); // Reseteamos la vista derecha
    
    if (!idCurso) {
      setEstudiantes([]);
      return;
    }

    setCargandoLista(true);
    const data = await obtenerEstudiantesCurso(idCurso);
    setEstudiantes(data);
    setCargandoLista(false);
  };

  // 3. Ver el historial al hacer clic en un estudiante
  const handleSeleccionarEstudiante = async (estudiante) => {
    setEstudianteActivo(estudiante);
    setCargandoHistorial(true);
    
    const data = await obtenerHistorialObservaciones(estudiante.id_estudiante);
    setHistorial(data);
    setCargandoHistorial(false);
  };

  // 4. Guardar la nueva observación
  const handleGuardarObservacion = async (e) => {
    e.preventDefault();
    if (!nuevaObs.descripcion.trim()) return alert("La descripción no puede estar vacía.");

    try {
      const payload = {
        id_estudiante: estudianteActivo.id_estudiante,
        id_curso: cursoSeleccionado,
        tipo: nuevaObs.tipo,
        descripcion: nuevaObs.descripcion
      };

      await guardarObservacion(idUsuario, payload);
      alert("Observación registrada con éxito.");
      
      // Limpiamos el formulario y recargamos el historial
      setNuevaObs({ tipo: "Llamado de atención", descripcion: "" });
      handleSeleccionarEstudiante(estudianteActivo);
      
    } catch (error) {
      alert("Error al guardar la observación.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6 animate-fade-in-up font-sans flex flex-col">
      
      {/* HEADER PRINCIPAL */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border-l-[6px] border-green-600 mb-6 shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 m-0 flex items-center gap-2">
            <span>📖</span> Observador del Estudiante
          </h2>
          <p className="text-gray-500 m-0 mt-1 font-medium">Gestión de convivencia y comportamiento</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 sm:mt-0 px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-lg transition-colors shadow"
        >
          Volver al Inicio
        </button>
      </div>

      {/* CONTENEDOR DIVIDIDO (SPLIT-SCREEN) */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* COLUMNA IZQUIERDA: LISTA DE ESTUDIANTES */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full lg:h-[calc(100vh-180px)]">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
            <label className="block text-sm font-bold text-gray-700 mb-2">Selecciona un Curso</label>
            <select 
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-600 outline-none font-medium"
              value={cursoSeleccionado}
              onChange={handleCambioCurso}
            >
              <option value="">-- Elige un curso --</option>
              {cursos.map(c => (
                <option key={c.id_curso} value={c.id_curso}>
                  {c.nombre} {c.nivel ? `(${c.nivel})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {cargandoLista ? (
              <p className="text-center text-gray-400 mt-10 font-bold">Cargando estudiantes...</p>
            ) : estudiantes.length === 0 ? (
              <p className="text-center text-gray-400 mt-10 text-sm">No hay estudiantes para mostrar.</p>
            ) : (
              <ul className="space-y-1">
                {estudiantes.map((est) => (
                  <li key={est.id_estudiante}>
                    <button
                      onClick={() => handleSeleccionarEstudiante(est)}
                      className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors border ${
                        estudianteActivo?.id_estudiante === est.id_estudiante 
                          ? 'bg-green-50 border-green-200 text-green-800 shadow-sm' 
                          : 'bg-white border-transparent text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {est.nombre_completo}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: HISTORIAL Y FORMULARIO */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full lg:h-[calc(100vh-180px)]">
          
          {!estudianteActivo ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center opacity-70">
              <span className="text-6xl mb-4">👈</span>
              <h3 className="text-xl font-bold text-gray-600">Selecciona un estudiante</h3>
              <p className="max-w-xs mt-2">Haz clic en un estudiante de la lista izquierda para ver su historial y agregar nuevas observaciones.</p>
            </div>
          ) : (
            <>
              {/* CABECERA DEL ESTUDIANTE */}
              <div className="p-5 border-b border-gray-200 bg-green-50/30">
                <h3 className="text-2xl font-extrabold text-gray-800">{estudianteActivo.nombre_completo}</h3>
                <p className="text-sm text-gray-500 font-medium">Documento: {estudianteActivo.documento}</p>
              </div>

              {/* CONTENEDOR DEL HISTORIAL (SCROLLABLE) */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 custom-scrollbar">
                <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">Historial de Observaciones</h4>
                
                {cargandoHistorial ? (
                  <p className="text-gray-500 font-medium">Cargando historial...</p>
                ) : historial.length === 0 ? (
                  <div className="bg-white p-4 rounded-lg border border-dashed border-gray-300 text-center text-gray-500">
                    Este estudiante tiene un expediente limpio. ✨
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historial.map((obs) => {
                      // Asignar colores según el tipo de falta
                      let colorBorder = "border-blue-200";
                      let colorBg = "bg-blue-50";
                      let colorBadge = "bg-blue-100 text-blue-800";
                      
                      if (obs.tipo === "Falta Leve") { colorBorder = "border-yellow-300"; colorBg = "bg-yellow-50"; colorBadge = "bg-yellow-200 text-yellow-800"; }
                      if (obs.tipo === "Falta Grave") { colorBorder = "border-red-300"; colorBg = "bg-red-50"; colorBadge = "bg-red-100 text-red-800"; }
                      if (obs.tipo === "Felicitación") { colorBorder = "border-green-300"; colorBg = "bg-green-50"; colorBadge = "bg-green-100 text-green-800"; }

                      return (
                        <div key={obs.id_observacion} className={`p-4 rounded-lg border ${colorBorder} ${colorBg} shadow-sm`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${colorBadge}`}>
                              {obs.tipo}
                            </span>
                            <span className="text-xs font-bold text-gray-500">{obs.fecha_formato}</span>
                          </div>
                          <p className="text-gray-800 text-sm mt-2">{obs.descripcion}</p>
                          <p className="text-xs text-gray-500 mt-3 font-medium border-t border-black/5 pt-2">
                            Registrado por: {obs.nombre_docente}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* FORMULARIO INFERIOR (NUEVA OBSERVACIÓN) */}
              <div className="p-6 border-t border-gray-200 bg-white">
                <form onSubmit={handleGuardarObservacion}>
                  <h4 className="font-bold text-gray-800 mb-3">Nueva Anotación</h4>
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <select 
                      className="w-full sm:w-1/3 p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-600 outline-none font-medium text-sm"
                      value={nuevaObs.tipo}
                      onChange={(e) => setNuevaObs({...nuevaObs, tipo: e.target.value})}
                    >
                      <option value="Llamado de atención">Llamado de atención</option>
                      <option value="Falta Leve">Falta Leve</option>
                      <option value="Falta Grave">Falta Grave</option>
                      <option value="Felicitación">Felicitación</option>
                    </select>
                    
                    <input 
                      type="text" 
                      placeholder="Describe lo sucedido detalladamente..." 
                      className="w-full sm:w-2/3 p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-600 outline-none text-sm"
                      value={nuevaObs.descripcion}
                      onChange={(e) => setNuevaObs({...nuevaObs, descripcion: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow transition-colors flex items-center gap-2"
                    >
                      <span>💾</span> Guardar Observación
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}