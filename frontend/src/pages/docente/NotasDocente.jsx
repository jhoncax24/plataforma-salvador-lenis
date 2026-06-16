import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  obtenerAsignaciones, 
  obtenerPlanillaNotas, 
  crearActividadDocente, 
  guardarNotasMasivas 
} from "../../api/perfilApi";

export default function NotasDocente() {
  const navigate = useNavigate();
  
  // Usuario logueado
  const userStr = localStorage.getItem("cesl_user") || localStorage.getItem("usuario");
  const user = userStr ? JSON.parse(userStr) : null;
  const idUsuario = user?.id_usuario || user?.id;

  // Estados de filtros
  const [materias, setMaterias] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [seleccion, setSeleccion] = useState({
    id_curso: "", id_materia: "", periodo: "1"
  });

  // Estados de la Planilla
  const [actividades, setActividades] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [planillaCargada, setPlanillaCargada] = useState(false);

  // Estados del Modal (Crear Actividad)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevaAct, setNuevaAct] = useState({ titulo: "", porcentaje: "" });

  // 1. Cargar filtros iniciales
  useEffect(() => {
    if (idUsuario) cargarFiltros();
  }, [idUsuario]);

  const cargarFiltros = async () => {
    const data = await obtenerAsignaciones(idUsuario);
    setMaterias(data.materias || []);
    setCursos(data.cursos || []);
  };

  // 2. Buscar y armar la planilla
  const handleCargarPlanilla = async (e) => {
    e?.preventDefault();
    if (!seleccion.id_curso || !seleccion.id_materia) {
      return alert("Por favor selecciona una materia y un curso.");
    }

    setCargando(true);
    const data = await obtenerPlanillaNotas(seleccion.id_curso, seleccion.id_materia, seleccion.periodo);
    
    setActividades(data.actividades || []);
    setEstudiantes(data.planilla || []);
    setPlanillaCargada(true);
    setCargando(false);
  };

  // 3. Crear Nueva Actividad (% de la nota)
  const handleCrearActividad = async (e) => {
    e.preventDefault();
    const porcentajeNuevo = parseFloat(nuevaAct.porcentaje);
    
    // Validación matemática de porcentajes
    const porcentajeActual = actividades.reduce((sum, act) => sum + parseFloat(act.porcentaje), 0);
    if (porcentajeActual + porcentajeNuevo > 100) {
      return alert(`¡Error! El porcentaje supera el 100%. Solo queda un ${(100 - porcentajeActual).toFixed(1)}% disponible.`);
    }

    try {
      const payload = {
        id_curso: seleccion.id_curso,
        id_materia: seleccion.id_materia,
        periodo: seleccion.periodo,
        titulo: nuevaAct.titulo,
        porcentaje: porcentajeNuevo
      };
      
      await crearActividadDocente(idUsuario, payload);
      alert("Actividad creada. ¡La columna se ha añadido a la planilla!");
      
      setModalAbierto(false);
      setNuevaAct({ titulo: "", porcentaje: "" });
      
      // Recargamos la planilla para ver la nueva columna
      handleCargarPlanilla();
    } catch (error) {
      alert("Hubo un error al crear la actividad.");
    }
  };

  // 4. Manejar el cambio de una celda específica
  const handleChangeNota = (idEstudiante, idActividad, valorStr) => {
    // Aceptamos solo números y un punto decimal
    if (valorStr !== "" && !/^\d*\.?\d*$/.test(valorStr)) return;
    
    // Evitamos notas mayores a 5
    if (parseFloat(valorStr) > 5) return; 

    setEstudiantes(estudiantes.map(est => {
      if (est.id_estudiante === idEstudiante) {
        return {
          ...est,
          notas: { ...est.notas, [idActividad]: valorStr }
        };
      }
      return est;
    }));
  };

  // 5. Enviar todas las celdas llenas a la BD
  const handleGuardarNotas = async () => {
    // Extraemos de la matriz solo las notas que han sido digitadas
    const notasParaGuardar = [];
    estudiantes.forEach(est => {
      Object.keys(est.notas).forEach(idAct => {
        if (est.notas[idAct] !== "" && est.notas[idAct] !== null) {
          notasParaGuardar.push({
            id_actividad: parseInt(idAct),
            id_estudiante: est.id_estudiante,
            nota: est.notas[idAct]
          });
        }
      });
    });

    if (notasParaGuardar.length === 0) return alert("No hay notas nuevas para guardar.");

    try {
      await guardarNotasMasivas(notasParaGuardar);
      alert("¡Planilla guardada exitosamente!");
    } catch (error) {
      alert("Hubo un error al guardar la planilla.");
    }
  };

  // ==========================================
  // CÁLCULOS EN TIEMPO REAL
  // ==========================================
  const porcentajeTotal = actividades.reduce((sum, act) => sum + parseFloat(act.porcentaje), 0);
  const porcentajeRestante = 100 - porcentajeTotal;

  const calcularDefinitiva = (notasDelAlumno) => {
    let final = 0;
    actividades.forEach(act => {
      const notaIngresada = parseFloat(notasDelAlumno[act.id_actividad]);
      if (!isNaN(notaIngresada)) {
        final += notaIngresada * (parseFloat(act.porcentaje) / 100);
      }
    });
    return final.toFixed(1);
  };

  // Filtramos los cursos basados en la materia seleccionada
  const cursosFiltrados = seleccion.id_materia 
    ? cursos.filter(c => c.id_materia === parseInt(seleccion.id_materia)) 
    : [];

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6 animate-fade-in-up font-sans">
      
      {/* HEADER */}
      <div className="w-full flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border-l-[6px] border-[#0033a0] mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 m-0">Planilla de Calificaciones</h2>
          <p className="text-gray-500 mt-1 font-medium">Gestiona actividades y notas por periodo</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-[#0033a0] hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow"
        >
          Volver
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <form onSubmit={handleCargarPlanilla} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Materia</label>
            <select 
              required className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-[#0033a0] outline-none"
              value={seleccion.id_materia} 
              // 👇 AQUÍ AGREGAMOS id_curso: ""
              onChange={(e) => setSeleccion({...seleccion, id_materia: e.target.value, id_curso: ""})} 
            >
              <option value="">Seleccione...</option>
              {materias.map(m => <option key={m.id_materia} value={m.id_materia}>{m.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Curso</label>
            <select 
              required className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-[#0033a0] outline-none"
              value={seleccion.id_curso} onChange={(e) => setSeleccion({...seleccion, id_curso: e.target.value})}
            >
              <option value="">Seleccione...</option>
              {/* 👇 AQUÍ CAMBIAMOS 'cursos' POR 'cursosFiltrados' */}
              {cursosFiltrados.map(c => <option key={c.id_curso} value={c.id_curso}>{c.nombre} {c.nivel ? `(${c.nivel})` : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Periodo</label>
            <select 
              className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-[#0033a0] outline-none"
              value={seleccion.periodo} onChange={(e) => setSeleccion({...seleccion, periodo: e.target.value})}
            >
              <option value="1">Primer Periodo</option>
              <option value="2">Segundo Periodo</option>
              <option value="3">Tercer Periodo</option>
              <option value="4">Cuarto Periodo</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-[#0033a0] text-white font-bold py-2.5 rounded-lg hover:bg-blue-800 transition-colors h-11">
            Cargar Planilla
          </button>
        </form>
      </div>

      {/* ZONA DE LA PLANILLA */}
      {planillaCargada && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
          
          {/* BARRA DE HERRAMIENTAS DE LA PLANILLA */}
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <div>
              <span className="text-gray-600 font-bold mr-2">Progreso del Periodo:</span>
              <span className={`font-extrabold text-lg ${porcentajeTotal === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                {porcentajeTotal}% / 100%
              </span>
            </div>
            
            <button 
              onClick={() => setModalAbierto(true)}
              disabled={porcentajeTotal >= 100}
              className={`px-4 py-2 rounded-lg font-bold transition-all shadow-sm flex items-center gap-2
                ${porcentajeTotal >= 100 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
            >
              <span>+</span> Añadir Actividad
            </button>
          </div>

          {/* CUADRÍCULA ESTILO EXCEL */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="p-3 font-bold border-b border-r w-10 text-center">N°</th>
                  <th className="p-3 font-bold border-b border-r sticky left-0 bg-gray-100 z-10 w-64 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    Estudiante
                  </th>
                  
                  {/* COLUMNAS DINÁMICAS POR ACTIVIDAD */}
                  {actividades.map(act => (
                    <th key={act.id_actividad} className="p-2 font-bold border-b border-r text-center w-28 bg-blue-50/50">
                      <div className="text-xs text-gray-500 truncate" title={act.titulo}>{act.titulo}</div>
                      <div className="text-blue-700">{parseFloat(act.porcentaje)}%</div>
                    </th>
                  ))}
                  
                  <th className="p-3 font-bold border-b text-center bg-gray-200 w-24">Definitiva</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.length === 0 ? (
                  <tr><td colSpan="100%" className="text-center p-8 text-gray-400">No hay estudiantes matriculados en este curso.</td></tr>
                ) : (
                  estudiantes.map((est, index) => {
                    const definitiva = calcularDefinitiva(est.notas);
                    const colorDefinitiva = definitiva >= 3.0 ? 'text-green-600' : 'text-red-600';

                    return (
                      <tr key={est.id_estudiante} className="hover:bg-gray-50 border-b transition-colors group">
                        <td className="p-2 text-center text-sm font-bold text-gray-400 border-r">{index + 1}</td>
                        <td className="p-2 font-medium text-gray-800 border-r sticky left-0 bg-white group-hover:bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-sm">
                          {est.nombre_completo}
                        </td>

                        {/* CELDAS DINÁMICAS (INPUTS) */}
                        {actividades.map(act => (
                          <td key={act.id_actividad} className="p-1 border-r bg-white text-center">
                            <input 
                              type="text" 
                              maxLength="3"
                              className="w-16 text-center p-1.5 border border-transparent rounded bg-transparent font-bold focus:border-[#0033a0] focus:bg-white focus:ring-1 focus:ring-[#0033a0] outline-none transition-all hover:bg-gray-100"
                              value={est.notas[act.id_actividad] || ""}
                              onChange={(e) => handleChangeNota(est.id_estudiante, act.id_actividad, e.target.value)}
                            />
                          </td>
                        ))}

                        <td className={`p-2 text-center font-extrabold text-lg bg-gray-50 ${colorDefinitiva}`}>
                          {definitiva}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-gray-50 border-t flex justify-end">
            <button 
              onClick={handleGuardarNotas}
              className="bg-[#0033a0] hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-md flex items-center gap-2"
            >
              <span>💾</span> Guardar Planilla
            </button>
          </div>
        </div>
      )}

      {/* MODAL PARA CREAR ACTIVIDAD */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="bg-[#0033a0] p-4 text-center">
              <h2 className="text-xl font-bold text-white">Nueva Actividad Evaluativa</h2>
            </div>
            
            <form onSubmit={handleCrearActividad} className="p-6 space-y-4">
              <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm font-bold text-center border border-blue-200">
                Porcentaje disponible: {porcentajeRestante.toFixed(1)}%
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de la Actividad</label>
                <input 
                  type="text" required placeholder="Ej: Examen Final"
                  className="w-full p-2.5 border rounded-lg focus:border-[#0033a0] outline-none"
                  value={nuevaAct.titulo} onChange={(e) => setNuevaAct({...nuevaAct, titulo: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Valor Porcentual (%)</label>
                <input 
                  type="number" required placeholder="Ej: 20" min="1" max={porcentajeRestante} step="0.1"
                  className="w-full p-2.5 border rounded-lg focus:border-[#0033a0] outline-none"
                  value={nuevaAct.porcentaje} onChange={(e) => setNuevaAct({...nuevaAct, porcentaje: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalAbierto(false)} className="flex-1 bg-gray-200 text-gray-800 font-bold py-2.5 rounded-lg hover:bg-gray-300">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-green-600 text-white font-bold py-2.5 rounded-lg hover:bg-green-700 shadow">
                  Añadir Columna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}