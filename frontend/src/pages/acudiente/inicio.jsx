import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { 
  obtenerPerfilAcudiente, 
  obtenerEstudiantesDelAcudiente,
  actualizarPerfilAcudiente,
  actualizarPerfilEstudiante,
  obtenerNotasEstudiante,
  obtenerEventos
} from "../../api/perfilApi";

import NotasPeriodo from "../../components/acudiente/NotasPeriodo";
import Certificados from "../../components/acudiente/Certificados";
import PerfilModal from "../../components/acudiente/PerfilModal";
import EditarDatosModal from "../../components/acudiente/EditarDatosModal";

export default function AcudienteInicio() {
  const [data, setData] = useState(null);
  const [eventosMini, setEventosMini] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);
  const [isEditarModalOpen, setIsEditarModalOpen] = useState(false);
  const [datosParaEditar, setDatosParaEditar] = useState(null);

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
        
        const [hijosAsignados, eventosBD] = await Promise.all([
          obtenerEstudiantesDelAcudiente(idAcudienteReal),
          obtenerEventos(idAcudienteReal)
        ]);

        setData({
          acudiente: { 
            ...acudienteProfile, 
            id: idUsuarioLogueado,
            id_acudiente: idAcudienteReal,
            nombre: acudienteProfile?.nombre || acudienteProfile?.nombre_completo 
          },
          hijos: (hijosAsignados || []).map(est => ({ 
            ...est, 
            id: est.id || est.id_estudiante, 
            nombre: est.nombre || est.nombre_completo, 
            degreeId: est.id_curso || 1, 
            grado: est.grado || "Sin grado" 
          })),
        });

        setEventosMini(eventosBD || []);

      } catch (err) {
        setError("Ocurrió un problema al cargar la información.");
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
    setIsPerfilModalOpen(false); 
    navigate("/acudiente/password", { state: { datosUsuario: datos } });
  };

  const handleVerNotas = async (hijoId) => {
    try {
      const estudianteSeleccionado = data.hijos.find(h => h.id === hijoId);
      const notasBD = await obtenerNotasEstudiante(hijoId);
      navigate("/acudiente/notas", { state: { estudiante: estudianteSeleccionado, notas: notasBD || [] } });
    } catch (error) {
      alert("Hubo un error al cargar las notas.");
    }
  };

  const guardarDatosEditados = async (nuevosDatos) => {
    try {
      if (datosParaEditar?.grado !== undefined) {
        await actualizarPerfilEstudiante(datosParaEditar.id, nuevosDatos);
      } else {
        await actualizarPerfilAcudiente(datosParaEditar.id, nuevosDatos);
      }
      alert("¡Datos actualizados exitosamente!");
      setIsEditarModalOpen(false);
      window.location.reload(); 
    } catch (error) {
      alert("No se pudo guardar.");
    }
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) {
      return { texto: "Buen Día", imagen: "https://res.cloudinary.com/dmzq2qw0t/image/upload/q_auto/f_auto/v1776980377/BuenD%C3%ADa_cmpcyy.png" };
    } else if (hora >= 12 && hora < 18) {
      return { texto: "Buena Tarde", imagen: "https://res.cloudinary.com/dmzq2qw0t/image/upload/q_auto/f_auto/v1776980379/BuenaTarde_oe3jrc.png" };
    } else {
      return { texto: "Buena Noche", imagen: "https://res.cloudinary.com/dmzq2qw0t/image/upload/q_auto/f_auto/v1776980382/BuenaNoche_cm8hyo.png" };
    }
  };

  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const anioActual = hoy.getFullYear();
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();
  const primerDia = new Date(anioActual, mesActual, 1).getDay();
  const inicioSemana = primerDia === 0 ? 6 : primerDia - 1;
  const cuadriculaMini = [...Array(inicioSemana).fill(null), ...Array.from({length: diasEnMes}, (_, i) => i + 1)];

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-[#0033a0] bg-gray-50">Cargando tu información...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold bg-gray-50">{error}</div>;

  const saludoActual = obtenerSaludo();
  const inicialAcudiente = data?.acudiente?.nombre ? data.acudiente.nombre.charAt(0).toUpperCase() : "A";

  return (
    <div className="w-[95%] max-w-[1800px] mx-auto pt-6 pb-12 animate-fade-in-up">
      
      {/* SECCIÓN SUPERIOR: Saludo y Perfil (Diseño Original Mantenido) */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-20 relative px-4">
        
        {/* IZQUIERDA: Límite de ancho agregado (md:max-w-[35%]) para no chocar con el centro */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6 md:mb-0 mt-4 md:max-w-[35%] lg:max-w-[40%]">
          <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-full overflow-hidden bg-white shadow-sm border border-gray-100">
            <img src={saludoActual.imagen} alt="Clima" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <div className="text-center md:text-left break-words">
            <h2 className="text-3xl sm:text-4xl text-gray-800 leading-tight">{saludoActual.texto}</h2>
            <h2 className="text-3xl sm:text-4xl text-[#0033a0] font-bold leading-tight">{data?.acudiente?.nombre || "Acudiente"}</h2>
          </div>
        </div>

        {/* CENTRO: Avatar y Botón */}
        <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:top-0 mb-6 md:mb-0 z-10 flex flex-col items-center w-full md:w-auto">
          <div onClick={() => setIsPerfilModalOpen(true)} className="flex flex-col items-center group cursor-pointer">
            <div className="relative rounded-full w-28 h-28 border-4 border-white shadow-lg bg-blue-50 flex items-center justify-center overflow-hidden transition-all group-hover:shadow-xl">
              <span className="text-5xl font-black text-[#0033a0]">{inicialAcudiente}</span>
              <div className="absolute inset-0 bg-[#0033a0] bg-opacity-80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-8 h-8 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </div>
            </div>
            <span className="mt-3 bg-white text-[#0033a0] border border-blue-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm group-hover:bg-[#0033a0] group-hover:text-white transition-colors">
              Ver / Editar Perfil
            </span>
          </div>

          <button 
            onClick={() => navigate("/acudiente/matricula", { state: { hijos: data.hijos } })}
            className="mt-3 bg-gradient-to-r from-blue-700 to-[#0033a0] text-white px-5 py-2 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-105 w-auto"
          >
            📝 Matrícula en Línea 2026
          </button>
        </div>

        {/* DERECHA: Cerrar Sesión */}
        <div onClick={handleLogout} className="flex flex-col items-center cursor-pointer hover:text-red-600 transition-colors group mt-4 hidden md:flex">
          <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow border border-gray-100 group-hover:border-red-100 transition-all">
            <svg className="w-7 h-7 text-gray-600 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-500 mt-2 group-hover:text-red-600 transition-colors">Salir</span>
        </div>
        
        {/* Botón salir versión móvil (solo se ve en celular) */}
        <div onClick={handleLogout} className="md:hidden flex flex-row items-center justify-center gap-2 cursor-pointer text-red-600 transition-colors w-full mt-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-sm font-bold">Cerrar Sesión</span>
        </div>
      </div>

      {/* CUADRÍCULA DE TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch px-2 sm:px-4">
        
        {/* Progreso Académico */}
        <div className="w-full bg-white border-2 border-gray-200 rounded-xl shadow-md p-5 sm:p-6 flex flex-col min-h-[400px]">
          <h3 className="text-xl sm:text-2xl font-bold mb-2 text-[#0033a0]">Progreso Académico</h3>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mb-4">Consulta el boletín de calificaciones de tus hijos.</p>
          <div className="flex-1 flex flex-col">
            <NotasPeriodo hijos={data.hijos} onVerNotas={handleVerNotas} />
          </div>
        </div>
        
        {/* Calendario Escolar con MINI-CALENDARIO */}
        <div className="w-full bg-white border-2 border-gray-200 rounded-xl shadow-md p-5 sm:p-6 flex flex-col min-h-[400px]">
          <h3 className="text-xl sm:text-2xl font-bold mb-2 text-[#0033a0]">Calendario Escolar</h3>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mb-4">Organiza citas, eventos y recordatorios.</p>
          
          <div className="flex-1 flex flex-col bg-gray-50 rounded-xl border border-gray-200 p-3 overflow-hidden shadow-inner">
            <div className="text-center font-bold text-[#0033a0] text-sm mb-2">{meses[mesActual]} {anioActual}</div>
            <div className="grid grid-cols-7 text-[10px] font-bold text-gray-400 text-center mb-1">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium flex-1">
              {cuadriculaMini.map((dia, idx) => {
                const esHoy = dia === hoy.getDate();
                let tieneEvento = false;

                if (dia) {
                  const mesStr = String(mesActual + 1).padStart(2, '0');
                  const diaStr = String(dia).padStart(2, '0');
                  const fechaCelda = `${anioActual}-${mesStr}-${diaStr}`;
                  
                  tieneEvento = eventosMini.some(ev => {
                    const f = new Date(ev.fecha);
                    const stringFechaBD = `${f.getUTCFullYear()}-${String(f.getUTCMonth() + 1).padStart(2, '0')}-${String(f.getUTCDate()).padStart(2, '0')}`;
                    return stringFechaBD === fechaCelda;
                  });
                }

                return (
                  <div key={idx} className={`relative flex items-center justify-center rounded transition-all py-1
                    ${!dia ? '' : esHoy ? 'bg-[#0033a0] text-white shadow' : 'bg-white border border-gray-100 text-gray-700'}`}>
                    {dia}
                    {tieneEvento && !esHoy && <span className="absolute bottom-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                    {tieneEvento && esHoy && <span className="absolute bottom-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <button 
              onClick={() => navigate("/acudiente/calendario")}
              className="w-full bg-[#0033a0] text-white py-3 sm:py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-all shadow-md flex justify-center items-center gap-2 text-sm sm:text-base"
            >
              📅 Abrir Calendario Completo
            </button>
          </div>
        </div>
        
        {/* Documentos Oficiales */}
        <div className="w-full bg-white border-2 border-gray-200 rounded-xl shadow-md p-5 sm:p-6 flex flex-col min-h-[400px]">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 text-[#0033a0]">Trámites y Documentos</h3>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <Certificados estudiantes={data.hijos} />
          </div>
        </div>

      </div>
      
      <PerfilModal isOpen={isPerfilModalOpen} onClose={() => setIsPerfilModalOpen(false)} profile={data.acudiente} hijos={data.hijos} onEdit={handleAbrirEdicion} onChangePassword={handleAbrirPassword} />
      <EditarDatosModal isOpen={isEditarModalOpen} onClose={() => setIsEditarModalOpen(false)} data={datosParaEditar} onSave={guardarDatosEditados} />
    </div>
  );
}