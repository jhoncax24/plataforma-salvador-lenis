import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerHistorialAcademico } from "../../api/perfilApi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function HistorialAcademico() {
  const navigate = useNavigate();
  const [historialGlobal, setHistorialGlobal] = useState([]);
  const [gradosDisponibles, setGradosDisponibles] = useState([]);
  const [seleccion, setSeleccion] = useState("");
  const [loading, setLoading] = useState(true);

  const userStr = localStorage.getItem("cesl_user");
  const user = userStr ? JSON.parse(userStr) : null;
  const idUsuario = user?.id_usuario || user?.id;

  useEffect(() => {
    if (idUsuario) cargarDatos();
  }, [idUsuario]);

  const cargarDatos = async () => {
    setLoading(true);
    const data = await obtenerHistorialAcademico(idUsuario);
    setHistorialGlobal(data);
    
    // Extraer combinaciones únicas de "Grado - Año"
    const unicos = [...new Set(data.map(item => `${item.grado} (${item.anio_lectivo})`))];
    setGradosDisponibles(unicos);
    setLoading(false);
  };

  // Filtrar las notas según el grado seleccionado en el dropdown
  const notasFiltradas = historialGlobal.filter(
    item => `${item.grado} (${item.anio_lectivo})` === seleccion
  );

  // Lógica para descargar el PDF
  const handleDownloadPDF = () => {
    if (!seleccion) return;
    
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 160); 
    doc.text("Centro Educativo Salvador Lenis", 14, 16);

    doc.setFontSize(14);
    doc.setTextColor(100); 
    doc.text("Historial Académico (Boletín Final)", 14, 25);

    doc.setFontSize(12);
    doc.text(`Estudiante: ${user?.full_name || 'Estudiante'}`, 14, 32);
    doc.text(`Grado Cursado: ${seleccion}`, 14, 39);

    const tableData = notasFiltradas.map(n => [
      n.materia,
      n.docente,
      n.nota_p1,
      n.nota_p2,
      n.nota_p3,
      n.nota_p4,
      n.nota_definitiva
    ]);

    autoTable(doc, {
      startY: 46,
      head: [["Materia", "Docente", "P1", "P2", "P3", "P4", "Definitiva"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [0, 51, 160], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { fontSize: 10, cellPadding: 4, halign: "center" },
      columnStyles: { 0: { halign: "left" }, 1: { halign: "left" } }
    });

    doc.save(`Boletin_${seleccion}_${user?.full_name || 'Estudiante'}.pdf`);
  };

  return (
    <div className="w-[95%] max-w-[1400px] mx-auto pt-6 pb-12 animate-fade-in-up font-sans">
      
      {/* HEADER */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border-l-[6px] border-[#0033a0] mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-[#0033a0] m-0">Historial Académico</h2>
          <p className="text-gray-500 m-0 mt-1 font-medium">Consulta tus boletines de años anteriores</p>
        </div>
        <button onClick={() => navigate(-1)} className="mt-4 sm:mt-0 px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-colors shadow-sm">
          Volver al Menú
        </button>
      </div>

      {/* BARRA DE CONTROLES */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center mb-6 gap-4 shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="font-bold text-[#0033a0] whitespace-nowrap">Seleccionar Grado:</label>
          <select 
            className="p-2 border-2 border-gray-300 rounded-lg outline-none focus:border-[#0033a0] font-medium text-gray-700 w-full md:w-64 cursor-pointer"
            value={seleccion}
            onChange={(e) => setSeleccion(e.target.value)}
          >
            <option value="">-- Elige un año cursado --</option>
            {gradosDisponibles.map(grado => (
              <option key={grado} value={grado}>{grado}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleDownloadPDF}
          disabled={!seleccion}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all shadow-sm ${seleccion ? 'bg-gray-800 text-white hover:bg-gray-900 cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          <span>📥</span> Descargar PDF
        </button>
      </div>

      {/* ÁREA DE TABLA */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden min-h-[300px]">
        
        {!seleccion ? (
           <div className="flex flex-col items-center justify-center py-20 text-gray-400">
             <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
             <p className="font-medium text-lg">Selecciona un grado en el menú de arriba para ver el boletín.</p>
           </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-center border-collapse">
              <thead className="bg-[#0033a0] text-white">
                <tr>
                  <th className="py-4 px-6 font-bold text-left tracking-wide">Materia</th>
                  <th className="py-4 px-4 font-bold tracking-wide text-left">Docente</th>
                  <th className="py-4 px-3 font-bold">P1</th>
                  <th className="py-4 px-3 font-bold">P2</th>
                  <th className="py-4 px-3 font-bold">P3</th>
                  <th className="py-4 px-3 font-bold">P4</th>
                  <th className="py-4 px-4 font-bold tracking-wide">Nota Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {notasFiltradas.map((nota, index) => (
                  <tr key={index} className="hover:bg-blue-50 transition-colors">
                    <td className="py-4 px-6 text-left font-bold text-gray-800">{nota.materia}</td>
                    <td className="py-4 px-4 text-left text-gray-600 font-medium">{nota.docente}</td>
                    <td className="py-4 px-3 font-semibold text-gray-700">{nota.nota_p1}</td>
                    <td className="py-4 px-3 font-semibold text-gray-700">{nota.nota_p2}</td>
                    <td className="py-4 px-3 font-semibold text-gray-700">{nota.nota_p3}</td>
                    <td className="py-4 px-3 font-semibold text-gray-700">{nota.nota_p4}</td>
                    <td className="py-4 px-4">
                       <span className={`px-4 py-1.5 rounded-full font-bold text-sm shadow-sm inline-block w-16 text-center
                          ${nota.nota_definitiva < 3.0 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}
                        >
                          {nota.nota_definitiva}
                        </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}