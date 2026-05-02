import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Funciones de la API
import { 
  obtenerPerfilAcudiente, 
  obtenerEstudiantesDelAcudiente,
  actualizarPerfilAcudiente,
  actualizarPerfilEstudiante,
  cambiarContrasenaUsuario,
  obtenerNotasEstudiante // <-- IMPORTANTE: Agregamos la función de notas
} from "../../api/perfilApi";

// Componentes
import NotasPeriodo from "../../components/acudiente/NotasPeriodo";
import Calendario from "../../components/acudiente/Calendario";
import Certificados from "../../components/acudiente/Certificados";
import PerfilModal from "../../components/acudiente/PerfilModal";
import EditarDatosModal from "../../components/acudiente/EditarDatosModal";
import CambiarPasswordModal from "../../components/acudiente/CambiarPasswordModal";
import NotasModal from "../../components/acudiente/NotasModal"; // <-- NUEVO: Importamos el modal de notas

export default function AcudienteInicio() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para modales
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);
  const [isEditarModalOpen, setIsEditarModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isNotasModalOpen, setIsNotasModalOpen] = useState(false); // <-- NUEVO: Estado para el modal de notas
  
  // Estados de datos temporales
  const [datosParaEditar, setDatosParaEditar] = useState(null);
  const [datosParaPassword, setDatosParaPassword] = useState(null);
  
  // NUEVO: Estados para guardar la info que se enviará al modal de notas
  const [estudianteParaNotas, setEstudianteParaNotas] = useState(null);
  const [notasDelEstudiante, setNotasDelEstudiante] = useState([]);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("cesl_user");
    localStorage.removeItem("cesl_token");
    navigate("/");
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const userStr = localStorage.getItem("cesl_user");
        const user = userStr ? JSON.parse(userStr) : null;
        
        const idUsuarioLogueado = user?.id || 3; 

        const acudienteProfile = await obtenerPerfilAcudiente(idUsuarioLogueado);
        const idAcudienteReal = acudienteProfile?.id_acudiente || acudienteProfile?.id;
        const hijosAsignados = await obtenerEstudiantesDelAcudiente(idAcudienteReal);

        const acudienteCompatible = {
          ...acudienteProfile,
          id: acudienteProfile?.id_acudiente,
          nombre: acudienteProfile?.nombre_completo,
          tipoDoc: acudienteProfile?.tipo_doc,
          correo: acudienteProfile?.correo || "",
          telefono: acudienteProfile?.telefono || "",
          direccion: acudienteProfile?.direccion || "",
        };

        const hijosCompatibles = (hijosAsignados || []).map(est => ({
          ...est,
          id: est.id_estudiante,
          nombre: est.nombre_completo,
          tipoDoc: est.tipo_doc || "TI",
          documento: est.documento || "",
          grado: est.grado || "Sin grado"
        }));

        setData({
          acudiente: acudienteCompatible,
          hijos: hijosCompatibles,
        });
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Ocurrió un problema al cargar la información. Intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAbrirEdicion = (datos) => {
    setDatosParaEditar(datos);
    setIsPerfilModalOpen(false); 
    setIsEditarModalOpen(true); 
  };

  const handleAbrirPassword = (datos) => {
    setDatosParaPassword(datos); 
    setIsPerfilModalOpen(false); 
    setIsPasswordModalOpen(true); 
  };

  // --- NUEVA FUNCIÓN PARA VER NOTAS ---
  const handleVerNotas = async (hijoId, periodo) => {
    try {
      // 1. Buscamos los datos del estudiante seleccionado en nuestra lista actual
      const estudianteSeleccionado = data.hijos.find(h => h.id === hijoId);
      setEstudianteParaNotas(estudianteSeleccionado);

      // 2. Llamamos a la API para traer las notas reales de la base de datos
      const notasBD = await obtenerNotasEstudiante(hijoId);
      setNotasDelEstudiante(notasBD || []);

      // 3. Abrimos el modal
      setIsNotasModalOpen(true);
    } catch (error) {
      console.error("Error al obtener notas:", error);
      alert("Hubo un error al cargar las notas. Verifica la conexión.");
    }
  };

  const guardarDatosEditados = async (nuevosDatos) => {
    try {
      const esHijo = datosParaEditar?.grado !== undefined;
      if (esHijo) {
        await actualizarPerfilEstudiante(datosParaEditar.id, nuevosDatos);
      } else {
        await actualizarPerfilAcudiente(datosParaEditar.id, nuevosDatos);
      }
      alert("¡Datos enviados al servidor exitosamente!");
      setIsEditarModalOpen(false);
      window.location.reload(); 
    } catch (error) {
      console.error("❌ Error devuelto por el servidor:", error);
      const mensajeFallo = error.response?.data?.error || "Error desconocido al guardar";
      alert(`No se pudo guardar: ${mensajeFallo}`);
    }
  };

  const guardarNuevaPassword = async (datosPassword) => {
    try {
      const payload = {
        tipo: datosParaPassword.tipo,     
        id: datosParaPassword.id,         
        actual: datosPassword.actual,     
        nueva: datosPassword.nueva        
      };
      await cambiarContrasenaUsuario(payload);
      alert("¡Contraseña cambiada exitosamente en la base de datos!");
      setIsPasswordModalOpen(false);
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      const mensajeError = error.response?.data?.error || "Hubo un error al cambiar la contraseña.";
      alert(mensajeError);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Cargando panel del acudiente...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-xl text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 relative">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h2 className="text-4xl text-gray-800">Buenos Días</h2>
          <h2 className="text-4xl text-gray-800 font-medium">
            {data?.acudiente?.nombre || "Acudiente"}
          </h2>
        </div>

        <div onClick={() => setIsPerfilModalOpen(true)} className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:bottom-2 mb-4 md:mb-0 cursor-pointer hover:scale-105 transition-transform" title="Ver mi perfil">
          <svg className="w-24 h-24 text-[#0033a0] hover:text-blue-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        <div onClick={handleLogout} className="flex flex-col items-center cursor-pointer hover:text-[#0033a0] transition-colors">
          <svg className="w-12 h-12 text-gray-800 hover:text-[#0033a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-lg font-medium text-gray-800 mt-1 hover:text-[#0033a0]">Cerrar Sesión</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col h-full">
          <h3 className="text-2xl font-semibold mb-4 text-[#0033a0]">Progreso Académico</h3>
          <p className="text-gray-600 mb-4 flex-grow">Consulta las calificaciones y el rendimiento de tus acudidos.</p>
          <NotasPeriodo hijos={data.hijos} onVerNotas={handleVerNotas} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col h-full">
          <h3 className="text-2xl font-semibold mb-4 text-[#0033a0]">Calendario Escolar</h3>
          <p className="text-gray-600 mb-4 flex-grow">Revisa reuniones de padres, entregas de boletines y festivos.</p>
          <Calendario idAcudiente={data?.acudiente?.id} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col h-full">
          <h3 className="text-2xl font-semibold mb-4 text-[#0033a0]">Documentos</h3>
          <p className="text-gray-600 mb-4 flex-grow">Descarga certificados de estudio y constancias de matrícula.</p>
          <Certificados estudiantes={data.hijos} />
        </div>
      </div>
      
      <PerfilModal isOpen={isPerfilModalOpen} onClose={() => setIsPerfilModalOpen(false)} profile={data.acudiente} hijos={data.hijos} onEdit={handleAbrirEdicion} onChangePassword={handleAbrirPassword} />
      <EditarDatosModal isOpen={isEditarModalOpen} onClose={() => setIsEditarModalOpen(false)} data={datosParaEditar} onSave={guardarDatosEditados} />
      <CambiarPasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} onChange={guardarNuevaPassword} />
      
      {/* NUEVO: Renderizamos el modal de notas */}
      <NotasModal 
        isOpen={isNotasModalOpen} 
        onClose={() => setIsNotasModalOpen(false)} 
        estudiante={estudianteParaNotas} 
        notas={notasDelEstudiante} 
      />

    </div>
  );
}