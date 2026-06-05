import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // <-- Importarlo así
import { obtenerHistorialAcademico } from "../../api/perfilApi"; // Asegúrate de que la ruta sea correcta

export default function HistorialAcademico() {
  const navigate = useNavigate();
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [historialDB, setHistorialDB] = useState({});
  const [loading, setLoading] = useState(true);

  // Llamada Real al Backend
  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const userStr = localStorage.getItem("cesl_user");
        if (!userStr) return;
        
        const user = JSON.parse(userStr);
        const idParaBuscar = user.id_usuario || user.id;

        if (idParaBuscar) {
          const data = await obtenerHistorialAcademico(idParaBuscar);
          
          // Agrupamos la respuesta plana del backend en un objeto separado por "grado"
          const datosAgrupados = {};
          data.forEach(item => {
            if (!datosAgrupados[item.grado]) {
              datosAgrupados[item.grado] = [];
            }
            datosAgrupados[item.grado].push(item);
          });
          
          setHistorialDB(datosAgrupados);
        }
      } catch (error) {
        console.error("Error cargando historial:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarHistorial();
  }, []);

  const gradosDisponibles = Object.keys(historialDB);
  const notasMostradas = gradoSeleccionado ? historialDB[gradoSeleccionado] : [];

  // ==========================================
  // LÓGICA PARA GENERAR EL PDF
  // ==========================================
  const descargarPDF = () => {
    if (!gradoSeleccionado || notasMostradas.length === 0) return;

    const doc = new jsPDF();
    const studentInfo = JSON.parse(localStorage.getItem("cesl_user"));
    const nombreEstudiante = studentInfo?.nombre_completo || "Estudiante";

    doc.setFontSize(18);
    doc.setTextColor(0, 51, 160);
    doc.text("Centro Educativo Salvador Lenis", 14, 20);
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(`Boletín Histórico - Grado ${gradoSeleccionado}`, 14, 28);
    doc.setFontSize(11);
    doc.text(`Estudiante: ${nombreEstudiante}`, 14, 35);
    
    const tableData = notasMostradas.map(n => [
      n.materia, n.docente, n.p1, n.p2, n.p3, n.p4, n.definitiva
    ]);

    // Generar la tabla en el documento (La forma moderna para Vite)
    autoTable(doc, {
      startY: 42,
      head: [["Materia", "Docente", "P1", "P2", "P3", "P4", "Nota Final"]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 51, 160] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    doc.save(`Boletin_${gradoSeleccionado}_${nombreEstudiante.replace(/\s+/g, '_')}.pdf`);
  };

  // ... (Aquí va el mismo return que ya teníamos)

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl shadow-md p-6 md:p-8 animate-fade-in-up">
      
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#0033a0]">Historial Académico</h2>
          <p className="text-gray-500 font-medium mt-1">Consulta tus boletines de años anteriores</p>
        </div>
        <button 
          onClick={() => navigate(-1)} 
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition-all shadow-sm"
        >
          Volver al Menú
        </button>
      </div>

      {/* ========================================== */}
      {/* BARRA DE CONTROLES Select + Botón PDF */}
      {/* ========================================== */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        
        <div className="flex items-center w-full md:w-auto gap-4">
          <label className="font-bold text-[#0033a0] whitespace-nowrap">Seleccionar Grado:</label>
          <select 
            value={gradoSeleccionado} 
            onChange={(e) => setGradoSeleccionado(e.target.value)}
            className="flex-1 md:w-64 p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#0033a0] bg-white font-medium text-gray-700 shadow-sm transition-colors"
          >
            <option value="">-- Elige un año cursado --</option>
            {gradosDisponibles.map(grado => (
              <option key={grado} value={grado}>Grado {grado}</option>
            ))}
          </select>
        </div>

        {/* Botón de PDF Dinámico (Desactivado si no hay grado) */}
        <button 
          onClick={descargarPDF}
          disabled={!gradoSeleccionado}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold shadow transition-all w-full md:w-auto justify-center
            ${!gradoSeleccionado 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg cursor-pointer'
            }`}
        >
          {/* Icono de descarga básico SVG */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Descargar PDF
        </button>
      </div>

      {/* ========================================== */}
      {/* TABLA DE BOLETÍN                           */}
      {/* ========================================== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[300px]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center text-sm">
            <thead className="bg-[#0033a0] text-white">
              <tr>
                <th className="py-4 px-6 font-bold text-left tracking-wide">Materia</th>
                <th className="py-4 px-4 font-bold tracking-wide">Docente</th>
                <th className="py-4 px-2 font-bold">P1</th>
                <th className="py-4 px-2 font-bold">P2</th>
                <th className="py-4 px-2 font-bold">P3</th>
                <th className="py-4 px-2 font-bold">P4</th>
                <th className="py-4 px-4 font-bold text-lg">Nota Final</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {!gradoSeleccionado ? (
                // Estado 1: No ha seleccionado nada
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="text-gray-400 font-medium text-lg flex flex-col items-center">
                      <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      Selecciona un grado en el menú de arriba para ver el boletín.
                    </div>
                  </td>
                </tr>
              ) : notasMostradas.length === 0 ? (
                // Estado 2: Seleccionó, pero no hay datos
                <tr><td colSpan="7" className="py-12 text-gray-500 font-medium text-lg">No hay registro de notas para este año.</td></tr>
              ) : (
                // Estado 3: Seleccionó y muestra datos
                notasMostradas.map((nota, index) => {
                  const isEven = index % 2 === 0;

                  return (
                    <tr key={index} className={`${isEven ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-100 transition-colors duration-200`}>
                      <td className="py-4 px-6 font-extrabold text-left text-gray-800">{nota.materia}</td>
                      <td className="py-4 px-4 font-medium text-gray-500">{nota.docente}</td>
                      <td className="py-4 px-2 font-semibold">{nota.p1}</td>
                      <td className="py-4 px-2 font-semibold">{nota.p2}</td>
                      <td className="py-4 px-2 font-semibold">{nota.p3}</td>
                      <td className="py-4 px-2 font-semibold">{nota.p4}</td>
                      <td className="py-4 px-4">
                        <span className={`px-4 py-1.5 rounded-full font-black text-sm shadow-sm inline-block w-16 text-center
                          ${nota.definitiva < 3.0 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}
                        `}>
                          {nota.definitiva}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}