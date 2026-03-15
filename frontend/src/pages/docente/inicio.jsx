import { useNavigate } from "react-router-dom";

// Importamos nuestros componentes modulares
import ObservadorCard from "../../components/docente/ObservadorCard";
import NotasCard from "../../components/docente/NotasCard";
import CalendarioCard from "../../components/docente/CalendarioCard";

export default function DocenteInicio() {
  const navigate = useNavigate();

  // Función simulada para cerrar sesión mientras maquetamos
  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div>
      {/* SECCIÓN SUPERIOR: Saludo, Editar Perfil y Cerrar Sesión */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 relative">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h2 className="text-4xl text-gray-800">Buenos Días</h2>
          {/* Este nombre luego vendrá del backend */}
          <h2 className="text-4xl text-gray-800 font-medium">Jenny Vasquez</h2> 
        </div>

        {/* Botón central (Editar perfil) */}
        <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:bottom-2 mb-4 md:mb-0">
          <button className="bg-[#0033a0] hover:bg-blue-800 text-white font-semibold py-2 px-8 rounded shadow transition-colors">
            Editar perfil
          </button>
        </div>

        {/* Botón Cerrar Sesión con Icono */}
        <div 
          onClick={handleLogout}
          className="flex flex-col items-center cursor-pointer hover:text-[#0033a0] transition-colors"
        >
          {/* Icono de Puerta/Salir */}
          <svg className="w-12 h-12 text-gray-800 hover:text-[#0033a0] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-lg font-medium text-gray-800 mt-1 hover:text-[#0033a0] transition-colors">Cerrar Sesión</span>
        </div>
      </div>

      {/* REJILLA DE LAS 3 TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ObservadorCard />
        <NotasCard />
        <CalendarioCard />
      </div>
    </div>
  );
}