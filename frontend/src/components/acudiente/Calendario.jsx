import { useState, useEffect } from "react";
import { obtenerEventos, guardarEventoBD, eliminarEventoBD } from "../../api/perfilApi";

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
  
  // Campos del formulario
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [nuevaHora, setNuevaHora] = useState("07:00"); // Hora por defecto
  const [nuevoColor, setNuevoColor] = useState("bg-blue-500");

  const cargarEventos = async () => {
    if (!idAcudiente) return;
    try {
      const data = await obtenerEventos(idAcudiente);
      const formatoEventos = {};
      data.forEach(ev => {
        const fechaD = new Date(ev.fecha);
        const dateKey = `${fechaD.getUTCFullYear()}-${fechaD.getUTCMonth()}-${fechaD.getUTCDate()}`;
        if (!formatoEventos[dateKey]) formatoEventos[dateKey] = [];
        formatoEventos[dateKey].push({ 
            id: ev.id_evento, 
            titulo: ev.titulo, 
            desc: ev.descripcion, 
            hora: ev.hora, 
            color: ev.color 
        });
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

      await guardarEventoBD({
        id_acudiente: idAcudiente, fecha: fechaBD, titulo: nuevoTitulo, 
        descripcion: nuevaDescripcion, color: nuevoColor, hora: nuevaHora
      });

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

  // Lógica de renderizado de días (simplificada)
  const primerDia = new Date(anio, mes, 1).getDay();
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const diasCalendario = Array(primerDia).fill(null).concat(Array.from({length: diasEnMes}, (_, i) => i + 1));

  return (
    <div className="border-2 border-gray-700 p-6 bg-gray-100 h-full relative">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setMes(mes === 0 ? 11 : mes - 1)} className="bg-blue-800 text-white px-3 py-1 rounded">◀</button>
        <h2 className="text-lg font-semibold">{meses[mes]} {anio}</h2>
        <button onClick={() => setMes(mes === 11 ? 0 : mes + 1)} className="bg-blue-800 text-white px-3 py-1 rounded">▶</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"].map(d => <div key={d} className="font-bold text-xs">{d}</div>)}
        {diasCalendario.map((dia, i) => {
          const dateKey = dia ? `${anio}-${mes}-${dia}` : null;
          const evs = eventos[dateKey] || [];
          return (
            <div key={i} onClick={() => handleDiaClick(dia)} className={`p-1 min-h-[3rem] border bg-white rounded cursor-pointer hover:bg-blue-50`}>
              <span className="text-xs">{dia}</span>
              <div className="flex flex-wrap gap-1 justify-center">
                {evs.map((e, idx) => <div key={idx} className={`w-2 h-2 rounded-full ${e.color}`}></div>)}
              </div>
            </div>
          );
        })}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4">{vistaModal === "lista" ? "Tus Recordatorios" : "Nuevo Recordatorio"}</h3>

            {vistaModal === "lista" ? (
              <div className="space-y-3">
                {eventosDelDiaSeleccionado.map(ev => (
                  <div key={ev.id} className="p-3 border rounded bg-gray-50 flex justify-between items-center">
                    <div>
                     <p className="font-bold text-blue-900">{ev.titulo} <span className="font-normal text-gray-500 ml-1">- {ev.hora ? ev.hora.substring(0,5) : "Sin hora"}</span></p>
                      <p className="text-sm text-gray-600">{ev.desc}</p>
                    </div>
                    <button onClick={() => borrarEvento(ev.id)} className="text-red-500">🗑️</button>
                  </div>
                ))}
                <button onClick={() => setVistaModal("crear")} className="w-full bg-blue-800 text-white py-2 rounded">+ Agregar</button>
                <button onClick={cerrarModal} className="w-full text-gray-500 py-1">Cerrar</button>
              </div>
            ) : (
              <div className="space-y-4">
                <input type="text" placeholder="Título" value={nuevoTitulo} onChange={e => setNuevoTitulo(e.target.value)} className="w-full border p-2 rounded" />
                <textarea placeholder="Descripción" value={nuevaDescripcion} onChange={e => setNuevaDescripcion(e.target.value)} className="w-full border p-2 rounded" />
                <div className="flex items-center gap-2">
                    <label className="text-sm font-bold">Hora:</label>
                    <input type="time" value={nuevaHora} onChange={e => setNuevaHora(e.target.value)} className="border p-1 rounded" />
                </div>
                <div className="flex gap-2">
                    {["bg-blue-500", "bg-red-500", "bg-green-500", "bg-yellow-500"].map(c => (
                        <div key={c} onClick={() => setNuevoColor(c)} className={`w-6 h-6 rounded-full cursor-pointer ${c} ${nuevoColor === c ? 'ring-2 ring-black' : ''}`}></div>
                    ))}
                </div>
                <button onClick={guardarEvento} className="w-full bg-blue-800 text-white py-2 rounded">Guardar</button>
                <button onClick={() => setVistaModal("lista")} className="w-full text-gray-500">Volver</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}