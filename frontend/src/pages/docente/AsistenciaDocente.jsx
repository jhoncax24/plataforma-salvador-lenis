import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  obtenerAsignaciones, 
  obtenerEstudiantesCurso, 
  guardarAsistencia,
  obtenerAsistenciaPorFecha,
  obtenerResumenAsistencia
} from "../../api/perfilApi";

export default function AsistenciaDocente() {
  const navigate = useNavigate();
  
  const userStr = localStorage.getItem("cesl_user") || localStorage.getItem("usuario");
  const user = userStr ? JSON.parse(userStr) : null;
  const idUsuario = user?.id_usuario || user?.id;

  const hoy = new Date().toISOString().split('T')[0];

  const [cursos, setCursos] = useState([]);
  const [materias, setMaterias] = useState([]); // 👈 NUEVO: Guardamos las materias
  
  // 👈 NUEVO: Añadimos id_materia al estado inicial
  const [seleccion, setSeleccion] = useState({ id_curso: "", id_materia: "", fecha: hoy });
  
  const [alumnos, setAlumnos] = useState([]);
  const [cargandoDia, setCargandoDia] = useState(false);
  const [listaCargada, setListaCargada] = useState(false);

  const [resumen, setResumen] = useState([]);
  const [cargandoResumen, setCargandoResumen] = useState(false);

  useEffect(() => {
    if (idUsuario) cargarAsignaciones();
  }, [idUsuario]);

  const cargarAsignaciones = async () => {
    const data = await obtenerAsignaciones(idUsuario);
    setCursos(data.cursos || []);
    setMaterias(data.materias || []); // 👈 NUEVO: Cargamos las materias del profe
  };

  const handleCargarListas = async (e) => {
    e?.preventDefault();
    if (!seleccion.id_curso || !seleccion.id_materia || !seleccion.fecha) {
      return alert("Por favor selecciona un curso, una materia y una fecha.");
    }

    setCargandoDia(true);
    setCargandoResumen(true);
    
    // 👈 NUEVO: Le pasamos también el id_materia a la búsqueda
    const [listaEstudiantes, asistenciaGuardada] = await Promise.all([
      obtenerEstudiantesCurso(seleccion.id_curso),
      obtenerAsistenciaPorFecha(seleccion.id_curso, seleccion.id_materia, seleccion.fecha)
    ]);

    const alumnosConEstado = listaEstudiantes.map(est => {
      const registro = asistenciaGuardada.find(a => a.id_estudiante === est.id_estudiante);
      return { ...est, estado: registro ? registro.estado : "" };
    });

    setAlumnos(alumnosConEstado);
    setListaCargada(true);
    setCargandoDia(false);

    cargarResumenHistorico(seleccion.id_curso, seleccion.id_materia);
  };

  const cargarResumenHistorico = async (idCurso, idMateria) => {
    const dataResumen = await obtenerResumenAsistencia(idCurso, idMateria);
    setResumen(dataResumen);
    setCargandoResumen(false);
  };

  const cambiarEstado = (idEstudiante, nuevoEstado) => {
    setAlumnos(alumnos.map(est => 
      est.id_estudiante === idEstudiante ? { ...est, estado: nuevoEstado } : est
    ));
  };

  const handleGuardarAsistencia = async () => {
    const faltanPorLlamar = alumnos.filter(a => a.estado === "");
    if (faltanPorLlamar.length > 0) {
      return alert(`¡Espera! Te falta marcar la asistencia de ${faltanPorLlamar.length} estudiante(s).`);
    }

    try {
      const payload = {
        id_curso: seleccion.id_curso,
        id_materia: seleccion.id_materia, // 👈 NUEVO: Enviamos la materia a guardar
        fecha: seleccion.fecha,
        asistenciasArray: alumnos.map(a => ({ id_estudiante: a.id_estudiante, estado: a.estado }))
      };

      await guardarAsistencia(idUsuario, payload);
      alert("¡Asistencia guardada exitosamente!");
      
      cargarResumenHistorico(seleccion.id_curso, seleccion.id_materia);
      
    } catch (error) {
      alert("Hubo un error al guardar la asistencia.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6 animate-fade-in-up font-sans flex flex-col gap-6">
      
      <div className="w-full flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border-l-[6px] border-orange-500 shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 m-0 flex items-center gap-2">
            <span>✅</span> Control de Asistencia
          </h2>
          <p className="text-gray-500 m-0 mt-1 font-medium">Llamado a lista por materia</p>
        </div>
        <button onClick={() => navigate(-1)} className="mt-4 sm:mt-0 px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-lg transition-colors shadow">
          Volver al Inicio
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        {/* Cambiamos a md:grid-cols-4 para que quepan los 4 elementos */}
        <form onSubmit={handleCargarListas} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Curso a evaluar</label>
            <select required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none" value={seleccion.id_curso} onChange={(e) => setSeleccion({...seleccion, id_curso: e.target.value})}>
              <option value="">-- Seleccionar --</option>
              {cursos.map(c => <option key={c.id_curso} value={c.id_curso}>{c.nombre} {c.nivel ? `(${c.nivel})` : ''}</option>)}
            </select>
          </div>
          
          {/* 👈 NUEVO DESPLEGABLE: Materia */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Materia dictada</label>
            <select required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none" value={seleccion.id_materia} onChange={(e) => setSeleccion({...seleccion, id_materia: e.target.value})}>
              <option value="">-- Seleccionar --</option>
              {materias.map(m => <option key={m.id_materia} value={m.id_materia}>{m.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Fecha de Clase</label>
            <input type="date" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none cursor-pointer" value={seleccion.fecha} onChange={(e) => setSeleccion({...seleccion, fecha: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-lg hover:bg-orange-600 transition-colors h-11">
            Cargar Datos
          </button>
        </form>
      </div>

      {listaCargada && (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
            <div className="p-4 bg-orange-50 border-b border-orange-100 flex justify-between items-center">
              <h3 className="font-extrabold text-orange-800">Registro de la Fecha: {seleccion.fecha}</h3>
            </div>
            
            {cargandoDia ? (
              <p className="text-center font-bold text-gray-500 p-10">Cargando lista...</p>
            ) : alumnos.length === 0 ? (
              <p className="text-center font-medium text-gray-400 p-10">No hay estudiantes en este curso.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 text-xs uppercase">
                        <th className="p-3 font-bold border-b w-10 text-center">N°</th>
                        <th className="p-3 font-bold border-b">Estudiante</th>
                        <th className="p-3 font-bold border-b text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alumnos.map((est, index) => (
                        <tr key={est.id_estudiante} className={`border-b transition-colors ${est.estado === "" ? "bg-red-50/20" : "hover:bg-gray-50"}`}>
                          <td className="p-3 text-center text-xs font-bold text-gray-400">{index + 1}</td>
                          <td className="p-3 font-medium text-gray-800 text-sm">{est.nombre_completo}</td>
                          <td className="p-2">
                            <div className="flex justify-center gap-1.5 flex-wrap">
                              <button onClick={() => cambiarEstado(est.id_estudiante, "Presente")} className={`px-2 py-1 text-[11px] font-bold rounded border transition-all ${est.estado === "Presente" ? 'bg-green-100 border-green-500 text-green-700 shadow-sm' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>Presente</button>
                              <button onClick={() => cambiarEstado(est.id_estudiante, "Ausente")} className={`px-2 py-1 text-[11px] font-bold rounded border transition-all ${est.estado === "Ausente" ? 'bg-red-100 border-red-500 text-red-700 shadow-sm' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>Ausente</button>
                              <button onClick={() => cambiarEstado(est.id_estudiante, "Llegada Tarde")} className={`px-2 py-1 text-[11px] font-bold rounded border transition-all ${est.estado === "Llegada Tarde" ? 'bg-yellow-100 border-yellow-500 text-yellow-700 shadow-sm' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>Llegada Tarde</button>
                              <button onClick={() => cambiarEstado(est.id_estudiante, "Excusa")} className={`px-2 py-1 text-[11px] font-bold rounded border transition-all ${est.estado === "Excusa" ? 'bg-blue-100 border-blue-500 text-blue-700 shadow-sm' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>Excusa</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end">
                  <button onClick={handleGuardarAsistencia} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-md flex items-center gap-2 text-sm">
                    <span>💾</span> Guardar Lista
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
             <div className="p-4 bg-gray-100 border-b border-gray-200">
              <h3 className="font-extrabold text-gray-800 text-sm">Resumen Acumulado en esta Materia</h3>
            </div>
            
            {cargandoResumen ? (
              <p className="text-center font-bold text-gray-500 p-10 text-sm">Calculando...</p>
            ) : (
              <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr className="text-gray-600 text-[10px] uppercase">
                      <th className="p-3 font-bold border-b">Estudiante</th>
                      <th className="p-3 font-bold border-b text-center text-green-600" title="Presentes">P</th>
                      <th className="p-3 font-bold border-b text-center text-red-600" title="Ausencias">A</th>
                      <th className="p-3 font-bold border-b text-center text-yellow-600" title="Llegadas Tarde">T</th>
                      <th className="p-3 font-bold border-b text-center text-blue-600" title="Excusas">E</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumen.map(est => (
                      <tr key={est.id_estudiante} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-medium text-gray-700 text-xs">{est.nombre_completo}</td>
                        <td className="p-3 text-center font-bold text-green-600 text-xs bg-green-50/30">{est.total_presentes}</td>
                        <td className="p-3 text-center font-bold text-red-600 text-xs bg-red-50/30">{est.total_ausencias}</td>
                        <td className="p-3 text-center font-bold text-yellow-600 text-xs bg-yellow-50/30">{est.total_retardos}</td>
                        <td className="p-3 text-center font-bold text-blue-600 text-xs bg-blue-50/30">{est.total_excusas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}