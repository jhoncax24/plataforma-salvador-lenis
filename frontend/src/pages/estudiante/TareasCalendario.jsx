import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Asegúrate de que esta ruta apunte bien a tu archivo de API
import { obtenerTareasEstudiante, guardarRecordatorio, actualizarRecordatorio } from "../../api/perfilApi"; 

export default function TareasCalendario() {
  const navigate = useNavigate();
  
  // ==========================================
  // ESTADOS DEL COMPONENTE
  // ==========================================
  const [tareas, setTareas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para el formulario del Modal
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [color, setColor] = useState("blue");
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null); // 👈 NUEVO ESTADO

  // Usuario activo
  const userStr = localStorage.getItem("cesl_user");
  const user = userStr ? JSON.parse(userStr) : null;
  const idUsuario = user?.id_usuario || user?.id;

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
  // LÓGICA DEL CALENDARIO (Mes Actual)
  // ==========================================
  const fechaHoy = new Date();
  const mesActual = fechaHoy.getMonth();
  const anioActual = fechaHoy.getFullYear();

  const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const diasEnElMes = new Date(anioActual, mesActual + 1, 0).getDate();
  const primerDiaDelMes = new Date(anioActual, mesActual, 1).getDay();
  const inicioSemana = primerDiaDelMes === 0 ? 6 : primerDiaDelMes - 1;

  const diasArray = Array.from({ length: diasEnElMes }, (_, i) => i + 1);
  const celdasVacias = Array.from({ length: inicioSemana }, () => null);
  const cuadricula = [...celdasVacias, ...diasArray];

  // ==========================================
  // FUNCIONES DEL MODAL Y GUARDADO
  // ==========================================
  const abrirModal = (dia = null) => {
    if (dia) {
      const mesFormateado = String(mesActual + 1).padStart(2, '0');
      const diaFormateado = String(dia).padStart(2, '0');
      setFechaSeleccionada(`${anioActual}-${mesFormateado}-${diaFormateado}`);
    } else {
      setFechaSeleccionada("");
    }
    // Limpiamos el formulario
    setTareaSeleccionada(null); // 👈 Limpiar al crear uno nuevo
    setTitulo("");
    setDescripcion("");
    setColor("blue");
    setIsModalOpen(true);
  };

  const abrirModalParaEditar = (tarea, e) => {
    e.stopPropagation(); // Evita dar clic en el fondo de la celda
    setTareaSeleccionada(tarea);
    setTitulo(tarea.titulo);
    setDescripcion(tarea.descripcion || "");
    setFechaSeleccionada(tarea.fecha_entrega);
    setColor(tarea.color || "blue");
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setTareaSeleccionada(null); // 👈 Limpiar al crear uno nuevo
  };

  const handleGuardarTarea = async () => {
    if (!titulo || !fechaSeleccionada) {
      alert("Por favor ingresa al menos un título y una fecha.");
      return;
    }

    try {
      if (tareaSeleccionada) {
        // MODO EDICIÓN
        await actualizarRecordatorio(tareaSeleccionada.id_tarea, {
          titulo, descripcion, fecha_entrega: fechaSeleccionada, color
        });
      } else {
        // MODO CREACIÓN
        await guardarRecordatorio(idUsuario, {
          titulo, descripcion, fecha_entrega: fechaSeleccionada, color
        });
      }
      cerrarModal();
      cargarTareas(); 
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar el recordatorio.");
    }
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl shadow-md p-6 md:p-8 animate-fade-in-up">

      {/* TÍTULO */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[#0033a0]">Tareas Pendientes</h2>
      </div>

      {/* BANNER TIP + BOTÓN VOLVER */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-center mb-8 bg-blue-50 p-4 rounded-lg border-l-4 border-[#0033a0] shadow-sm gap-4">
        <div className="flex-1 text-center md:text-left px-2">
          <p className="text-[#0033a0] text-sm md:text-base">
            <span className="font-extrabold text-lg mr-2">💡 Tip:</span>
            Para agregar un recordatorio, <strong className="underline cursor-pointer">haz clic en el día</strong> que deseas añadirlo o usa el botón del calendario.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#0033a0] text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 transition-all shadow hover:shadow-lg whitespace-nowrap"
        >
          Volver al Menú
        </button>
      </div>

      {/* CONTENEDOR DEL CALENDARIO */}
      <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Cabecera del mes */}
        <div className="bg-gray-50 flex justify-between items-center p-4 border-b-2 border-gray-200">
          <h3 className="text-2xl font-bold text-[#0033a0]">
            {nombresMeses[mesActual]} {anioActual}
          </h3>
          <button
            onClick={() => abrirModal(null)}
            className="bg-[#0033a0] text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-800 transition-all shadow-sm"
          >
            Añadir Recordatorio
          </button>
        </div>

        {/* Cuadrícula */}
        <div className="p-1">
          <div className="grid grid-cols-7 text-center font-bold text-gray-700 py-3 bg-white border-b border-gray-200">
            {diasSemana.map(dia => (
              <div key={dia}>{dia}</div>
            ))}
          </div>

         <div className="grid grid-cols-7 auto-rows-[85px] gap-px bg-gray-200 border border-gray-200">
            {cuadricula.map((dia, index) => {
              
              // 👇 NUEVO: Verificamos matemáticamente si la celda actual es el día de hoy
              const esHoy = dia === fechaHoy.getDate(); 

              // Buscamos si hay tareas para este día específico
              let tareasDelDia = [];
              if (dia) {
                const mesFormateado = String(mesActual + 1).padStart(2, '0');
                const diaFormateado = String(dia).padStart(2, '0');
                const fechaCelda = `${anioActual}-${mesFormateado}-${diaFormateado}`;
                tareasDelDia = tareas.filter(t => t.fecha_entrega === fechaCelda);
              }

              return (
                <div
                  key={index}
                  onClick={() => dia && abrirModal(dia)}
                  // 👇 Si esHoy es verdadero, le ponemos fondo claro (bg-blue-50) y un borde interno grueso oscuro (ring-2 ring-[#0033a0])
                  className={`p-2 relative transition-all duration-200 overflow-y-auto custom-scrollbar
                    ${!dia ? 'bg-gray-100' : 
                      esHoy ? 'bg-blue-50 ring-2 ring-inset ring-[#0033a0] z-10 cursor-pointer' 
                            : 'bg-white hover:bg-gray-50 cursor-pointer'
                    }`}
                >
                 {dia && (
                    <span className={`text-sm mb-1 block 
                      ${esHoy ? 'font-extrabold text-[#0033a0]' : 'font-semibold text-gray-700'}`}>
                      {dia}
                    </span>
                  )}

                  {/* Renderizado de Tareas/Recordatorios guardados */}
                  <div className="flex flex-col gap-1 mt-1">
                    {tareasDelDia.map(tarea => {
                      const colorEstilos = {
                        green: "bg-green-100 border-green-300 text-green-800",
                        yellow: "bg-yellow-100 border-yellow-300 text-yellow-800",
                        blue: "bg-blue-100 border-blue-300 text-blue-800",
                        red: "bg-red-100 border-red-300 text-red-800",
                        purple: "bg-purple-100 border-purple-300 text-purple-800",
                      };
                      const claseColor = colorEstilos[tarea.color] || colorEstilos.blue;

                      return (
                        <div 
                          key={tarea.id_tarea} 
                          title={tarea.descripcion}
                          className={`text-xs px-1.5 py-0.5 border rounded truncate shadow-sm font-medium cursor-help ${claseColor}`}
                          onClick={(e) => abrirModalParaEditar(tarea, e)}
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

     {/* ========================================== */}
      {/* MODAL CON FORMULARIO SEGURO                */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in-up">
          {/* Evitamos que el clic dentro del modal lo cierre */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border-2 border-gray-200" onClick={(e) => e.stopPropagation()}>

            {/* Inyectamos la lógica de seguridad aquí */}
            {(() => {
              // Variable mágica para saber si bloqueamos todo
              const esSoloLectura = tareaSeleccionada?.tipo === 'Tarea Docente';

              return (
                <>
                  <div className="bg-[#0033a0] p-4 text-center">
                    <h2 className="text-xl font-bold text-white">
                      {tareaSeleccionada 
                        ? (esSoloLectura ? "Detalle de Tarea Docente" : "Editar Recordatorio") 
                        : "Añadir Recordatorio"}
                    </h2>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Mensaje de advertencia si es del docente */}
                    {esSoloLectura && (
                      <div className="bg-yellow-50 text-yellow-800 p-3 rounded border border-yellow-300 text-sm font-bold text-center mb-4 shadow-sm">
                        🔒 Esta tarea fue asignada por un docente. Solo puedes verla.
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Título:</label>
                      <input
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        disabled={esSoloLectura}
                        className={`w-full border-2 border-gray-200 rounded-lg p-2.5 focus:outline-none transition-colors ${esSoloLectura ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:border-[#0033a0]'}`}
                        placeholder="Ej: Examen de Matemáticas"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Descripción:</label>
                      <textarea
                        rows="3"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        disabled={esSoloLectura}
                        className={`w-full border-2 border-gray-200 rounded-lg p-2.5 focus:outline-none transition-colors resize-none ${esSoloLectura ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:border-[#0033a0]'}`}
                        placeholder="Detalles de la tarea..."
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Fecha de Entrega:</label>
                      <input
                        type="date"
                        value={fechaSeleccionada}
                        onChange={(e) => setFechaSeleccionada(e.target.value)}
                        disabled={esSoloLectura}
                        className={`w-full border-2 border-gray-200 rounded-lg p-2.5 focus:outline-none transition-colors font-medium ${esSoloLectura ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:border-[#0033a0] text-gray-700'}`}
                      />
                    </div>

                    {/* Selector de color: LO OCULTAMOS si es tarea del docente */}
                    {!esSoloLectura && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Color de la etiqueta:</label>
                        <div className="flex gap-3">
                          {['blue', 'green', 'yellow', 'red', 'purple'].map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setColor(c)}
                              className={`w-8 h-8 rounded-full border-2 transition-all shadow-sm
                                ${c === 'blue' ? 'bg-blue-400 border-blue-600' : ''}
                                ${c === 'green' ? 'bg-green-400 border-green-600' : ''}
                                ${c === 'yellow' ? 'bg-yellow-400 border-yellow-600' : ''}
                                ${c === 'red' ? 'bg-red-400 border-red-600' : ''}
                                ${c === 'purple' ? 'bg-purple-400 border-purple-600' : ''}
                                ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'opacity-70 hover:opacity-100'}
                              `}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-end gap-3">
                    <button
                      onClick={cerrarModal}
                      className="bg-white border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                    >
                      {esSoloLectura ? "Cerrar" : "Cancelar"}
                    </button>
                    {/* El botón de guardar desaparece si es solo lectura */}
                    {!esSoloLectura && (
                      <button
                        onClick={handleGuardarTarea}
                        className="bg-[#0033a0] text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-md"
                      >
                        {tareaSeleccionada ? "Guardar Cambios" : "Guardar"}
                      </button>
                    )}
                  </div>
                </>
              );
            })()}

          </div>
        </div>
      )}

    </div>
  );
}