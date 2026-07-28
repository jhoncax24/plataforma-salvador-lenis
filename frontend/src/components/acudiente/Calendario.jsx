import { useState, useEffect } from "react";
import { obtenerEventos, guardarEventoBD, eliminarEventoBD } from "../../api/perfilApi";
import { MdWarning, MdCheckCircle, MdLightbulb, MdChevronRight, MdEdit, MdLogout } from "react-icons/md";

export default function Calendario({ idAcudiente }) {
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [eventos, setEventos] = useState({}); 
  const [modalAbierto, setModalAbierto] = useState(false);
  const [vistaModal, setVistaModal] = useState("lista"); 
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [eventosDelDiaSeleccionado, setEventosDelDiaSeleccionado] = useState([]);
  
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [nuevaHora, setNuevaHora] = useState("07:00"); 
  const [nuevoColor, setNuevoColor] = useState("blue");

  const cargarEventos = async () => {
    if (!idAcudiente) return;
    try {
      const data = await obtenerEventos(idAcudiente);
      const formatoEventos = {};
      data.forEach(ev => {
        const fechaD = new Date(ev.fecha);
        const dateKey = `${fechaD.getUTCFullYear()}-${fechaD.getUTCMonth()}-${fechaD.getUTCDate()}`;
        if (!formatoEventos[dateKey]) formatoEventos[dateKey] = [];
        const colorLimpio = ev.color.replace('bg-', '').replace('-500', '');
        formatoEventos[dateKey].push({ id: ev.id_evento, titulo: ev.titulo, desc: ev.descripcion, hora: ev.hora, color: colorLimpio });
      });
      setEventos(formatoEventos);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { cargarEventos(); }, [idAcudiente, mes, anio]);

  const handleDiaClick = (dia) => {
    if (!dia) return; 
    const dateKey = `${anio}-${mes}-${dia}`;
    const existentes = eventos[dateKey] || [];
    setDiaSeleccionado(new Date(anio, mes, dia));
    setEventosDelDiaSeleccionado(existentes);
    setVistaModal(existentes.length > 0 ? "lista" : "crear");
    setModalAbierto(true);
  };

  const guardarEvento = async () => {
    if (!nuevoTitulo.trim()) return alert("Ingresa un título");
    try {
      const mesStr = String(diaSeleccionado.getMonth() + 1).padStart(2, '0');
      const diaStr = String(diaSeleccionado.getDate()).padStart(2, '0');
      const fechaBD = `${diaSeleccionado.getFullYear()}-${mesStr}-${diaStr}`;
      await guardarEventoBD({ id_acudiente: idAcudiente, fecha: fechaBD, titulo: nuevoTitulo, descripcion: nuevaDescripcion, color: `bg-${nuevoColor}-500`, hora: nuevaHora });
      await cargarEventos();
      cerrarModal();
    } catch (err) { alert("Error al guardar"); }
  };

  const borrarEvento = async (id) => {
    if (!window.confirm("¿Borrar recordatorio?")) return;
    await eliminarEventoBD(id);
    await cargarEventos();
    setModalAbierto(false);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setNuevoTitulo(""); setNuevaDescripcion(""); setNuevaHora("07:00");
  };

  const primerDia = new Date(anio, mes, 1).getDay();
  const inicioSemana = primerDia === 0 ? 6 : primerDia - 1; 
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const celdasVacias = Array.from({ length: inicioSemana }, () => null);
  const diasArray = Array.from({ length: diasEnMes }, (_, i) => i + 1);
  const cuadricula = [...celdasVacias, ...diasArray];

  return (
    <div className="flex flex-col h-full relative bg-white">
      
      <div className="bg-gray-50 flex justify-between items-center p-3 sm:p-4 border-b-2 border-gray-200">
        <button onClick={() => setMes(mes === 0 ? 11 : mes - 1)} className="text-[#0033a0] hover:bg-gray-200 px-3 py-1.5 rounded transition-colors font-bold text-lg sm:text-xl">◀</button>
        <h3 className="text-lg sm:text-xl font-bold text-[#0033a0]">
          {meses[mes]} {anio}
        </h3>
        <button onClick={() => setMes(mes === 11 ? 0 : mes + 1)} className="text-[#0033a0] hover:bg-gray-200 px-3 py-1.5 rounded transition-colors font-bold text-lg sm:text-xl">▶</button>
      </div>

      <div className="grid grid-cols-7 text-center font-bold text-gray-700 py-1.5 sm:py-2 bg-white border-b border-gray-200 text-[10px] sm:text-xs">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(dia => (
          <div key={dia}>{dia}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 gap-px bg-gray-200 border-b border-gray-200">
        {cuadricula.map((dia, index) => {
          const dateKey = dia ? `${anio}-${mes}-${dia}` : null;
          const evs = eventos[dateKey] || [];
          const esHoy = dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear();

          return (
            <div
              key={index} onClick={() => handleDiaClick(dia)}
              className={`relative p-0.5 sm:p-1 transition-all duration-200 flex flex-col items-center overflow-y-auto custom-scrollbar
                ${!dia ? 'bg-gray-100' : esHoy ? 'bg-blue-50 ring-2 ring-inset ring-[#0033a0] z-10 cursor-pointer' : 'bg-white hover:bg-gray-50 cursor-pointer'}`}
            >
              {dia && (
                <span className={`text-[10px] sm:text-xs block mb-0.5 sm:mb-1 
                  ${esHoy ? 'font-extrabold text-[#0033a0]' : 'font-semibold text-gray-700'}`}>
                  {dia}
                </span>
              )}

              <div className="flex flex-col gap-[1px] sm:gap-0.5 w-full">
                {evs.map((tarea, idx) => {
                  const colorEstilos = { green: "bg-green-100 border-green-300 text-green-800", yellow: "bg-yellow-100 border-yellow-300 text-yellow-800", blue: "bg-blue-100 border-blue-300 text-blue-800", red: "bg-red-100 border-red-300 text-red-800", purple: "bg-purple-100 border-purple-300 text-purple-800" };
                  const claseColor = colorEstilos[tarea.color] || colorEstilos.blue;
                  return (
                    <div 
                      key={idx} title={tarea.titulo}
                      className={`text-[7px] sm:text-[9px] leading-tight px-0.5 sm:px-1 py-0.5 border rounded truncate shadow-sm font-medium text-center ${claseColor}`}
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

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-end sm:items-center z-[100] sm:p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white w-full h-[90vh] sm:h-auto sm:max-w-md border-t-2 sm:border-2 border-gray-200 overflow-hidden flex flex-col rounded-t-2xl sm:rounded-xl">
            
            <div className="bg-[#0033a0] p-4 flex justify-between items-center text-white shrink-0">
              <h3 className="text-base sm:text-lg font-bold">{vistaModal === "lista" ? "Tus Recordatorios" : "Nuevo Recordatorio"}</h3>
              <button onClick={cerrarModal} className="text-white hover:text-red-300 font-bold text-2xl sm:text-xl leading-none">&times;</button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
              {vistaModal === "lista" ? (
                <div className="space-y-4">
                  {eventosDelDiaSeleccionado.map(ev => (
                    <div key={ev.id} className="p-3 sm:p-4 border sm:border-2 border-gray-200 sm:border-gray-100 rounded-lg bg-gray-50 flex justify-between items-start hover:border-blue-200 transition-colors shadow-sm sm:shadow-none">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <div className={`w-3 h-3 rounded-full bg-${ev.color}-500 shrink-0`}></div>
                           <p className="font-bold text-[#0033a0] text-sm sm:text-base break-words">{ev.titulo}</p>
                        </div>
                        <p className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-1 ml-5">Hora: {ev.hora ? ev.hora.substring(0,5) : "Sin hora"}</p>
                        <p className="text-xs sm:text-sm text-gray-700 ml-5 break-words">{ev.desc}</p>
                      </div>
                      <button onClick={() => borrarEvento(ev.id)} className="text-red-500 hover:text-red-700 p-2 sm:p-1 hover:bg-red-50 rounded text-lg sm:text-base" title="Borrar">🗑️</button>
                    </div>
                  ))}
                  <button onClick={() => setVistaModal("crear")} className="w-full bg-[#0033a0] text-white py-3 sm:py-2.5 rounded-lg font-bold hover:bg-blue-800 shadow-md transition-all text-sm sm:text-base mt-2">+ Añadir a este día</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Título:</label>
                    <input type="text" placeholder="Ej: Reunión" value={nuevoTitulo} onChange={e => setNuevoTitulo(e.target.value)} className="w-full border sm:border-2 border-gray-300 sm:border-gray-200 rounded-lg p-3 sm:p-2.5 focus:outline-none focus:border-[#0033a0] text-sm sm:text-base" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Descripción:</label>
                    <textarea placeholder="Detalles..." value={nuevaDescripcion} onChange={e => setNuevaDescripcion(e.target.value)} className="w-full border sm:border-2 border-gray-300 sm:border-gray-200 rounded-lg p-3 sm:p-2.5 focus:outline-none focus:border-[#0033a0] resize-none text-sm sm:text-base" rows="3" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Hora:</label>
                        <input type="time" value={nuevaHora} onChange={e => setNuevaHora(e.target.value)} className="w-full border sm:border-2 border-gray-300 sm:border-gray-200 rounded-lg p-3 sm:p-2.5 focus:outline-none focus:border-[#0033a0] text-sm sm:text-base bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Etiqueta:</label>
                      <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-3 justify-center sm:justify-start">
                          {['blue', 'green', 'yellow', 'red', 'purple'].map(c => (
                            <button
                              key={c} type="button" onClick={() => setNuevoColor(c)}
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all shadow-sm
                                ${c === 'blue' ? 'bg-blue-400 border-blue-600' : ''}
                                ${c === 'green' ? 'bg-green-400 border-green-600' : ''}
                                ${c === 'yellow' ? 'bg-yellow-400 border-yellow-600' : ''}
                                ${c === 'red' ? 'bg-red-400 border-red-600' : ''}
                                ${c === 'purple' ? 'bg-purple-400 border-purple-600' : ''}
                                ${nuevoColor === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'opacity-70 hover:opacity-100'}
                              `}
                            />
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-6 sm:pt-4 border-t border-gray-100 mt-4">
                    <button onClick={() => setVistaModal(eventosDelDiaSeleccionado.length > 0 ? "lista" : "cerrar")} className="w-full sm:w-1/3 bg-gray-100 sm:bg-gray-200 text-gray-700 py-3 sm:py-2.5 rounded-lg font-bold hover:bg-gray-300 text-sm sm:text-base order-2 sm:order-1">
                      Volver
                    </button>
                    <button onClick={guardarEvento} className="w-full sm:flex-1 bg-[#0033a0] text-white py-3 sm:py-2.5 rounded-lg font-bold hover:bg-blue-800 shadow-md text-sm sm:text-base order-1 sm:order-2">
                      Guardar Evento
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}