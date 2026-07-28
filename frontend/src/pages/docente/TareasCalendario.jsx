import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// IMPORTANTE: Asegúrate de tener actualizarTareaGlobal en tu perfilApi.js
import { obtenerAsignaciones, obtenerTareasDocente, crearTareaGlobal, actualizarTareaGlobal } from "../../api/perfilApi";
import { MdLightbulb, MdEdit, MdNoteAdd } from "react-icons/md";

export default function CalendarioDocente() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: "", fecha_entrega: "", id_curso: "", id_materia: "", color: "blue"
  });

  const [visibilidad, setVisibilidad] = useState("curso");

  // 👉 NUEVO ESTADO: Para saber si estamos editando
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);

  const [materias, setMaterias] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [tareasGuardadas, setTareasGuardadas] = useState([]);

  const userStr = localStorage.getItem("cesl_user");
  const user = userStr ? JSON.parse(userStr) : null;
  const idUsuario = user?.id_usuario || user?.id;

  const colorStyles = {
    blue: "#0033a0", green: "#20c997", red: "#dc3545", yellow: "#ffc107", purple: "#6f42c1"
  };

  useEffect(() => {
    if (idUsuario) cargarDatosIniciales();
  }, [idUsuario]);

  const cargarDatosIniciales = async () => {
    const dataFormulario = await obtenerAsignaciones(idUsuario);
    const tareasData = await obtenerTareasDocente(idUsuario);
    setMaterias(dataFormulario.materias || []);
    setCursos(dataFormulario.cursos || []);
    setTareasGuardadas(tareasData);
  };

  // ==========================================
  // FUNCIONES DE SELECCIÓN Y EDICIÓN
  // ==========================================

  // Cuando hace clic en un día vacío
  const seleccionarFechaVacia = (dia) => {
    const mesFormateado = String(mesActual + 1).padStart(2, '0');
    const diaFormateado = String(dia).padStart(2, '0');
    setNuevaTarea({ ...nuevaTarea, fecha_entrega: `${anioActual}-${mesFormateado}-${diaFormateado}` });
    limpiarFormulario();
  };

  // Cuando hace clic en una tarea ya creada
  const seleccionarTareaExistente = (tarea, e) => {
    e.stopPropagation(); // 👈 MAGIA: Evita que se seleccione el día vacío que está de fondo
    setTareaSeleccionada(tarea);
    setVisibilidad(tarea.id_curso ? "curso" : "personal");

    setNuevaTarea({
      titulo: tarea.titulo,
      fecha_entrega: tarea.fecha_entrega,
      id_curso: tarea.id_curso || "",
      id_materia: tarea.id_materia || "",
      color: tarea.color || "blue"
    });
  };

  const limpiarFormulario = () => {
    setTareaSeleccionada(null);
    setNuevaTarea({ ...nuevaTarea, titulo: "", id_curso: "", id_materia: "", color: "blue" });
  };

  const handleGuardarTarea = async (e) => {
    e.preventDefault();
    if (!idUsuario) return alert("Error: Usuario no identificado");

    try {
      const payload = visibilidad === "personal"
        ? { ...nuevaTarea, id_curso: "", id_materia: "" }
        : nuevaTarea;

      if (tareaSeleccionada) {
        // MODO EDICIÓN
        await actualizarTareaGlobal(tareaSeleccionada.id_tarea, payload);
        alert("¡Evento actualizado con éxito!");
      } else {
        // MODO CREACIÓN
        await crearTareaGlobal(idUsuario, payload);
        alert(visibilidad === "personal" ? "¡Recordatorio personal guardado!" : "¡Tarea asignada al curso con éxito!");
      }

      limpiarFormulario();
      cargarDatosIniciales();
    } catch (error) {
      alert("Hubo un error al guardar la tarea");
    }
  };

  // ==========================================
  // LÓGICA DEL CALENDARIO
  // ==========================================
  const anioActual = currentDate.getFullYear();
  const mesActual = currentDate.getMonth();
  const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const mesAnteriorNombre = mesActual === 0 ? "Diciembre" : nombresMeses[mesActual - 1];
  const mesSiguienteNombre = mesActual === 11 ? "Enero" : nombresMeses[mesActual + 1];

  const diasEnElMes = new Date(anioActual, mesActual + 1, 0).getDate();
  const primerDiaDelMes = new Date(anioActual, mesActual, 1).getDay();
  const inicioSemana = primerDiaDelMes === 0 ? 6 : primerDiaDelMes - 1;

  const diasArray = Array.from({ length: diasEnElMes }, (_, i) => i + 1);
  const celdasVacias = Array.from({ length: inicioSemana }, () => null);
  const cuadricula = [...celdasVacias, ...diasArray];

  const fechaHoy = new Date();
  const esMesActual = anioActual === fechaHoy.getFullYear() && mesActual === fechaHoy.getMonth();

  const irMesAnterior = () => setCurrentDate(new Date(anioActual, mesActual - 1, 1));
  const irMesSiguiente = () => setCurrentDate(new Date(anioActual, mesActual + 1, 1));

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6 animate-fade-in-up font-sans">

      <div className="w-full flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border-l-[6px] border-[#0033a0] mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 m-0">Gestión de Tareas y Eventos</h2>
          <p className="text-gray-500 m-0 mt-1 font-medium">Asigna actividades a tus grupos o crea recordatorios personales</p>
        </div>
        <button onClick={() => navigate(-1)} className="mt-4 md:mt-0 px-6 py-2.5 bg-[#0033a0] hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow">
          Volver al Inicio
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-blue-50 p-4 rounded-lg border-l-4 border-[#0033a0] shadow-sm gap-4">
        <p className="text-[#0033a0] text-sm md:text-base">
          <span className="font-extrabold text-lg mr-2 inline-flex items-center gap-1">
            <MdLightbulb className="text-xl" /> Ayuda
          </span>
          Para agregar una tarea, haz clic en un <strong className="underline cursor-pointer">día vacío</strong>. Para editar, haz clic directamente <strong className="underline cursor-pointer">sobre la tarea</strong>.
        </p>
      </div>

      <div className="w-full flex flex-col xl:flex-row items-stretch gap-6">

        {/* CALENDARIO */}
        <div className="flex-1 w-full bg-white rounded-xl shadow-md border border-gray-300 overflow-hidden flex flex-col h-full">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <button onClick={irMesAnterior} className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg font-bold text-gray-600 transition-colors shadow-sm flex items-center gap-2">
              <span className="text-lg">&lt;</span>
              <span className="capitalize hidden sm:inline">{mesAnteriorNombre.toLowerCase()}</span>
            </button>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#0033a0]">{nombresMeses[mesActual]} {anioActual}</h3>
            <button onClick={irMesSiguiente} className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg font-bold text-gray-600 transition-colors shadow-sm flex items-center gap-2">
              <span className="capitalize hidden sm:inline">{mesSiguienteNombre.toLowerCase()}</span>
              <span className="text-lg">&gt;</span>
            </button>
          </div>

          <div className="grid grid-cols-7 bg-white border-b border-gray-200">
            {diasSemana.map(d => (
              <div key={d} className="py-3 text-center font-bold text-gray-700 text-xs sm:text-sm uppercase">{d}</div>
            ))}
          </div>

          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-7 auto-rows-[120px] gap-px bg-gray-200">
              {cuadricula.map((dia, index) => {
                const esHoy = esMesActual && dia === fechaHoy.getDate();
                let isSelected = false;
                if (dia) {
                  const mesFormat = String(mesActual + 1).padStart(2, '0');
                  const diaFormat = String(dia).padStart(2, '0');
                  isSelected = nuevaTarea.fecha_entrega === `${anioActual}-${mesFormat}-${diaFormat}`;
                }

                return (
                  <div
                    key={index}
                    onClick={() => dia && seleccionarFechaVacia(dia)}
                    className={`p-2 flex flex-col transition-colors overflow-y-auto custom-scrollbar relative ${!dia ? 'bg-gray-100' : 'bg-white hover:bg-blue-50/50 cursor-pointer'} ${esHoy ? 'ring-2 ring-inset ring-[#0033a0] z-10 bg-blue-50' : ''} ${isSelected && !esHoy ? 'ring-2 ring-inset ring-blue-300 bg-blue-50/80 z-10' : ''}`}
                  >
                    {dia && (
                      <span className={`text-sm mb-1 block ${esHoy ? 'font-extrabold text-[#0033a0]' : 'font-bold text-gray-700'}`}>{dia}</span>
                    )}
                    <div className="flex flex-col gap-1 mt-1">
                      {(() => {
                        if (!dia) return null;
                        const mesFormat = String(mesActual + 1).padStart(2, '0');
                        const diaFormat = String(dia).padStart(2, '0');
                        const fechaCelda = `${anioActual}-${mesFormat}-${diaFormat}`;
                        const tareasDelDia = tareasGuardadas.filter(t => t.fecha_entrega === fechaCelda);

                        return tareasDelDia.map(tarea => {
                          const tailwindColors = {
                            blue: "bg-blue-100 border-blue-300 text-blue-800", green: "bg-green-100 border-green-300 text-green-800", red: "bg-red-100 border-red-300 text-red-800", yellow: "bg-yellow-100 border-yellow-300 text-yellow-800", purple: "bg-purple-100 border-purple-300 text-purple-800"
                          };
                          const estiloColor = tailwindColors[tarea.color] || tailwindColors.blue;
                          return (
                            <div
                              key={tarea.id_tarea}
                              onClick={(e) => seleccionarTareaExistente(tarea, e)}
                              className={`w-full border text-xs px-1.5 py-1 rounded truncate font-bold cursor-pointer hover:opacity-80 transition-opacity ${estiloColor} ${tarea.id_tarea === tareaSeleccionada?.id_tarea ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                              title={`${tarea.titulo}`}
                            >
                              {tarea.titulo} {tarea.grado && <span className="font-normal opacity-80">({tarea.grado})</span>}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FORMULARIO LATERAL */}
        <div className="w-full xl:w-[350px] shrink-0 bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-6">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <span className="text-2xl text-[#0033a0]">
              {tareaSeleccionada ? <MdEdit /> : <MdNoteAdd />}
            </span>
            <h3 className="text-xl font-bold text-gray-800">
              {tareaSeleccionada ? "Editar Evento" : "Agregar Evento"}
            </h3>
          </div>

          <form onSubmit={handleGuardarTarea} className="flex flex-col gap-5">

            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setVisibilidad("curso")}
                className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${visibilidad === "curso" ? "bg-white shadow text-[#0033a0]" : "text-gray-500 hover:text-gray-700"}`}
              >
                Para Estudiantes
              </button>
              <button
                type="button"
                onClick={() => setVisibilidad("personal")}
                className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${visibilidad === "personal" ? "bg-white shadow text-[#0033a0]" : "text-gray-500 hover:text-gray-700"}`}
              >
                Privado
              </button>
            </div>

            <div>
              <label className="block text-sm text-gray-700 font-bold mb-1.5">Título del Evento</label>
              <input type="text" required placeholder="Ej: Proyecto Final / Revisar notas" className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0] outline-none text-sm" value={nuevaTarea.titulo} onChange={(e) => setNuevaTarea({ ...nuevaTarea, titulo: e.target.value })} />
            </div>

            {visibilidad === "curso" && (
              <div className="grid grid-cols-2 gap-3 animate-fade-in-up">
                <div>
                  <label className="block text-sm text-gray-700 font-bold mb-1.5">Materia</label>
                  <select required className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0] outline-none bg-white cursor-pointer text-sm" value={nuevaTarea.id_materia} onChange={(e) => setNuevaTarea({ ...nuevaTarea, id_materia: e.target.value })}>
                    <option value="">Materia...</option>
                    {materias.map(m => <option key={m.id_materia} value={m.id_materia}>{m.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-bold mb-1.5">Curso</label>
                  <select required className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0] outline-none bg-white cursor-pointer text-sm" value={nuevaTarea.id_curso} onChange={(e) => setNuevaTarea({ ...nuevaTarea, id_curso: e.target.value })}>
                    <option value="">Curso...</option>
                    {cursos.map(c => <option key={c.id_curso} value={c.id_curso}>{c.nombre} {c.nivel ? `(${c.nivel})` : ''}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-700 font-bold mb-1.5">Fecha</label>
              <input type="date" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0] outline-none text-gray-700 bg-white text-sm cursor-pointer" value={nuevaTarea.fecha_entrega} onChange={(e) => setNuevaTarea({ ...nuevaTarea, fecha_entrega: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm text-gray-700 font-bold mb-2">Color Etiqueta</label>
              <div className="flex justify-between px-1">
                {Object.keys(colorStyles).map(c => (
                  <button key={c} type="button" onClick={() => setNuevaTarea({ ...nuevaTarea, color: c })} className={`w-8 h-8 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${nuevaTarea.color === c ? 'border-gray-800 scale-125' : 'border-transparent'}`} style={{ backgroundColor: colorStyles[c] }} />
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button type="submit" className="w-full bg-[#0033a0] text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-all shadow">
                {tareaSeleccionada ? "Guardar Cambios" : (visibilidad === "personal" ? "Guardar Recordatorio" : "Publicar Tarea")}
              </button>

              {/* Botón para volver al modo creación */}
              {tareaSeleccionada && (
                <button
                  type="button"
                  onClick={limpiarFormulario}
                  className="w-full bg-white text-gray-600 border border-gray-300 py-2.5 rounded-lg font-bold hover:bg-gray-100 transition-all"
                >
                  Nuevo Evento
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}