import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardCard } from "../shared/DashboardCard";

export default function TasksCard({ tasks = [] }) {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  // 1. DICCIONARIO CORREGIDO: Agregamos el color 'purple' por si acaso
  const colorStyles = {
    green: "bg-[#20c997] text-white",
    yellow: "bg-[#ffc107] text-gray-900",
    red: "bg-[#dc3545] text-white",
    blue: "bg-[#0033a0] text-white",
    purple: "bg-[#6f42c1] text-white", // 👈 Añadido para evitar errores
  };

  // Función para formatear fecha (Ej: "28 de Marzo")
  const formatDateText = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
  };

  // ---- LÓGICA DEL CALENDARIO ----
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = new Date(year, month, 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  // Estado para controlar qué día se tocó en el calendario (ideal para celulares)
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Ajustar para Lunes

  const daysArray = Array(startDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) daysArray.push(i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // 👇 NUEVO CÓDIGO: Filtramos las tareas para la lista superior 👇
  const hoyReal = new Date();
  const hoyStr = `${hoyReal.getFullYear()}-${String(hoyReal.getMonth() + 1).padStart(2, '0')}-${String(hoyReal.getDate()).padStart(2, '0')}`;
  
  const tareasProximas = tasks.filter((task) => task.fecha_entrega >= hoyStr);


  // 👇 NUEVA FUNCIÓN: Busca las tareas de un día específico para el Tooltip 👇
  const obtenerTareasDelDia = (diaNumero) => {
    if (!diaNumero) return [];
    const fechaCalendario = `${year}-${String(month + 1).padStart(2, '0')}-${String(diaNumero).padStart(2, '0')}`;
    return tasks.filter((task) => task.fecha_entrega === fechaCalendario);
  };

  return (
    <DashboardCard
      titulo="Tareas/Pendientes"
      accionPrincipal="Abrir Módulo de Tareas"
      onAccion={() => navigate("/estudiante/calendario")}
    >
      <div className="flex flex-col gap-4 flex-1">
        <p className="text-center text-gray-700 font-medium mb-2">Tareas más cercanas a la fecha</p>

        {/* LISTA DINÁMICA DE TAREAS */}
        {tareasProximas.length === 0 ? (
          <p className="text-center text-sm text-gray-500 italic">No tienes tareas pendientes.</p>
        ) : (
          tareasProximas.map((task) => (
            <div key={task.id_tarea} className={`${colorStyles[task.color] || colorStyles["blue"]} p-2 font-medium border border-gray-800 shadow-sm text-sm rounded`}>
              {formatDateText(task.fecha_entrega)}, {task.titulo}
            </div>
          ))
        )}

        {/* CALENDARIO DINÁMICO */}
        <div className="border border-gray-300 rounded mt-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-800 capitalize">{monthName}</h4>
            <div className="text-gray-500 font-bold tracking-widest cursor-pointer select-none">
              <span onClick={prevMonth} className="hover:text-blue-600 px-2 text-lg">&lt;</span>
              <span onClick={nextMonth} className="hover:text-blue-600 px-2 text-lg">&gt;</span>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-xs sm:text-sm font-bold text-[#0033a0] mb-2">
            <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
          </div>

          <div className="grid grid-cols-7 auto-rows-[90px] sm:auto-rows-[120px] text-center text-sm gap-y-2">
            {daysArray.map((day, index) => {
              if (!day) return <div key={index}></div>;

              // 🌟 CAMBIO AQUÍ: Usamos obtenerTareasDelDia para saber TODAS las tareas
              const tareasDia = obtenerTareasDelDia(day);
              const tieneTareas = tareasDia.length > 0;
              // Tomamos la primera tarea solo para saber de qué color pintar el circulito
              const taskForDay = tieneTareas ? tareasDia[0] : null;

              // LÓGICA SEGURA PARA EXTRAER EL COLOR
              let bgClass = "bg-transparent hover:bg-gray-100";
              let textClass = "text-gray-700 font-medium";

              if (taskForDay) {
                const colorSeguro = taskForDay.color || 'blue';
                const estilosDeColor = colorStyles[colorSeguro] || colorStyles['blue'];
                bgClass = estilosDeColor.split(' ')[0];
                textClass = "text-white font-bold";
              }

              return (
                <div 
                  key={index} 
                  // 🌟 CAMBIO AQUÍ: 'relative', 'group' y eventos de mouse/clic
                  className="relative flex justify-center items-center p-0.5 group cursor-pointer"
                  onClick={() => tieneTareas && setDiaSeleccionado(diaSeleccionado === day ? null : day)}
                  onMouseLeave={() => setDiaSeleccionado(null)}
                >
                  {(() => {
                    const hoy = new Date();
                    const esHoy = 
                      day === hoy.getDate() && 
                      month === hoy.getMonth() && 
                      year === hoy.getFullYear();

                    const styleClass = taskForDay 
                      ? `${bgClass} ${textClass}` 
                      : esHoy 
                        ? "bg-blue-50 border border-[#0033a0] text-[#0033a0] font-extrabold" 
                        : "bg-transparent hover:bg-gray-100 text-gray-700 font-medium"; 

                    return (
                      <span className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${styleClass}`}>
                        {day}
                      </span>
                    );
                  })()}

                  {/* 🌟 TOOLTIP FLOTANTE 🌟 */}
                  {tieneTareas && (
                    <div 
                      className={`
                        absolute bottom-full mb-2 w-max max-w-[200px] z-50 p-2.5 
                        bg-gray-800 text-white text-xs rounded-lg shadow-xl 
                        transition-all duration-200 pointer-events-none
                        ${diaSeleccionado === day ? 'opacity-100 visible -translate-y-1' : 'opacity-0 invisible translate-y-0 group-hover:opacity-100 group-hover:visible group-hover:-translate-y-1'}
                      `}
                    >
                      {/* Triangulito que apunta hacia abajo */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      
                      <p className="font-bold mb-1 border-b border-gray-600 pb-1 text-[#4ade80]">
                        {tareasDia.length === 1 ? 'Tarea pendiente:' : 'Tareas pendientes:'}
                      </p>
                      <ul className="list-disc pl-4 text-left m-0">
                        {tareasDia.map((tarea) => (
                          <li key={tarea.id_tarea} className="truncate mt-1">
                            {tarea.titulo}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      </div>

    </DashboardCard>
  );
}