import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerPerfilEstudiante, obtenerNotasEstudiante } from "../../api/perfilApi";

import GradesCard from "../../components/estudiante/GradesCard";
import ScheduleCard from "../../components/estudiante/ScheduleCard";
import TasksCard from "../../components/estudiante/TasksCard";

export default function EstudianteInicio() {
  const [data, setData] = useState(null);
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
        const user = userStr ? JSON.parse(userStr) : null;
        const idUsuarioLogueado = user?.id || 4; 

        const studentProfile = await obtenerPerfilEstudiante(idUsuarioLogueado);
        const studentGrades = await obtenerNotasEstudiante(studentProfile.id);

        setData({
          student: studentProfile,
          grades: studentGrades,
        });

      } catch (error) {
        console.error("Error al cargar datos del estudiante", error);
      }
    };
    loadData();
  }, []);

  if (!data) return <div className="min-h-screen flex items-center justify-center">Cargando datos...</div>;

  return (
    <div>
      {/* SECCIÓN SUPERIOR: Saludo, Perfil y Cerrar Sesión */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 relative">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h2 className="text-4xl text-gray-800">Buenos Días</h2>
          <h2 className="text-4xl text-gray-800 font-medium">{data.student.nombre}</h2>
        </div>

        {/* Icono central (Perfil) */}
        <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:bottom-2 mb-4 md:mb-0">
          <svg className="w-24 h-24 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        {/* Botón Cerrar Sesión con Icono */}
        <div 
          onClick={handleLogout}
          className="flex flex-col items-center cursor-pointer hover:text-[#0033a0] transition-colors"
        >
          <svg className="w-12 h-12 text-gray-800 hover:text-[#0033a0] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-lg font-medium text-gray-800 mt-1 hover:text-[#0033a0] transition-colors">Cerrar Sesión</span>
        </div>
      </div>

      {/* Tarjetas (Grilla de 3 columnas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GradesCard grades={data.grades} />
        <ScheduleCard student={data.student} />
        <TasksCard />
      </div>
    </div>
  );
}