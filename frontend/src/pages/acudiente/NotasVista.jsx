import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { obtenerPlanillaNotas, obtenerMateriasPorCurso } from "../../api/perfilApi";
import { MdWarning, MdCheckCircle, MdLightbulb, MdChevronRight, MdEdit, MdLogout } from "react-icons/md";

export default function NotasVista() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Recibimos los datos del hijo y sus notas
  const { estudiante } = location.state || {};

  // ==========================================
  // ESTADOS DE FILTROS Y PLANILLA
  // ==========================================
  const [materias, setMaterias] = useState([]);
  const [seleccion, setSeleccion] = useState({
    id_estudiante: estudiante?.id || "",
    id_curso: estudiante?.degreeId || estudiante?.id_curso || 1, 
    id_materia: "",
    periodo: "1"
  });

  const [actividades, setActividades] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]); 
  const [cargando, setCargando] = useState(false);
  const [planillaCargada, setPlanillaCargada] = useState(false);
  
  // 👇 NUEVO ESTADO: Guardará el docente solo cuando se cargue la planilla
  const [docenteCargado, setDocenteCargado] = useState("");

  useEffect(() => {
    const cargarMaterias = async () => {
      try {
        const idCurso = estudiante?.degreeId || estudiante?.id_curso;
        if (idCurso) {
          const materiasDelCurso = await obtenerMateriasPorCurso(idCurso);
          setMaterias(materiasDelCurso);
        }
      } catch (err) {
        console.error("Error cargando materias", err);
      }
    };
    cargarMaterias();
  }, [estudiante]);

  const handleCargarPlanilla = async (e) => {
    e?.preventDefault();
    
    if (!seleccion.id_curso || !seleccion.id_materia) {
      return alert("Por favor selecciona una materia válida de la lista.");
    }

    setCargando(true);
    try {
      const data = await obtenerPlanillaNotas(seleccion.id_curso, seleccion.id_materia, seleccion.periodo);
      
      setActividades(data.actividades || []);
      
      const filaDelHijo = (data.planilla || []).filter(est => Number(est.id_estudiante) === Number(seleccion.id_estudiante));
      
      setEstudiantes(filaDelHijo);
      setPlanillaCargada(true);

      setDocenteCargado(data.nombreDocente || "No asignado");

    } catch (error) {
      console.error("❌ ERROR CRÍTICO AL CARGAR PLANILLA:", error);
      alert("Hubo un error al cargar los detalles de la materia.");
    } finally {
      setCargando(false);
    }
  };

  const porcentajeTotal = actividades.reduce((sum, act) => sum + parseFloat(act.porcentaje), 0);

  const calcularDefinitiva = (notasDelAlumno) => {
    let final = 0;
    actividades.forEach(act => {
      const notaIngresada = parseFloat(notasDelAlumno[act.id_actividad]?.nota);
      if (!isNaN(notaIngresada)) {
        final += notaIngresada * (parseFloat(act.porcentaje) / 100);
      }
    });
    return final.toFixed(1);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6 animate-fade-in-up font-sans flex flex-col">
      
      {/* HEADER */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 sm:p-6 rounded-xl shadow-sm border-l-[6px] border-modulo-notas mb-4 sm:mb-6 gap-4">
        <div className="w-full">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 m-0">Detalle de Calificaciones</h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1 font-medium">
            Consultando actividades de: <strong className="text-modulo-notas uppercase">{estudiante?.nombre || "Estudiante"}</strong>
            
            {/* 👇 MOSTRAMOS EL DOCENTE SOLO SI YA SE CARGÓ LA PLANILLA */}
            {planillaCargada && docenteCargado && (
              <>
                <span className="mx-2 hidden sm:inline">|</span>
                <br className="sm:hidden" />
                Docente: <strong className="text-modulo-notas uppercase">{docenteCargado}</strong>
              </>
            )}
          </p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-[#0033a0] hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow text-center"
        >
          Volver al Inicio
        </button>
      </div>

      {/* FILTROS (Materia y Periodo) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <form onSubmit={handleCargarPlanilla} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Asignatura a consultar:</label>
            <select 
              required 
              className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-[#0033a0] focus:border-[#0033a0] outline-none font-medium text-gray-700 transition-colors bg-white"
              value={seleccion.id_materia} 
              onChange={(e) => setSeleccion({...seleccion, id_materia: e.target.value})}
            >
              <option value="">-- Selecciona una materia --</option>
              {materias.map((m, i) => (
                <option key={i} value={m.id_materia}>{m.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Periodo Académico:</label>
            <select 
              className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-[#0033a0] focus:border-[#0033a0] outline-none font-medium text-gray-700 transition-colors bg-white"
              value={seleccion.periodo} 
              onChange={(e) => setSeleccion({...seleccion, periodo: e.target.value})}
            >
              <option value="1">Primer Periodo</option>
              <option value="2">Segundo Periodo</option>
              <option value="3">Tercer Periodo</option>
              <option value="4">Cuarto Periodo</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={cargando}
            className={`w-full text-white font-bold py-2.5 rounded-lg transition-colors h-[46px] shadow-sm
              ${cargando ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0033a0] hover:bg-blue-800'}`}
          >
            {cargando ? "Buscando Notas..." : "Cargar Planilla"}
          </button>

        </form>
      </div>

      {/* ZONA DE LA PLANILLA (SOLO LECTURA) */}
      {planillaCargada && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
          
          {/* BARRA DE PROGRESO */}
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <div>
              <span className="text-gray-600 font-bold mr-2">Progreso de evaluación del docente:</span>
              <span className={`font-extrabold text-lg ${porcentajeTotal === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                {porcentajeTotal}% / 100%
              </span>
            </div>
          </div>

          {/* CUADRÍCULA ESTILO EXCEL ADAPTADA */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="p-3 font-bold border-b border-r sticky left-0 bg-gray-100 z-10 w-64 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    Estudiante
                  </th>
                  
                  {/* COLUMNAS DINÁMICAS POR ACTIVIDAD */}
                  {actividades.length === 0 ? (
                    <th className="p-3 font-bold border-b text-center text-gray-400 italic">
                      El docente aún no ha registrado actividades.
                    </th>
                  ) : (
                    actividades.map(act => (
                      <th key={act.id_actividad} className="p-2 font-bold border-b border-r text-center w-28 bg-blue-50/50">
                        <div className="text-xs text-gray-500 truncate" title={act.titulo}>{act.titulo}</div>
                        <div className="text-blue-700">{parseFloat(act.porcentaje)}%</div>
                      </th>
                    ))
                  )}
                  
                  <th className="p-3 font-bold border-b text-center bg-gray-200 w-24">Definitiva</th>
                </tr>
              </thead>
              
              <tbody>
                {estudiantes.length === 0 ? (
                  <tr>
                    <td colSpan="100%" className="text-center p-8 text-gray-400">
                      No se encontraron registros detallados para este periodo.
                    </td>
                  </tr>
                ) : (
                  estudiantes.map((est) => {
                    const definitiva = calcularDefinitiva(est.notas);
                    const colorDefinitiva = definitiva >= 3.0 ? 'text-green-600' : 'text-red-600';

                    return (
                      <tr key={est.id_estudiante} className="hover:bg-gray-50 border-b transition-colors group">
                        
                        <td className="p-3 font-medium text-gray-800 border-r sticky left-0 bg-white group-hover:bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-sm uppercase">
                          <div>{est.nombre_completo}</div>
                          {/* 👇 DOCENTE AL LADO (DEBAJO) DEL ESTUDIANTE EN LA TABLA CON EL ESTADO CORRECTO */}
                          <div className="text-xs text-gray-500 capitalize mt-1 font-normal normal-case">
                            <span className="font-semibold text-[#0033a0]">Docente:</span> {docenteCargado?.toLowerCase()}
                          </div>
                        </td>

                        {/* CELDAS DINÁMICAS (Solo Lectura) */}
                        {actividades.map(act => {
                          const nota = est.notas[act.id_actividad]?.nota;
                          return (
                            <td key={act.id_actividad} className="p-2 border-r bg-white text-center">
                              <span className={`font-bold text-base ${nota && parseFloat(nota) < 3.0 ? 'text-red-500' : 'text-gray-700'}`}>
                                {nota || "-"}
                              </span>
                            </td>
                          );
                        })}

                        {/* Definitiva */}
                        <td className={`p-3 text-center font-extrabold text-lg bg-gray-50 ${colorDefinitiva}`}>
                          {definitiva}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-gray-50 border-t text-sm text-gray-500 text-center font-medium">
            * Las notas son de carácter informativo y pueden ser ajustadas por el docente antes del cierre del periodo.
          </div>
        </div>
      )}
    </div>
  );
}