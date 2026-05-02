import { useState } from "react";
import { obtenerNotasEstudiante } from "../../api/perfilApi"; // Importamos la función que ya teníamos
import CertificadoModal from "./CertificadoModal";

export default function Certificados({ estudiantes = [] }) {
  const [estudianteId, setEstudianteId] = useState("");
  const [tipoCertificado, setTipoCertificado] = useState("Estudio");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [notasCargadas, setNotasCargadas] = useState([]); // Estado para las notas reales
  const [cargando, setCargando] = useState(false);

  const handleSolicitar = async () => {
    if (!estudianteId) {
      alert("Por favor selecciona un estudiante");
      return;
    }

    if (tipoCertificado === "Notas") {
      setCargando(true);
      try {
        // Consultamos la BD antes de abrir el modal
        const notas = await obtenerNotasEstudiante(estudianteId);
        setNotasCargadas(notas || []);
        setModalAbierto(true);
      } catch (error) {
        console.error("Error al obtener notas:", error);
        alert("No se pudieron cargar las notas del estudiante.");
      } finally {
        setCargando(false);
      }
    } else {
      // Para estudio o conducta no necesitamos notas
      setNotasCargadas([]);
      setModalAbierto(true);
    }
  };

  const estudianteSeleccionado = estudiantes.find(e => e.id === Number(estudianteId));

  return (
    <div className="border-2 border-gray-700 p-6 bg-gray-100 h-full">
      <h3 className="text-xl font-semibold mb-4">Certificados y Documentos</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Seleccionar Estudiante:</label>
          <select
            value={estudianteId}
            onChange={(e) => setEstudianteId(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white"
          >
            <option value="">Seleccione...</option>
            {estudiantes.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Tipo de Certificado:</label>
          <select
            value={tipoCertificado}
            onChange={(e) => setTipoCertificado(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white"
          >
            <option value="Estudio">Certificado de Estudio</option>
            <option value="Notas">Certificado de Notas</option>
            <option value="Conducta">Certificado de Conducta</option>
          </select>
        </div>

        <button
          onClick={handleSolicitar}
          disabled={cargando}
          className={`w-full text-white py-2 rounded mt-2 font-semibold transition-colors ${
            cargando ? "bg-gray-400" : "bg-[#0033a0] hover:bg-blue-800"
          }`}
        >
          {cargando ? "Consultando..." : "Solicitar Documento"}
        </button>
      </div>

      <CertificadoModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        estudiante={estudianteSeleccionado}
        tipo={tipoCertificado}
        notas={notasCargadas} // Pasamos las notas reales al modal
      />
    </div>
  );
}