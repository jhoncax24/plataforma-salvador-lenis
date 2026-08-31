import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  obtenerPerfilEstudiante, 
  obtenerNotasEstudiante, 
  obtenerHorarioEstudiante, 
  obtenerTareasEstudiante,
  obtenerFaltasEstudiante
} from "../../api/perfilApi";

import GradesCard from "../../components/estudiante/GradesCard";
import ScheduleCard from "../../components/estudiante/ScheduleCard";
import TasksCard from "../../components/estudiante/TasksCard";

export default function EstudianteInicio() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("cesl_user");
    localStorage.removeItem("token");
    navigate("/");
  };

useEffect(() => {
    const loadData = async () => {
      try {
        const userStr = localStorage.getItem("cesl_user");
        if (!userStr) {
          navigate("/");
          return;
        }
        
        const user = JSON.parse(userStr);
        const idUsuarioLogueado = user.id || user.id_usuario; 

        // 👇 LA SOLUCIÓN ESTÁ AQUÍ: Agregamos 'faltas' dentro de los corchetes [ ]
        const [profile, grades, schedule, tasks, faltas] = await Promise.all([
          obtenerPerfilEstudiante(idUsuarioLogueado),
          obtenerNotasEstudiante(idUsuarioLogueado),
          obtenerHorarioEstudiante(idUsuarioLogueado),
          obtenerTareasEstudiante(idUsuarioLogueado),
          obtenerFaltasEstudiante(idUsuarioLogueado) 
        ]);

        setData({
          student: profile,
          grades: grades,
          schedule: schedule,
          tasks: tasks,
          faltas: faltas // Ahora sí existe la variable
        });

      } catch (error) {
        console.error("Error al cargar datos", error);
        setError("Error de conexión al cargar el perfil.");
      }
    };
    loadData();
  }, [navigate]);

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">{error}</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center font-bold text-[#0033a0]">Cargando tu información...</div>;

 // 👇 FUNCIÓN ACTUALIZADA: Devuelve texto e imagen
  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    
    if (hora >= 5 && hora < 12) {
      return {
        texto: "Buen Día",
        // Pega aquí tu link de Cloudinary cuando lo tengas:
        imagen: "https://res.cloudinary.com/dmzq2qw0t/image/upload/q_auto/f_auto/v1776980377/BuenD%C3%ADa_cmpcyy.png" 
      };
    } else if (hora >= 12 && hora < 19) {
      return {
        texto: "Buena Tarde",
        imagen: "https://res.cloudinary.com/dmzq2qw0t/image/upload/q_auto/f_auto/v1776980379/BuenaTarde_oe3jrc.png"
      };
    } else {
      return {
        texto: "Buena Noche",
        imagen: "https://res.cloudinary.com/dmzq2qw0t/image/upload/q_auto/f_auto/v1776980382/BuenaNoche_cm8hyo.png"
      };
    }
  };

  // Guardamos el resultado en una variable para usarla abajo
  const saludoActual = obtenerSaludo();
  return (
    <div className="w-[95%] max-w-[1800px] mx-auto pt-6 pb-12 animate-fade-in-up">
      
      {/* SECCIÓN SUPERIOR: Saludo y Perfil */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 relative px-4">
        
     {/* Textos e Imagen de Saludo */}
        {/* 👇 Eliminamos la clase md:ml-12 de aquí para que se alinee con las tarjetas inferiores */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6 md:mb-0">
          
          {/* 👇 CONTENEDOR DE LA IMAGEN 👇 */}
          {/* Aumentamos el tamaño a w-28 h-28 y eliminamos la animación animate-bounce */}
          <div className="w-28 h-28 flex-shrink-0 rounded-full overflow-hidden bg-white shadow-sm">
            <img 
              src={saludoActual.imagen} 
              alt="Clima" 
              className="w-full h-full object-cover"
              onError={(e) => e.target.style.display = 'none'} 
            />
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-4xl text-gray-800">{saludoActual.texto}</h2>
            <h2 className="text-4xl text-[#0033a0] font-bold">{data.student.nombre}</h2>
          </div>
        </div>

        {/* 👇 FOTO DE PERFIL (SOLO LECTURA) 👇 */}
        <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:bottom-2 mb-6 md:mb-0 z-10">
          {/* Ya no es un <label>, ahora es un simple <div> sin cursor-pointer */}
          <div className="relative rounded-full overflow-hidden w-28 h-28 border-4 border-white shadow-lg bg-white">
            
            {/* Si un profesor ya le subió foto, la muestra. Si no, muestra el muñequito */}
            {data.student.foto_perfil ? (
              <img 
                src={data.student.foto_perfil} 
                alt="Perfil Estudiante" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Botón Cerrar Sesión */}
        <div onClick={handleLogout} className="flex flex-col items-center cursor-pointer hover:text-red-600 transition-colors group">
          <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow border border-gray-100 group-hover:border-red-100 transition-all">
            <svg className="w-7 h-7 text-gray-600 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-500 mt-2 group-hover:text-red-600 transition-colors">Salir</span>
        </div>
        
      </div>

      {/* TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch px-4">
        <div className="w-full"><GradesCard grades={data.grades} /></div>
        <div className="w-full"><ScheduleCard student={data.student} schedule={data.schedule} faltas={data.faltas} /></div>
        <div className="w-full"><TasksCard tasks={data.tasks} /></div>
        
      </div>
    </div>
  );
}