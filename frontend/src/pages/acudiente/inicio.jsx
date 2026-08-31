import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdWarning, MdCheckCircle, MdLightbulb, MdChevronRight, MdEdit, MdLogout } from "react-icons/md";

import { 
  obtenerPerfilAcudiente, 
  obtenerEstudiantesDelAcudiente,
  actualizarPerfilAcudiente,
  actualizarPerfilEstudiante,
  obtenerNotasEstudiante,
  obtenerEventos,
  obtenerFechaLimiteMatricula // Importación para leer la BD
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
  
  // Estados para la fecha límite
  const [fechaLimiteString, setFechaLimiteString] = useState("");
  const [isMatriculaAbierta, setIsMatriculaAbierta] = useState(false);
  
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);
  const [isEditarModalOpen, setIsEditarModalOpen] = useState(false);
  const [datosParaEditar, setDatosParaEditar] = useState(null);

  const [currentDate, setCurrentDate] = useState(new Date());
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
        
        // Llamamos a la BD
        const [hijosAsignados, eventosBD, limiteBD] = await Promise.all([
          obtenerEstudiantesDelAcudiente(idAcudienteReal),
          obtenerEventos(idAcudienteReal),
          obtenerFechaLimiteMatricula()
        ]);

        // Procesamos la fecha
        const fechaLimiteBD = new Date(limiteBD);
        setFechaLimiteString(fechaLimiteBD.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }));
        setIsMatriculaAbierta(new Date() <= fechaLimiteBD);

        setData({
          acudiente: { 
            ...acudienteProfile, id: idUsuarioLogueado, id_acudiente: idAcudienteReal,
            nombre: acudienteProfile?.nombre || acudienteProfile?.nombre_completo 
          },
          hijos: (hijosAsignados || []).map(est => ({ 
            ...est, id: est.id || est.id_estudiante, nombre: est.nombre || est.nombre_completo, 
            degreeId: est.id_curso || 1, grado: est.grado || "Sin grado" 
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
    if (hora >= 5 && hora < 12) return { texto: "Buen Día", imagen: "https://res.cloudinary.com/dmzq2qw0t/image/upload/q_auto/f_auto/v1776980377/BuenD%C3%ADa_cmpcyy.png" };
    if (hora >= 12 && hora < 18) return { texto: "Buena Tarde", imagen: "https://res.cloudinary.com/dmzq2qw0t/image/upload/q_auto/f_auto/v1776980379/BuenaTarde_oe3jrc.png" };
    return { texto: "Buena Noche", imagen: "https://res.cloudinary.com/dmzq2qw0t/image/upload/q_auto/f_auto/v1776980382/BuenaNoche_cm8hyo.png" };
  };

  const colorStyles = { green: "bg-[#20c997] text-white", yellow: "bg-[#ffc107] text-gray-900", red: "bg-[#dc3545] text-white", blue: "bg-[#0033a0] text-white", purple: "bg-[#6f42c1] text-white" };

  const hoyReal = new Date();
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

  const eventosDelMesActual = eventosMini.filter((ev) => {
    if (!ev.fecha) return false;
    const fechaLimpia = ev.fecha.split("T")[0].split(" ")[0]; 
    const [evYear, evMonth] = fechaLimpia.split("-");
    return Number(evYear) === year && Number(evMonth) === month + 1;
  });

  const eventosProximos = eventosDelMesActual
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .slice(0, 4); 

  const formatDateText = (dateString) => {
    if (!dateString) return "";
    const [y, m, d] = dateString.split("T")[0].split("-");
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    return dateObj.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-[#0033a0] bg-gray-50">Cargando tu información...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold bg-gray-50">{error}</div>;

  const saludoActual = obtenerSaludo();
  const inicialAcudiente = data?.acudiente?.nombre ? data.acudiente.nombre.charAt(0).toUpperCase() : "A";

  return (
    <div className="w-[95%] max-w-[1800px] mx-auto pt-6 pb-12 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start mb-20 relative px-4">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6 md:mb-0 mt-4 md:max-w-[35%] lg:max-w-[40%]">
          <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-full overflow-hidden bg-white shadow-sm border border-gray-100">
            <img src={saludoActual.imagen} alt="Clima" className="w-full h-full object-cover" />
          </div>
          <div className="text-center md:text-left break-words">
            <h2 className="text-3xl sm:text-4xl text-gray-800 leading-tight">{saludoActual.texto}</h2>
            <h2 className="text-3xl sm:text-4xl text-[#0033a0] font-bold leading-tight">{data?.acudiente?.nombre || "Acudiente"}</h2>
          </div>
        </div>

        <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:top-0 mb-6 md:mb-0 z-10 flex flex-col items-center w-full md:w-auto">
          <div onClick={() => setIsPerfilModalOpen(true)} className="flex flex-col items-center group cursor-pointer">
            <div className="relative rounded-full w-28 h-28 border-4 border-white shadow-lg bg-blue-50 flex items-center justify-center overflow-hidden transition-all group-hover:shadow-xl">
              <span className="text-5xl font-black text-[#0033a0]">{inicialAcudiente}</span>
              <div className="absolute inset-0 bg-[#0033a0] bg-opacity-80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <MdEdit />
              </div>
            </div>
            <span className="mt-3 bg-white text-[#0033a0] border border-blue-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm group-hover:bg-[#0033a0] group-hover:text-white transition-colors">
              Ver / Editar Perfil
            </span>
          </div>

          {/* 👇 EL BOTÓN AHORA DESAPARECE POR COMPLETO SI ESTÁ CERRADO */}
          {isMatriculaAbierta && (
            <button onClick={() => navigate("/acudiente/matricula", { state: { hijos: data.hijos } })} className="mt-3 bg-gradient-to-r from-blue-700 to-[#0033a0] text-white px-5 py-2 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-105 w-auto">
               Matrícula en Línea 2026
            </button>
          )}
        </div>

        <div onClick={handleLogout} className="flex flex-col items-center cursor-pointer hover:text-red-600 transition-colors group mt-4 hidden md:flex">
          <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow border border-gray-100 group-hover:border-red-100 transition-all">
            <MdLogout />
          </div>
          <span className="text-sm font-bold text-gray-500 mt-2 group-hover:text-red-600 transition-colors">Salir</span>
        </div>
        <div onClick={handleLogout} className="md:hidden flex flex-row items-center justify-center gap-2 cursor-pointer text-red-600 transition-colors w-full mt-4">
          <MdLogout />
          <span className="text-sm font-bold">Cerrar Sesión</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch px-2 sm:px-4">
        <div className="w-full bg-white border-2 border-gray-200 rounded-xl shadow-md p-4 sm:p-5 flex flex-col min-h-[400px]">
          <h3 className="text-xl sm:text-2xl font-bold mb-2 text-[#0033a0]">Progreso Académico</h3>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mb-4">Consulta el boletín de calificaciones de tus hijos.</p>
          <div className="flex-1 flex flex-col">
            <NotasPeriodo hijos={data.hijos} onVerNotas={handleVerNotas} />
          </div>
        </div>
        
        <div className="w-full bg-white border-2 border-gray-200 rounded-xl shadow-md p-4 sm:p-5 flex flex-col min-h-[400px]">
          <h3 className="text-xl sm:text-2xl font-bold mb-2 text-[#0033a0]">Calendario Escolar</h3>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mb-4">Tus recordatorios personales del mes.</p>

          <div className="flex-1 flex flex-col gap-4">
            <p className="text-center text-gray-700 font-medium mb-2">Mis Recordatorios de {monthName}</p>

            {eventosProximos.length === 0 ? (
              <p className="text-center text-sm text-gray-500 italic">No hay recordatorios creados para el mes de {monthName}.</p>
            ) : (
              eventosProximos.map((ev, index) => {
                const colorLimpio = (ev.color || 'blue').replace('bg-', '').replace('-500', '');
                const colorClase = colorStyles[colorLimpio] || colorStyles["blue"];
                return (
                  <div key={`evento-${index}`} className={`${colorClase} p-2 font-medium border border-gray-800 shadow-sm text-sm rounded`}>
                    {formatDateText(ev.fecha)}, {ev.titulo}
                  </div>
                );
              })
            )}

            <div className="border border-gray-300 rounded mt-auto p-4 w-full overflow-x-auto">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-800 capitalize">{monthName}</h4>
                <div className="text-gray-500 font-bold tracking-widest cursor-pointer select-none">
                  <span onClick={prevMonth} className="hover:text-blue-600 px-2 text-lg">&lt;</span>
                  <span onClick={nextMonth} className="hover:text-blue-600 px-2 text-lg">&gt;</span>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center text-xs font-bold text-[#0033a0] mb-2">
                <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
              </div>
              <div className="grid grid-cols-7 text-center text-sm gap-y-2">
                {daysArray.map((day, index) => {
                  if (!day) return <div key={index}></div>;
                  
                  const checkDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  
                  const eventForDay = eventosMini.find((t) => {
                     if (!t.fecha) return false;
                     return t.fecha.split("T")[0].split(" ")[0] === checkDate;
                  });

                  let styleClass = "bg-transparent hover:bg-gray-100 text-gray-700 font-medium";
                  if (eventForDay) {
                    const colorLimpio = (eventForDay.color || 'blue').replace('bg-', '').replace('-500', '');
                    const bg = colorStyles[colorLimpio]?.split(' ')[0] || 'bg-[#0033a0]';
                    styleClass = `${bg} text-white font-bold`;
                  } else if (day === hoyReal.getDate() && month === hoyReal.getMonth() && year === hoyReal.getFullYear()) {
                    styleClass = "bg-blue-50 border border-[#0033a0] text-[#0033a0] font-extrabold";
                  }

                  return (
                    <div key={index} className="flex justify-center items-center p-0.5">
                      <span className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${styleClass}`}>
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border-t-2 border-gray-200 p-5 shrink-0 flex justify-center">
            <button onClick={() => navigate("/acudiente/calendario")} className="w-full bg-[#0033a0] text-white px-4 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-all shadow-md hover:shadow-lg">
              Abrir Calendario Completo
            </button>
          </div>
        </div>
        
        <div className="w-full bg-white border-2 border-gray-200 rounded-xl shadow-md p-4 sm:p-5 flex flex-col min-h-[400px]">
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