import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  obtenerTareasEstudiante, 
  guardarRecordatorio, 
  actualizarRecordatorio, 
  entregarTareaEstudiante 
} from "../../api/perfilApi";
// Importamos MdCheckCircle para el mensaje de tarea entregada
import { MdVisibility, MdEdit, MdLightbulb, MdLock, MdFileUpload, MdCheckCircle } from "react-icons/md";

export default function TareasCalendario() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  // ==========================================
  // ESTADOS DEL COMPONENTE
  // ==========================================
  const [tareas, setTareas] = useState([]);

  // Estados para el formulario lateral
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [color, setColor] = useState("blue");
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);

  // Estados para la subida de PDF
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const userStr = localStorage.getItem("cesl_user") || localStorage.getItem("usuario");
  const user = userStr ? JSON.parse(userStr) : null;
  const idUsuario = user?.id_usuario || user?.id;

  const colorStyles = {
    blue: "#0033a0", green: "#20c997", red: "#dc3545", yellow: "#ffc107", purple: "#6f42c1"
  };

  // ==========================================
  // CARGAR DATOS DESDE EL BACKEND
  // ==========================================
  const cargarTareas = async () => {
    if (!idUsuario) return;
    try {
      const data = await obtenerTareasEstudiante(idUsuario);
      setTareas(data);
    } catch (error) {
      console.error("Error al cargar tareas:", error);
    }
  };

  useEffect(() => {
    cargarTareas();
  }, [idUsuario]);

  // ==========================================
  // LÓGICA DEL CALENDARIO
  // ==========================================
  const fechaHoy = new Date();
  const mesActual = currentDate.getMonth();
  const anioActual = currentDate.getFullYear();

  const mesActualReal = fechaHoy.getMonth();
  const anioActualReal = fechaHoy.getFullYear();
  const esMesActual = anioActual === anioActualReal && mesActual === mesActualReal;

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

  // ==========================================
  // FUNCIONES DE SELECCIÓN Y GUARDADO
  // ==========================================
  const seleccionarFechaVacia = (dia) => {
    const mesFormateado = String(mesActual + 1).padStart(2, '0');
    const diaFormateado = String(dia).padStart(2, '0');
    setFechaSeleccionada(`${anioActual}-${mesFormateado}-${diaFormateado}`);
    limpiarFormulario();
  };

  const seleccionarTareaExistente = (tarea, e) => {
    e.stopPropagation();
    setTareaSeleccionada(tarea);
    setTitulo(tarea.titulo);
    setDescripcion(tarea.descripcion || "");
    setFechaSeleccionada(tarea.fecha_entrega);
    setColor(tarea.color || "blue");
  };

  const limpiarFormulario = () => {
    setTareaSeleccionada(null);
    setTitulo("");
    setDescripcion("");
    setColor("blue");
  };

  const handleGuardarTarea = async (e) => {
    e.preventDefault();
    if (!titulo || !fechaSeleccionada) {
      alert("Por favor ingresa al menos un título y una fecha.");
      return;
    }

    try {
      if (tareaSeleccionada) {
        await actualizarRecordatorio(tareaSeleccionada.id_tarea, {
          titulo, descripcion, fecha_entrega: fechaSeleccionada, color
        });
      } else {
        await guardarRecordatorio(idUsuario, {
          titulo, descripcion, fecha_entrega: fechaSeleccionada, color
        });
      }
      limpiarFormulario();
      cargarTareas();
      alert("¡Recordatorio guardado exitosamente!");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar el recordatorio.");
    }
  };

  // ==========================================
  // LÓGICA DE SUBIDA DE ARCHIVOS Y VALIDACIÓN
  // ==========================================
  const handleClickSubir = () => {
    const fechaLimite = new Date(`${tareaSeleccionada.fecha_entrega}T23:59:59`);
    const ahora = new Date();

    if (ahora > fechaLimite) {
      alert("El plazo para entregar esta tarea ha finalizado. La plataforma ha bloqueado la entrega.");
      return;
    }

    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert("Formato no válido. Solo se permiten archivos PDF.");
      e.target.value = null; 
      return;
    }

    try {
      setUploading(true);
      await entregarTareaEstudiante(idUsuario, tareaSeleccionada.id_tarea, file);
      alert("¡Tarea entregada exitosamente!");
      
      // Actualizamos localmente para mostrar el botón verde sin recargar
      setTareaSeleccionada({ ...tareaSeleccionada, entregada: true });
      cargarTareas();
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      alert("Hubo un error al subir el archivo. Intenta de nuevo.");
    } finally {
      setUploading(false);
      e.target.value = null; 
    }
  };

  const irMesAnterior = () => setCurrentDate(new Date(anioActual, mesActual - 1, 1));
  const irMesSiguiente = () => setCurrentDate(new Date(anioActual, mesActual + 1, 1));

  const esSoloLectura = tareaSeleccionada?.tipo === 'Tarea Docente';

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6 animate-fade-in-up font-sans">
      
      <input 
        type="file" 
        accept=".pdf" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      <div className="w-full flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border-l-[6px] border-[#0033a0] mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 m-0">Tareas Pendientes</h2>
          <p className="text-gray-500 m-0 mt-1 font-medium">Revisa tus asignaciones o crea recordatorios personales</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 md:mt-0 px-6 py-2.5 bg-[#0033a0] hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow"
        >
          Volver al Inicio
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-blue-50 p-4 rounded-lg border-l-4 border-[#0033a0] shadow-sm gap-4">
        <div className="flex-1 text-center md:text-left px-2 flex items-center justify-center md:justify-start gap-2">
          <MdLightbulb className="text-lg text-[#0033a0]" />
          <p className="text-[#0033a0] text-sm md:text-base">
            <span className="font-extrabold text-lg mr-2">Ayuda</span>
            Para agregar un recordatorio, <strong className="underline cursor-pointer">haz clic en el día</strong> en el calendario o selecciona la fecha directamente en el formulario lateral.
          </p>
        </div>
      </div>

      <div className="w-full flex flex-col xl:flex-row items-stretch gap-6">

        <div className="flex-1 w-full bg-white rounded-xl shadow-md border border-gray-300 overflow-hidden flex flex-col h-full">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <button onClick={irMesAnterior} className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg font-bold text-gray-600 transition-colors shadow-sm flex items-center gap-2">
              <span className="text-lg">&lt;</span>
              <span className="capitalize hidden sm:inline">{mesAnteriorNombre.toLowerCase()}</span>
            </button>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#0033a0]">
              {nombresMeses[mesActual]} {anioActual}
            </h3>
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
                let tareasDelDia = [];

                if (dia) {
                  const mesFormat = String(mesActual + 1).padStart(2, '0');
                  const diaFormat = String(dia).padStart(2, '0');
                  const fechaCelda = `${anioActual}-${mesFormat}-${diaFormat}`;
                  isSelected = fechaSeleccionada === fechaCelda;
                  tareasDelDia = tareas.filter(t => t.fecha_entrega === fechaCelda);
                }

                return (
                  <div
                    key={index}
                    onClick={() => dia && seleccionarFechaVacia(dia)}
                    className={`
                      p-2 flex flex-col transition-colors overflow-y-auto custom-scrollbar relative
                      ${!dia ? 'bg-gray-100' : 'bg-white hover:bg-blue-50/50 cursor-pointer'}
                      ${esHoy ? 'ring-2 ring-inset ring-[#0033a0] z-10 bg-blue-50' : ''}
                      ${isSelected && !esHoy ? 'ring-2 ring-inset ring-blue-300 bg-blue-50/80 z-10' : ''}
                    `}
                  >
                    {dia && (
                      <span className={`text-sm mb-1 block ${esHoy ? 'font-extrabold text-[#0033a0]' : 'font-bold text-gray-700'}`}>
                        {dia}
                      </span>
                    )}

                    <div className="flex flex-col gap-1 mt-1">
                      {tareasDelDia.map(tarea => {
                        const tailwindColors = {
                          blue: "bg-blue-100 border-blue-300 text-blue-800",
                          green: "bg-green-100 border-green-300 text-green-800",
                          red: "bg-red-100 border-red-300 text-red-800",
                          yellow: "bg-yellow-100 border-yellow-300 text-yellow-800",
                          purple: "bg-purple-100 border-purple-300 text-purple-800"
                        };
                        const estiloColor = tailwindColors[tarea.color] || tailwindColors.blue;

                        return (
                          <div
                            key={tarea.id_tarea}
                            onClick={(e) => seleccionarTareaExistente(tarea, e)}
                            className={`w-full border text-xs px-1.5 py-1 rounded truncate font-bold cursor-pointer hover:opacity-80 transition-opacity ${estiloColor} ${tarea.id_tarea === tareaSeleccionada?.id_tarea ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                            title={tarea.descripcion || tarea.titulo}
                          >
                            {tarea.titulo}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FORMULARIO LATERAL */}
        <div className="w-full xl:w-[350px] shrink-0 bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-6">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <div className="flex items-center gap-3">
              {esSoloLectura ? (
                <MdVisibility className="text-2xl text-gray-600" />
              ) : (
                <MdEdit className="text-2xl text-gray-600" />
              )}
              <h3 className="text-xl font-bold text-gray-800">
                {tareaSeleccionada
                  ? (esSoloLectura ? "Detalle de Tarea" : "Editar Recordatorio")
                  : "Nuevo Recordatorio"}
              </h3>
            </div>
          </div>

          <form onSubmit={handleGuardarTarea} className="flex flex-col gap-5">

            {/* AVISO SUPERIOR PARA TAREAS DEL DOCENTE (Sin botón) */}
            {esSoloLectura && (
              <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-300 text-sm font-bold text-center shadow-sm animate-fade-in-up flex items-center justify-center gap-2">
                <MdLock className="text-lg shrink-0" />
                <span className="text-left">Esta tarea fue asignada por el docente.</span>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-700 font-bold mb-1.5">Título</label>
              <input
                type="text" required placeholder="Ej: Estudiar para Física"
                className={`w-full p-2.5 border border-gray-300 rounded-lg outline-none text-sm transition-colors ${esSoloLectura ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0]'}`}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={esSoloLectura}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 font-bold mb-1.5">Descripción</label>
              <textarea
                rows="3" placeholder="Detalles o apuntes..."
                className={`w-full p-2.5 border border-gray-300 rounded-lg outline-none text-sm transition-colors resize-none ${esSoloLectura ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0]'}`}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={esSoloLectura}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm text-gray-700 font-bold mb-1.5">Fecha de Entrega</label>
              <input
                type="date" required
                className={`w-full p-2.5 border border-gray-300 rounded-lg outline-none text-sm transition-colors ${esSoloLectura ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0] bg-white cursor-pointer'}`}
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                disabled={esSoloLectura}
              />
            </div>

            {/* 👇 NUEVO: SECCIÓN DE SUBIDA O MENSAJE DE ENTREGADO 👇 */}
            {esSoloLectura && (
              <div className="pt-2 border-t border-gray-100">
                {tareaSeleccionada?.entregada ? (
                  <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 text-sm font-bold text-center flex items-center justify-center gap-2">
                    <MdCheckCircle className="text-xl" />
                    <span>Ya has entregado esta tarea</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleClickSubir}
                    disabled={uploading}
                    className="w-full bg-[#0033a0] text-white py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-all shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MdFileUpload className="text-xl" />
                    {uploading ? "Subiendo PDF..." : "Subir Tarea (PDF)"}
                  </button>
                )}
              </div>
            )}

            {!esSoloLectura && (
              <div>
                <label className="block text-sm text-gray-700 font-bold mb-2">Color Etiqueta</label>
                <div className="flex justify-between px-1">
                  {Object.keys(colorStyles).map(c => (
                    <button
                      key={c} type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${color === c ? 'border-gray-800 scale-125' : 'border-transparent'}`}
                      style={{ backgroundColor: colorStyles[c] }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2">
              {!esSoloLectura && (
                <button type="submit" className="w-full bg-[#0033a0] text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-all shadow">
                  {tareaSeleccionada ? "Guardar Cambios" : "Guardar Recordatorio"}
                </button>
              )}

              {tareaSeleccionada && (
                <button
                  type="button"
                  onClick={limpiarFormulario}
                  className="w-full bg-white text-gray-600 border border-gray-300 py-2.5 rounded-lg font-bold hover:bg-gray-100 transition-all"
                >
                  Nuevo Recordatorio
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}