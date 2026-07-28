import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerNotasEstudiante } from "../../api/perfilApi"; 
import { MdWarning, MdCheckCircle, MdLightbulb, MdChevronRight, MdEdit, MdLogout } from "react-icons/md";

export default function Certificados({ estudiantes = [] }) {
  const [estudianteId, setEstudianteId] = useState("");
  const [tipoCertificado, setTipoCertificado] = useState("Estudio");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSolicitar = async () => {
    if (!estudianteId) return alert("Por favor selecciona un estudiante");
    const estudianteSeleccionado = estudiantes.find(e => e.id === Number(estudianteId));

    if (tipoCertificado === "Notas") {
      setCargando(true);
      try {
        const notas = await obtenerNotasEstudiante(estudianteId);
        navigate("/acudiente/certificado", { state: { estudiante: estudianteSeleccionado, tipo: tipoCertificado, notas: notas || [] } });
      } catch (error) {
        alert("No se pudieron cargar las notas.");
      } finally {
        setCargando(false);
      }
    } else {
      navigate("/acudiente/certificado", { state: { estudiante: estudianteSeleccionado, tipo: tipoCertificado, notas: [] } });
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Estudiante:</label>
        <select value={estudianteId} onChange={(e) => setEstudianteId(e.target.value)} className="w-full border-2 border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#0033a0] font-medium text-gray-700 transition-colors">
          <option value="">-- Selecciona --</option>
          {estudiantes.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Documento:</label>
        <select value={tipoCertificado} onChange={(e) => setTipoCertificado(e.target.value)} className="w-full border-2 border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#0033a0] font-medium text-gray-700 transition-colors">
          <option value="Estudio">Certificado de Estudio</option>
          <option value="Notas">Certificado de Notas</option>
          <option value="Conducta">Certificado de Conducta</option>
        </select>
      </div>

      <div className="mt-auto pt-4">
        <button onClick={handleSolicitar} disabled={cargando} className={`w-full text-white py-2.5 rounded-lg font-bold transition-all shadow-md ${cargando ? "bg-gray-400 cursor-not-allowed" : "bg-[#0033a0] hover:bg-blue-800 hover:shadow-lg"}`}>
          {cargando ? "Consultando BD..." : "Generar Documento"}
        </button>
      </div>
    </div>
  );
}