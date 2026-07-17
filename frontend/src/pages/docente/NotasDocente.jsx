import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdSave } from 'react-icons/md';
import {
  obtenerAsignaciones,
  obtenerPlanillaNotas,
  crearActividadDocente,
  guardarNotasMasivas
} from "../../api/perfilApi";

export default function NotasDocente() {
  const navigate = useNavigate();

  const userStr = localStorage.getItem("cesl_user") || localStorage.getItem("usuario");
  const user = userStr ? JSON.parse(userStr) : null;
  const idUsuario = user?.id_usuario || user?.id;

  const [materias, setMaterias] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [seleccion, setSeleccion] = useState({ id_curso: "", id_materia: "", periodo: "1" });

  const [actividades, setActividades] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [planillaCargada, setPlanillaCargada] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  // 👇 Se añade requiere_pdf al estado inicial
const [nuevaAct, setNuevaAct] = useState({ titulo: "", porcentaje: "", requiere_pdf: false, fecha_entrega: "" });

  useEffect(() => {
    if (idUsuario) cargarFiltros();
  }, [idUsuario]);

  const cargarFiltros = async () => {
    const data = await obtenerAsignaciones(idUsuario);
    setMaterias(data.materias || []);
    setCursos(data.cursos || []);
  };

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

const handleCrearActividad = async (e) => {
    e.preventDefault();
    if (!nuevaAct.fecha_entrega) return alert("Por favor selecciona una fecha de entrega.");
    
    const porcentajeNuevo = parseFloat(nuevaAct.porcentaje);
    // ... (el resto del cálculo del porcentaje se mantiene igual)

    try {
      const payload = {
        id_curso: seleccion.id_curso,
        id_materia: seleccion.id_materia,
        periodo: seleccion.periodo,
        titulo: nuevaAct.titulo,
        porcentaje: porcentajeNuevo,
        requiere_pdf: nuevaAct.requiere_pdf,
        fecha_entrega: nuevaAct.fecha_entrega // 👇 Enviamos la fecha
      };

      await crearActividadDocente(idUsuario, payload);
      alert("Actividad creada y publicada en el calendario de los estudiantes.");
      
      setModalAbierto(false);
      setNuevaAct({ titulo: "", porcentaje: "", requiere_pdf: false, fecha_entrega: "" }); // Reiniciar form
      handleCargarPlanilla();
    } catch (error) {
      alert("Hubo un error al crear la actividad.");
    }
  };

  // 👇 FUNCIÓN ACTUALIZADA: Maneja tanto la nota como la retroalimentación
  const handleChangeData = (idEstudiante, idActividad, campo, valor) => {
    if (campo === 'nota') {
      if (valor !== "" && !/^\d*\.?\d*$/.test(valor)) return;
      if (parseFloat(valor) > 5) return;
    }

    setEstudiantes(estudiantes.map(est => {
      if (est.id_estudiante === idEstudiante) {
        // Aseguramos que exista el objeto de esa actividad
        const dataActual = est.notas[idActividad] || { nota: "", retroalimentacion: "" };
        return {
          ...est,
          notas: {
            ...est.notas,
            [idActividad]: { ...dataActual, [campo]: valor }
          }
        };
      }
      return est;
    }));
  };

  // 👇 FUNCIÓN ACTUALIZADA: Empaqueta los datos compuestos para enviar al backend
  const handleGuardarNotas = async () => {
    const notasParaGuardar = [];
    
    estudiantes.forEach(est => {
      Object.keys(est.notas).forEach(idAct => {
        const celda = est.notas[idAct];
        // Validamos si hay una nota ingresada o una retroalimentación escrita
        if (celda && ((celda.nota !== "" && celda.nota !== null) || (celda.retroalimentacion && celda.retroalimentacion.trim() !== ""))) {
          notasParaGuardar.push({
            id_actividad: parseInt(idAct),
            id_estudiante: est.id_estudiante,
            nota: celda.nota || null,
            retroalimentacion: celda.retroalimentacion || null
          });
        }
      });
    });

    if (notasParaGuardar.length === 0) return alert("No hay datos nuevos para guardar.");

    try {
      await guardarNotasMasivas(notasParaGuardar);
      alert("¡Planilla y retroalimentaciones guardadas exitosamente!");
    } catch (error) {
      alert("Hubo un error al guardar la planilla.");
    }
  };

  const porcentajeTotal = actividades.reduce((sum, act) => sum + parseFloat(act.porcentaje), 0);
  const porcentajeRestante = 100 - porcentajeTotal;

  // 👇 ACTUALIZADO: Ahora extrae la nota dentro del objeto anidado
  const calcularDefinitiva = (notasDelAlumno) => {
    let final = 0;
    actividades.forEach(act => {
      const celda = notasDelAlumno[act.id_actividad];
      const notaIngresada = celda ? parseFloat(celda.nota) : NaN;
      if (!isNaN(notaIngresada)) {
        final += notaIngresada * (parseFloat(act.porcentaje) / 100);
      }
    });
    return final.toFixed(1);
  };

  const cursosFiltrados = seleccion.id_materia
    ? cursos.filter(c => c.id_materia === parseInt(seleccion.id_materia))
    : [];

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6 animate-fade-in-up font-sans">
      <div className="w-full flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border-l-[6px] border-[#0033a0] mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 m-0">Planilla de Calificaciones</h2>
          <p className="text-gray-500 mt-1 font-medium">Gestiona actividades, archivos y retroalimentación</p>
        </div>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[#0033a0] hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow">
          Volver
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <form onSubmit={handleCargarPlanilla} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Materia</label>
            <select required className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-[#0033a0] outline-none" value={seleccion.id_materia} onChange={(e) => setSeleccion({ ...seleccion, id_materia: e.target.value, id_curso: "" })}>
              <option value="">Seleccione...</option>
              {materias.map(m => <option key={m.id_materia} value={m.id_materia}>{m.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Curso</label>
            <select required className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-[#0033a0] outline-none" value={seleccion.id_curso} onChange={(e) => setSeleccion({ ...seleccion, id_curso: e.target.value })}>
              <option value="">Seleccione...</option>
              {cursosFiltrados.map(c => <option key={c.id_curso} value={c.id_curso}>{c.nombre} {c.nivel ? `(${c.nivel})` : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Periodo</label>
            <select className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-[#0033a0] outline-none" value={seleccion.periodo} onChange={(e) => setSeleccion({ ...seleccion, periodo: e.target.value })}>
              <option value="1">Primer Periodo</option>
              <option value="2">Segundo Periodo</option>
              <option value="3">Tercer Periodo</option>
              <option value="4">Cuarto Periodo</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-[#0033a0] text-white font-bold py-2.5 rounded-lg hover:bg-blue-800 transition-colors h-11">
            {cargando ? 'Cargando...' : 'Cargar Planilla'}
          </button>
        </form>
      </div>

      {planillaCargada && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
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
              className={`px-4 py-2 rounded-lg font-bold transition-all shadow-sm flex items-center gap-2 ${porcentajeTotal >= 100 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
            >
              <span>+</span> Añadir Actividad
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="p-3 font-bold border-b border-r w-10 text-center">N°</th>
                  <th className="p-3 font-bold border-b border-r sticky left-0 bg-gray-100 z-10 w-64 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Estudiante</th>
                  
                  {actividades.map(act => (
                    <th key={act.id_actividad} className="p-2 font-bold border-b border-r text-center w-36 bg-blue-50/50">
                      <div className="text-xs text-gray-800 truncate" title={act.titulo}>{act.titulo}</div>
                      <div className="text-[10px] text-blue-700">{parseFloat(act.porcentaje)}%</div>
                      {/* Indicador visual si la actividad requiere archivo */}
                      {act.requiere_pdf && <div className="text-[9px] text-orange-600 uppercase mt-1">Con Entregable</div>}
                    </th>
                  ))}

                  <th className="p-3 font-bold border-b text-center bg-gray-200 w-24">Definitiva</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.length === 0 ? (
                  <tr><td colSpan="100%" className="text-center p-8 text-gray-400">No hay estudiantes matriculados.</td></tr>
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

                        {/* 👇 CELDAS DINÁMICAS REDISEÑADAS 👇 */}
                        {actividades.map(act => {
                          const celdaData = est.notas[act.id_actividad] || {};
                          return (
                            <td key={act.id_actividad} className="p-2 border-r bg-white align-top min-w-[140px]">
                              <div className="flex flex-col gap-1.5">
                                {/* Input numérico de la nota */}
                                <input
                                  type="text"
                                  maxLength="3"
                                  className="w-16 mx-auto text-center p-1 border border-transparent rounded bg-transparent font-bold focus:border-[#0033a0] focus:bg-white focus:ring-1 focus:ring-[#0033a0] outline-none transition-all hover:bg-gray-100"
                                  value={celdaData.nota || ""}
                                  onChange={(e) => handleChangeData(est.id_estudiante, act.id_actividad, 'nota', e.target.value)}
                                  placeholder="0.0"
                                />

                                {/* Lógica del PDF */}
                                {act.requiere_pdf && (
                                  <div className="text-[11px] border-t border-gray-100 pt-1 text-center">
                                    {celdaData.archivoPdf ? (
                                      <a href={celdaData.archivoPdf} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline flex items-center justify-center" title={`Entregado: ${new Date(celdaData.fechaEntrega).toLocaleDateString()}`}>
                                        📄 Ver Entrega
                                      </a>
                                    ) : (
                                      <span className="text-red-400 font-medium">Sin entregar</span>
                                    )}
                                  </div>
                                )}

                                {/* Input de retroalimentación */}
                                <input
                                  type="text"
                                  className="text-[10px] p-1.5 border border-gray-200 rounded bg-gray-50 focus:bg-white focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0] outline-none w-full transition-all"
                                  placeholder="Escribir feedback..."
                                  value={celdaData.retroalimentacion || ""}
                                  onChange={(e) => handleChangeData(est.id_estudiante, act.id_actividad, 'retroalimentacion', e.target.value)}
                                />
                              </div>
                            </td>
                          );
                        })}

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
            <button onClick={handleGuardarNotas} className="bg-[#0033a0] hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-md flex items-center gap-2">
              <MdSave className="text-xl" />
              <span>Guardar Planilla</span>
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
                <input type="text" required placeholder="Ej: Examen Final" className="w-full p-2.5 border rounded-lg focus:border-[#0033a0] outline-none" value={nuevaAct.titulo} onChange={(e) => setNuevaAct({ ...nuevaAct, titulo: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Valor Porcentual (%)</label>
                <input type="number" required placeholder="Ej: 20" min="1" max={porcentajeRestante} step="0.1" className="w-full p-2.5 border rounded-lg focus:border-[#0033a0] outline-none" value={nuevaAct.porcentaje} onChange={(e) => setNuevaAct({ ...nuevaAct, porcentaje: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Fecha de Entrega / Evaluación</label>
                <input 
                  type="date" 
                  required 
                  className="w-full p-2.5 border rounded-lg focus:border-[#0033a0] outline-none" 
                  value={nuevaAct.fecha_entrega} 
                  onChange={(e) => setNuevaAct({ ...nuevaAct, fecha_entrega: e.target.value })} 
                />
              </div>

              {/* 👇 NUEVO CHECKBOX PARA SOLICITAR PDF 👇 */}
              <div className="flex items-center mt-4">
                <input 
                  type="checkbox" 
                  id="requierePdf" 
                  className="w-4 h-4 text-[#0033a0] bg-gray-100 border-gray-300 rounded focus:ring-[#0033a0]" 
                  checked={nuevaAct.requiere_pdf} 
                  onChange={(e) => setNuevaAct({ ...nuevaAct, requiere_pdf: e.target.checked })} 
                />
                <label htmlFor="requierePdf" className="ml-2 text-sm font-bold text-gray-700">
                  Esta actividad requiere que el estudiante suba un archivo (PDF)
                </label>
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