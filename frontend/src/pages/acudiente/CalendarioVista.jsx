import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerEventos, guardarEventoBD, eliminarEventoBD } from "../../api/perfilApi";

export default function CalendarioVista() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const userStr = localStorage.getItem("cesl_user");
  const user = userStr ? JSON.parse(userStr) : null;
  const idAcudiente = user?.id || 3;

  const [eventosGuardados, setEventosGuardados] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: "", descripcion: "", fecha: "", hora: "07:00", color: "blue"
  });

  const colorStyles = { blue: "#0033a0", green: "#20c997", red: "#dc3545", yellow: "#ffc107", purple: "#6f42c1" };

  useEffect(() => { cargarEventos(); }, [idAcudiente]);

  const cargarEventos = async () => {
    try {
      const data = await obtenerEventos(idAcudiente);
      setEventosGuardados(data);
    } catch (error) {
      console.error(error);
    }
  };

  const seleccionarFechaVacia = (dia) => {
    const mesFormateado = String(mesActual + 1).padStart(2, '0');
    const diaFormateado = String(dia).padStart(2, '0');
    setNuevoEvento({ ...nuevoEvento, fecha: `${anioActual}-${mesFormateado}-${diaFormateado}` });
    setEventoSeleccionado(null);
    setNuevoEvento(prev => ({ ...prev, titulo: "", descripcion: "", hora: "07:00", color: "blue" }));
  };

  const seleccionarEventoExistente = (evento, e) => {
    e.stopPropagation(); 
    setEventoSeleccionado(evento);
    const colorLimpio = evento.color.replace('bg-', '').replace('-500', '');
    const fechaD = new Date(evento.fecha);
    const fechaFormat = `${fechaD.getUTCFullYear()}-${String(fechaD.getUTCMonth() + 1).padStart(2, '0')}-${String(fechaD.getUTCDate()).padStart(2, '0')}`;

    setNuevoEvento({
      titulo: evento.titulo,
      descripcion: evento.descripcion || "",
      fecha: fechaFormat,
      hora: evento.hora || "07:00",
      color: colorLimpio
    });
  };

  const limpiarFormulario = () => {
    setEventoSeleccionado(null);
    setNuevoEvento({ titulo: "", descripcion: "", fecha: "", hora: "07:00", color: "blue" });
  };

  const handleGuardar = async (e) => {
    e.preventDefault(); 
    try {
      if (eventoSeleccionado) await eliminarEventoBD(eventoSeleccionado.id_evento);
      await guardarEventoBD({
        id_acudiente: idAcudiente, fecha: nuevoEvento.fecha, titulo: nuevoEvento.titulo,
        descripcion: nuevoEvento.descripcion, hora: nuevoEvento.hora, color: `bg-${nuevoEvento.color}-500`
      });
      alert("¡Recordatorio guardado!");
      limpiarFormulario();
      cargarEventos();
    } catch (error) { alert("Hubo un error al guardar el evento."); }
  };

  const handleEliminar = async () => {
    if (!eventoSeleccionado) return;
    if (!window.confirm("¿Seguro que deseas eliminar este evento?")) return;
    try {
      await eliminarEventoBD(eventoSeleccionado.id_evento);
      alert("Evento eliminado.");
      limpiarFormulario();
      cargarEventos();
    } catch (error) { alert("Error al eliminar."); }
  };

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
    <div className="w-full min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6 animate-fade-in-up font-sans flex flex-col">
      
      {/* HEADER */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 sm:p-6 rounded-xl shadow-sm border-l-[6px] border-[#0033a0] mb-4 sm:mb-6 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 m-0">Calendario Escolar</h2>
          <p className="text-sm sm:text-base text-gray-500 m-0 mt-1 font-medium">Gestiona tus recordatorios, reuniones y eventos personales</p>
        </div>
        <button onClick={() => navigate(-1)} className="w-full sm:w-auto mt-2 sm:mt-0 px-6 py-3 sm:py-2.5 bg-[#0033a0] hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow text-center">
          Volver al Inicio
        </button>
      </div>

      <div className="w-full flex flex-col xl:flex-row items-stretch gap-4 sm:gap-6 flex-1">
        
        {/* CALENDARIO GIGANTE */}
        <div className="flex-1 w-full bg-white rounded-xl shadow-md border border-gray-300 overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-3 sm:p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <button onClick={irMesAnterior} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg font-bold text-gray-600 transition-colors shadow-sm flex items-center gap-1 sm:gap-2">
              <span className="text-base sm:text-lg">&lt;</span>
              <span className="capitalize hidden sm:inline">{mesAnteriorNombre.toLowerCase()}</span>
            </button>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0033a0] text-center px-2">{nombresMeses[mesActual]} {anioActual}</h3>
            <button onClick={irMesSiguiente} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg font-bold text-gray-600 transition-colors shadow-sm flex items-center gap-1 sm:gap-2">
              <span className="capitalize hidden sm:inline">{mesSiguienteNombre.toLowerCase()}</span>
              <span className="text-base sm:text-lg">&gt;</span>
            </button>
          </div>

          <div className="grid grid-cols-7 bg-white border-b border-gray-200">
            {diasSemana.map(d => (
              <div key={d} className="py-2 sm:py-3 text-center font-bold text-gray-700 text-[10px] sm:text-xs md:text-sm uppercase">{d}</div>
            ))}
          </div>

          <div className="flex-1 overflow-auto bg-gray-200">
            <div className="grid grid-cols-7 auto-rows-[90px] sm:auto-rows-[120px] gap-px">
              {cuadricula.map((dia, index) => {
                const esHoy = esMesActual && dia === fechaHoy.getDate();
                let isSelected = false;
                const mesFormat = String(mesActual + 1).padStart(2, '0');
                const diaFormat = String(dia).padStart(2, '0');
                const fechaCelda = `${anioActual}-${mesFormat}-${diaFormat}`;
                if (dia) isSelected = nuevoEvento.fecha === fechaCelda;

                return (
                  <div 
                    key={index} onClick={() => dia && seleccionarFechaVacia(dia)} 
                    className={`p-1 sm:p-2 flex flex-col transition-colors overflow-y-auto custom-scrollbar relative ${!dia ? 'bg-gray-100' : 'bg-white hover:bg-blue-50/50 cursor-pointer'} ${esHoy ? 'ring-2 ring-inset ring-[#0033a0] z-10 bg-blue-50' : ''} ${isSelected && !esHoy ? 'ring-2 ring-inset ring-blue-300 bg-blue-50/80 z-10' : ''}`}
                  >
                    {dia && <span className={`text-xs sm:text-sm mb-1 block ${esHoy ? 'font-extrabold text-[#0033a0]' : 'font-bold text-gray-700'}`}>{dia}</span>}
                    
                    <div className="flex flex-col gap-0.5 sm:gap-1 mt-0 sm:mt-1">
                      {(() => {
                        if (!dia) return null;
                        const eventosDelDia = eventosGuardados.filter(ev => {
                          const f = new Date(ev.fecha);
                          return `${f.getUTCFullYear()}-${String(f.getUTCMonth() + 1).padStart(2, '0')}-${String(f.getUTCDate()).padStart(2, '0')}` === fechaCelda;
                        });
                        return eventosDelDia.map(evento => {
                           const tc = { blue: "bg-blue-100 border-blue-300 text-blue-800", green: "bg-green-100 border-green-300 text-green-800", red: "bg-red-100 border-red-300 text-red-800", yellow: "bg-yellow-100 border-yellow-300 text-yellow-800", purple: "bg-purple-100 border-purple-300 text-purple-800" };
                           const colorKey = evento.color.replace('bg-', '').replace('-500', '');
                           const estiloColor = tc[colorKey] || tc.blue;
                           return (
                             <div 
                               key={evento.id_evento} onClick={(e) => seleccionarEventoExistente(evento, e)}
                               className={`w-full border text-[9px] sm:text-xs px-1 sm:px-1.5 py-0.5 sm:py-1 rounded truncate font-bold cursor-pointer hover:opacity-80 transition-opacity flex justify-between ${estiloColor} ${evento.id_evento === eventoSeleccionado?.id_evento ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`} 
                             >
                               <span className="truncate">{evento.titulo}</span>
                               <span className="opacity-70 text-[8px] sm:text-[10px] ml-0.5 sm:ml-1 hidden sm:inline">{evento.hora ? evento.hora.substring(0,5) : ''}</span>
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
        <div className="w-full xl:w-[350px] shrink-0 bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-6 h-fit mt-4 xl:mt-0">
          <div className="flex items-center gap-3 mb-4 sm:mb-6 border-b pb-4">
            <span className="text-xl sm:text-2xl">{eventoSeleccionado ? "✏️" : "📝"}</span>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
              {eventoSeleccionado ? "Editar Evento" : "Agregar Evento"}
            </h3>
          </div>
          
          <form onSubmit={handleGuardar} className="flex flex-col gap-3 sm:gap-4">
            
            <div>
              <label className="block text-xs sm:text-sm text-gray-700 font-bold mb-1 sm:mb-1.5">Título del Evento</label>
              <input type="text" required placeholder="Ej: Reunión escolar" className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0] outline-none text-sm" value={nuevoEvento.titulo} onChange={(e) => setNuevoEvento({...nuevoEvento, titulo: e.target.value})} />
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-700 font-bold mb-1 sm:mb-1.5">Descripción</label>
              <textarea rows="2" placeholder="Detalles adicionales..." className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0] outline-none text-sm resize-none" value={nuevoEvento.descripcion} onChange={(e) => setNuevoEvento({...nuevoEvento, descripcion: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm text-gray-700 font-bold mb-1 sm:mb-1.5">Fecha</label>
                <input type="date" required className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:border-[#0033a0] outline-none text-sm" value={nuevoEvento.fecha} onChange={(e) => setNuevoEvento({...nuevoEvento, fecha: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-gray-700 font-bold mb-1 sm:mb-1.5">Hora</label>
                <input type="time" required className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:border-[#0033a0] outline-none text-sm" value={nuevoEvento.hora} onChange={(e) => setNuevoEvento({...nuevoEvento, hora: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-700 font-bold mb-2 sm:mb-2 mt-1 sm:mt-2">Color Etiqueta</label>
              <div className="flex justify-between px-1">
                {Object.keys(colorStyles).map(c => (
                  <button key={c} type="button" onClick={() => setNuevoEvento({...nuevoEvento, color: c})} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${nuevoEvento.color === c ? 'border-gray-800 scale-110 sm:scale-125' : 'border-transparent'}`} style={{ backgroundColor: colorStyles[c] }} />
                ))}
              </div>
            </div>

            <div className="mt-2 sm:mt-4 flex flex-col gap-2 border-t pt-4">
              <button type="submit" className="w-full bg-[#0033a0] text-white py-3 sm:py-3.5 rounded-lg font-bold hover:bg-blue-800 transition-all shadow text-sm sm:text-base">
                {eventoSeleccionado ? "Actualizar Evento" : "Guardar Evento"}
              </button>
              
              {eventoSeleccionado && (
                <>
                  <button type="button" onClick={handleEliminar} className="w-full bg-white text-red-600 border border-red-200 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-red-50 transition-all text-sm sm:text-base">
                    Eliminar Evento
                  </button>
                  <button type="button" onClick={limpiarFormulario} className="w-full bg-gray-100 text-gray-600 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition-all text-xs sm:text-sm mt-1 sm:mt-2">
                    Cancelar Selección
                  </button>
                </>
              )}
            </div>
            
          </form>
        </div>

      </div>
    </div>
  );
}