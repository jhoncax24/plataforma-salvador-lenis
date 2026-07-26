import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Importamos un ícono que haga juego con el diseño del otro panel
import { MdEventAvailable } from "react-icons/md";
// IMPORTANTE: Asegúrate de que la ruta de importación coincida con tu estructura
import { obtenerTareasDocente } from "../../api/perfilApi"; 

export default function CalendarioCard() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [tasks, setTasks] = useState([]);
  
  const userStr = localStorage.getItem("cesl_user") || localStorage.getItem("usuario");
  const user = userStr ? JSON.parse(userStr) : null;
  const idUsuario = user?.id_usuario || user?.id;

  useEffect(() => {
    if (idUsuario) {
      cargarTareas();
    }
  }, [idUsuario]);

  const cargarTareas = async () => {
    const data = await obtenerTareasDocente(idUsuario);
    setTasks(data);
  };

  const colorStyles = {
    green: "bg-[#20c997] text-white",
    yellow: "bg-[#ffc107] text-gray-900",
    red: "bg-[#dc3545] text-white",
    blue: "bg-[#0033a0] text-white",
    purple: "bg-[#6f42c1] text-white",
  };

  const formatDateText = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = new Date(year, month, 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

  const daysArray = Array(startDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) daysArray.push(i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const hoyReal = new Date();
  const hoyStr = `${hoyReal.getFullYear()}-${String(hoyReal.getMonth() + 1).padStart(2, '0')}-${String(hoyReal.getDate()).padStart(2, '0')}`;
  const tareasProximas = tasks.filter((task) => task.fecha_entrega >= hoyStr);

  return (
    // 1. Contenedor principal idéntico a Opciones.jsx
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-full transition-all hover:shadow-md">
      
      {/* 2. Título principal unificado */}
      <div className="mb-4">
        <h3 className="text-xl font-extrabold text-[#0033a0] border-b-2 border-gray-100 pb-3 flex items-center gap-2">
          <MdEventAvailable className="text-2xl" /> 
          <span>Tareas / Pendientes</span>
        </h3>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        
        {/* 3. Subtítulo con el mismo estilo que "Mis Clases Actuales" */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Tareas más cercanas
          </h4>
        </div>

        <div className="flex flex-col gap-2">
          {tareasProximas.length === 0 ? (
            <p className="text-center text-sm font-medium text-gray-400 opacity-80 my-4">No hay tareas pendientes.</p>
          ) : (
            tareasProximas.map((task) => (
              <div key={task.id_tarea} className={`${colorStyles[task.color] || colorStyles["blue"]} p-3 font-medium shadow-sm text-sm rounded-lg border border-transparent`}>
                {formatDateText(task.fecha_entrega)} - {task.titulo}
              </div>
            ))
          )}
        </div>

        {/* MINI CALENDARIO FIJO ABAJO */}
        <div className="border border-gray-200 rounded-lg mt-auto p-4 bg-gray-50/50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-800 capitalize">{monthName}</h4>
            <div className="text-gray-500 font-bold tracking-widest cursor-pointer select-none">
              <span onClick={prevMonth} className="hover:text-[#0033a0] px-2 text-lg transition-colors">&lt;</span>
              <span onClick={nextMonth} className="hover:text-[#0033a0] px-2 text-lg transition-colors">&gt;</span>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-bold text-[#0033a0] mb-2">
            <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
          </div>

          <div className="grid grid-cols-7 text-center text-sm gap-y-2">
            {daysArray.map((day, index) => {
              if (!day) return <div key={index}></div>;
              const checkDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const taskForDay = tasks.find((t) => t.fecha_entrega === checkDate);

              let styleClass = "bg-transparent hover:bg-gray-200 text-gray-700 font-medium";
              if (taskForDay) {
                const bg = colorStyles[taskForDay.color || 'blue'].split(' ')[0];
                styleClass = `${bg} text-white font-bold shadow-sm`;
              } else if (day === hoyReal.getDate() && month === hoyReal.getMonth() && year === hoyReal.getFullYear()) {
                styleClass = "bg-blue-100 border border-[#0033a0] text-[#0033a0] font-extrabold";
              }

              return (
                <div key={index} className="flex justify-center items-center p-0.5">
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors cursor-default ${styleClass}`}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Pie de tarjeta integrado con el mismo borde de Opciones.jsx */}
      <div className="mt-auto border-t-2 border-gray-100 pt-4 flex justify-center">
        <button 
          onClick={() => navigate("/docente/calendario")}
          className="w-full bg-[#0033a0] text-white px-4 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-all shadow-md hover:shadow-lg"
        >
          Abrir Módulo de Tareas
        </button>
      </div>
    </div>
  );
}