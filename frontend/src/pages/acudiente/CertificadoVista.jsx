import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MdDownload } from "react-icons/md";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { obtenerNotasEstudiante, obtenerObservacionesHijo } from "../../api/perfilApi";
import { MdWarning, MdCheckCircle, MdLightbulb, MdChevronRight, MdEdit, MdLogout } from "react-icons/md";

export default function CertificadoVista() {
  const location = useLocation();
  const navigate = useNavigate();
  const certificadoRef = useRef();
  
  const { estudiante, tipo } = location.state || {};

  const [notasReales, setNotasReales] = useState([]);
  const [observacionesReales, setObservacionesReales] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!estudiante) return;

    const fetchDatosCertificado = async () => {
      setCargando(true);
      try {
        if (tipo === "Notas") {
          const notasBD = await obtenerNotasEstudiante(estudiante.id || estudiante.id_estudiante);
          setNotasReales(notasBD || []);
        } else if (tipo === "Conducta") {
          // 🚨 RESTAURADO: Volvemos a consultar las observaciones para el certificado de conducta
          const obsBD = await obtenerObservacionesHijo(estudiante.id || estudiante.id_estudiante);
          setObservacionesReales(obsBD || []);
        }
      } catch (error) {
        console.error("Error obteniendo datos para el certificado:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchDatosCertificado();
  }, [estudiante, tipo]);

  if (!estudiante) return <div className="min-h-screen flex flex-col justify-center items-center font-bold text-gray-600 bg-gray-50">Datos perdidos. <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">Volver</button></div>;

  const hoy = new Date();
  const fechaTexto = `${hoy.getDate()} días del mes de ${hoy.toLocaleString('es-ES', { month: 'long' })} de ${hoy.getFullYear()}`;

  const descargarPDF = async () => {
    const canvas = await html2canvas(certificadoRef.current, { scale: 2, useCORS: true, logging: false });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Certificado_${tipo}_${estudiante.nombre.replace(/ /g, "_")}.pdf`);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 sm:p-4 lg:p-6 flex flex-col items-center animate-fade-in-up">
      <div className="bg-white border-0 sm:border-2 border-gray-200 rounded-none sm:rounded-xl shadow-none sm:shadow-md p-4 sm:p-6 md:p-8 flex flex-col items-center w-full max-w-[1800px] flex-1 sm:flex-none">
        
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 bg-blue-50 p-4 sm:p-6 rounded-lg border-l-4 border-[#0033a0] shadow-sm gap-4">
          <div className="flex-1 text-left w-full">
            <h2 className="text-lg sm:text-xl font-bold text-[#0033a0] leading-tight">Vista Previa: Certificado de {tipo}</h2>
            <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">Revisa el documento oficial generado a partir de la base de datos.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button onClick={() => navigate(-1)} className="w-full sm:w-auto bg-gray-200 text-gray-700 px-6 py-3 sm:py-2 rounded-lg font-bold hover:bg-gray-300 transition-all shadow-sm text-center">Volver</button>
            <button onClick={descargarPDF} disabled={cargando} className={`w-full sm:w-auto text-white px-6 py-3 sm:py-2 rounded-lg font-bold transition-all shadow-md flex items-center justify-center gap-2 ${cargando ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0033a0] hover:bg-blue-800'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              {cargando ? "Cargando..." : "Descargar PDF"}
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto bg-gray-100 p-4 sm:p-8 rounded border border-gray-300 flex justify-center custom-scrollbar">
          <div ref={certificadoRef} className="bg-white shadow-lg sm:shadow-2xl w-[210mm] min-w-[210mm] min-h-[297mm] p-10 md:p-20 text-gray-800 flex flex-col mx-auto relative" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            <div className="text-center border-b-2 border-blue-900 pb-6 mb-10">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-blue-900 uppercase tracking-wider">Centro Educativo Salvador Lenis</h1>
              <p className="text-xs sm:text-sm italic text-gray-600 mt-1">"Excelencia Educativa para el Liderazgo"</p>
              <div className="text-[9px] sm:text-[10px] text-gray-500 mt-2 uppercase">Resolución 4143.0.21.9999 de la SEC | NIT: 800.000.000-1</div>
            </div>

            <div className="text-center my-8 sm:my-10">
              <h2 className="text-xl sm:text-2xl font-bold underline decoration-1 underline-offset-8">
                {tipo === "Estudio" && "CERTIFICADO DE ESTUDIO"}
                {tipo === "Notas" && "CERTIFICADO DE CALIFICACIONES"}
                {tipo === "Conducta" && "CERTIFICADO DE CONDUCTA"}
              </h2>
            </div>

            <div className="text-justify text-base sm:text-lg leading-relaxed space-y-6 flex-1 z-10 relative">
              <p className="font-bold">EL SUSCRITO RECTOR DEL CENTRO EDUCATIVO SALVADOR LENIS</p>
              <p className="text-center font-bold my-6 sm:my-8">HACE CONSTAR O CERTIFICA:</p>

              {tipo === "Estudio" && (
                <p>Que el(la) estudiante <span className="font-bold">{estudiante.nombre}</span>, identificado(a) con documento número <span className="font-bold">{estudiante.documento}</span>, se encuentra formalmente vinculado(a) a esta institución educativa, cursando actualmente el grado <span className="font-bold">{estudiante.grado}</span> en el año lectivo presente.</p>
              )}
              
              {tipo === "Conducta" && (
                <div className="w-full">
                  <p className="mb-4">Que el(la) estudiante <span className="font-bold">{estudiante.nombre}</span> se encuentra matriculado en la institución. A continuación, se detalla el reporte disciplinario oficial registrado en su observador durante el año lectivo:</p>
                  
                  {observacionesReales.length === 0 ? (
                    <p className="text-center italic text-gray-600 my-4 border p-4">El estudiante no presenta llamados de atención ni faltas disciplinarias registradas.</p>
                  ) : (
                    <table className="w-full border-collapse border border-gray-400 text-xs sm:text-sm mb-6">
                      <thead>
                        <tr className="bg-gray-100 uppercase">
                          <th className="border border-gray-400 p-2 text-center w-24">Fecha</th>
                          <th className="border border-gray-400 p-2 text-center w-28">Tipo</th>
                          <th className="border border-gray-400 p-2 text-left">Anotación</th>
                          <th className="border border-gray-400 p-2 text-left w-32">Docente</th>
                        </tr>
                      </thead>
                      <tbody>
                        {observacionesReales.map(obs => (
                          <tr key={obs.id_observacion}>
                            <td className="border border-gray-400 p-2 text-center">{obs.fecha_formato.split(' ')[0]}</td>
                            <td className="border border-gray-400 p-2 text-center font-bold">{obs.tipo}</td>
                            <td className="border border-gray-400 p-2 break-words">{obs.descripcion}</td>
                            <td className="border border-gray-400 p-2 break-words">{obs.nombre_docente}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {tipo === "Notas" && (
                <div className="overflow-hidden">
                  <p className="mb-6">Que el(la) estudiante <span className="font-bold">{estudiante.nombre}</span> registra el siguiente desempeño académico en nuestra base de datos:</p>
                  <table className="w-full border-collapse border border-gray-400 text-xs sm:text-sm table-fixed">
                    <thead>
                      <tr className="bg-gray-100 uppercase">
                        <th className="border border-gray-400 p-2 text-left w-[40%]">Asignatura</th>
                        <th className="border border-gray-400 p-2 text-center w-[12%]">P1</th>
                        <th className="border border-gray-400 p-2 text-center w-[12%]">P2</th>
                        <th className="border border-gray-400 p-2 text-center w-[12%]">P3</th>
                        <th className="border border-gray-400 p-2 text-center w-[12%]">P4</th>
                        <th className="border border-gray-400 p-2 text-center w-[12%]">Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notasReales && notasReales.length > 0 ? notasReales.map((n, idx) => (
                        <tr key={idx}>
                          <td className="border border-gray-400 p-2 font-medium truncate">{n.materia || n.nombre}</td>
                          <td className="border border-gray-400 p-2 text-center">{n.nota_p1 ?? n.p1 ?? "0.0"}</td>
                          <td className="border border-gray-400 p-2 text-center">{n.nota_p2 ?? n.p2 ?? "0.0"}</td>
                          <td className="border border-gray-400 p-2 text-center">{n.nota_p3 ?? n.p3 ?? "0.0"}</td>
                          <td className="border border-gray-400 p-2 text-center">{n.nota_p4 ?? n.p4 ?? "0.0"}</td>
                          <td className="border border-gray-400 p-2 text-center font-bold bg-gray-50">{n.nota_final ?? n.definitiva ?? "0.0"}</td>
                        </tr>
                      )) : <tr><td colSpan="6" className="border border-gray-400 p-4 text-center italic text-gray-500">Aún no existen calificaciones consolidadas en este periodo.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="mt-8 sm:mt-12">Se expide la presente certificación a solicitud del interesado en la ciudad de Cali, a los {fechaTexto}.</p>
            </div>

            {/* FIRMA DIGITAL INSTALADA */}
            <div className="mt-20 flex flex-col items-center relative">
              <img 
                src="/firma.png" 
                alt="Firma Digital Rector" 
                className="w-32 sm:w-44 absolute -top-12 sm:-top-16 opacity-90 z-0 pointer-events-none"
              />
              <div className="w-48 sm:w-64 border-t border-black mb-2 z-10 relative"></div>
              <p className="font-bold text-center text-sm sm:text-base z-10 relative">RECTORÍA GENERAL</p>
              <p className="text-xs sm:text-sm text-gray-600 z-10 relative">Centro Educativo Salvador Lenis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}