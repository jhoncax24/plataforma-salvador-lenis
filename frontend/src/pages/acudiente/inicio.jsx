import { useEffect, useState } from "react";

// Tarjetas y componentes de la vista
import Certificados from "../../components/acudiente/Certificados";
import NotasPeriodo from "../../components/acudiente/NotasPeriodo";
import Calendario from "../../components/acudiente/Calendario";

// Modales
import PerfilModal from "../../components/acudiente/PerfilModal";
import EditarDatosModal from "../../components/acudiente/EditarDatosModal";
import CambiarPasswordModal from "../../components/acudiente/CambiarPasswordModal";
import NotasModal from "../../components/acudiente/NotasModal";

// Funciones de la API
import {
  obtenerPerfilAcudiente,
  obtenerHijos,
  obtenerNotasEstudiante
} from "../../api/perfilApi";

export default function AcudienteInicio() {
  // 1. Estado principal (igual que tu 'data' en estudiante)
  const [data, setData] = useState(null);

  // Estados de los modales (específicos de esta vista)
  const [perfilOpen, setPerfilOpen] = useState(false);
  const [editarOpen, setEditarOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [editarDataTarget, setEditarDataTarget] = useState(null);
  
  const [notasOpen, setNotasOpen] = useState(false);
  const [notasEstudiante, setNotasEstudiante] = useState(null);
  const [notasData, setNotasData] = useState([]);

  // 2. useEffect para cargar los datos igual que en el estudiante
 // 2. useEffect para cargar los datos
  useEffect(() => {
    const loadData = async () => {
      try {
        // Leemos el usuario del localStorage
        const userStr = localStorage.getItem("cesl_user");
        let user = null;
        
        // Protegemos el parseo por si el localStorage tiene basura
        if (userStr && userStr !== "undefined") {
            try { user = JSON.parse(userStr); } catch (e) { console.error("Error parseando usuario:", e); }
        }

        // ¡EL TRUCO ESTÁ AQUÍ! 
        // Si user tiene id, lo usamos. Si no, forzamos el ID 1 temporalmente.
        const acudienteId = user?.id ? user.id : 1; 

        // Hacemos las llamadas a la API usando el ID seguro
        const [profileRes, hijosRes] = await Promise.all([
          obtenerPerfilAcudiente(acudienteId),
          obtenerHijos(acudienteId)
        ]);

        setData({
          profile: profileRes,
          hijos: hijosRes
        });
      } catch (error) {
        console.error("Error al cargar datos del acudiente", error);
        // Fallback en caso de que el backend falle
        setData({
          profile: { nombre: "Acudiente de Prueba (Fallback)" },
          hijos: [{ id: 1, nombre: "Hijo Prueba (Fallback)", grado: "Noveno" }]
        });
      }
    };

    loadData();
  }, []);

  // Funciones de acción
  const handleVerNotas = async (idEstudiante) => {
    try {
      const estudiante = data.hijos.find((h) => h.id === idEstudiante);
      const notas = await obtenerNotasEstudiante(idEstudiante);
      setNotasEstudiante(estudiante);
      setNotasData(notas);
      setNotasOpen(true);
    } catch (err) {
      console.error("Error obteniendo notas:", err);
    }
  };

  const handleEdit = (target) => {
    setEditarDataTarget(target);
    setEditarOpen(true);
  };

  // 3. Pantalla de carga (Igual que en estudiante)
  if (!data) return <div>Cargando...</div>;

  // 4. Renderizado principal
  return (
    <div>
      {/* Encabezado del dashboard con tu estilo cesl-panel */}
      <div className="cesl-panel mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Buenos Días</h2>
          <div className="text-lg">{data.profile.nombre}</div>
          <div className="text-sm text-gray-500">Acudiente de {data.hijos.map((h) => h.nombre).join(", ")}</div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setPerfilOpen(true)} 
            className="bg-[#0033a0] hover:bg-blue-800 text-white px-4 py-2 rounded transition"
          >
            Ver Perfil
          </button>
          <img
            src="/assets/profile_placeholder.png"
            alt="profile"
            className="w-20 h-20 rounded-full border"
          />
        </div>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Certificados />
        <NotasPeriodo hijos={data.hijos} onVerNotas={handleVerNotas} />
        <Calendario />
      </div>

      {/* Modales */}
      <PerfilModal
        isOpen={perfilOpen}
        onClose={() => setPerfilOpen(false)}
        profile={data.profile}
        hijos={data.hijos}
        onEdit={handleEdit}
        onChangePassword={() => setPassOpen(true)}
      />

      <EditarDatosModal
        isOpen={editarOpen}
        onClose={() => setEditarOpen(false)}
        data={editarDataTarget}
      />

      <CambiarPasswordModal
        isOpen={passOpen}
        onClose={() => setPassOpen(false)}
      />

      <NotasModal
        isOpen={notasOpen}
        onClose={() => setNotasOpen(false)}
        estudiante={notasEstudiante}
        notas={notasData}
      />
    </div>
  );
}