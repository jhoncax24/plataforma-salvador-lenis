import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function CertificadoModal({ isOpen, onClose, estudiante, tipo, notas = [] }) {
  const certificadoRef = useRef();

  if (!isOpen || !estudiante) return null;

  const hoy = new Date();
  const fechaTexto = `${hoy.getDate()} días del mes de ${hoy.toLocaleString('es-ES', { month: 'long' })} de ${hoy.getFullYear()}`;

  const descargarPDF = async () => {
    const element = certificadoRef.current;
    const canvas = await html2canvas(element, { 
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Certificado_${tipo}_${estudiante.nombre.replace(/ /g, "_")}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[100] p-4 overflow-y-auto backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl relative flex flex-col max-h-[95vh]">
        
        {/* BARRA SUPERIOR / HEADER DEL MODAL */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-xl">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-gray-700 hidden md:block">Vista Previa: Certificado de {tipo}</h2>
            <button 
              onClick={descargarPDF} 
              className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm text-sm"
            >
              Descargar PDF
            </button>
          </div>

          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
            aria-label="Cerrar"
          >
            <span className="text-3xl leading-none font-light">&times;</span>
          </button>
        </div>

        {/* ÁREA DE PREVISUALIZACIÓN */}
        <div className="flex-1 overflow-y-auto bg-gray-200 p-4 md:p-8 flex justify-center">
          
          {/* LA HOJA DEL CERTIFICADO */}
          <div 
            ref={certificadoRef} 
            className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm] p-12 md:p-20 text-gray-800 flex flex-col"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
          >
            {/* Membrete */}
            <div className="text-center border-b-2 border-blue-900 pb-6 mb-10">
              <h1 className="text-3xl font-serif font-bold text-blue-900 uppercase tracking-wider">
                Centro Educativo Salvador Lenis
              </h1>
              <p className="text-sm italic text-gray-600 mt-1">"Excelencia Educativa para el Liderazgo"</p>
              <div className="text-[10px] text-gray-500 mt-2 uppercase">
                Resolución 4143.0.21.9999 de la Secretaría de Educación Municipal | NIT: 800.000.000-1
              </div>
            </div>

            <div className="text-center my-10">
              <h2 className="text-2xl font-bold underline decoration-1 underline-offset-8">
                {tipo === "Estudio" && "CERTIFICADO DE ESTUDIO"}
                {tipo === "Notas" && "CERTIFICADO DE CALIFICACIONES"}
                {tipo === "Conducta" && "CERTIFICADO DE CONDUCTA"}
              </h2>
            </div>

            <div className="text-justify text-lg leading-relaxed space-y-6 flex-1">
              <p className="font-bold">EL SUSCRITO RECTOR DEL CENTRO EDUCATIVO SALVADOR LENIS</p>
              
              <p className="text-center font-bold my-8">HACE CONSTAR O CERTIFICA:</p>

              {/* TEXTO COMPLETO DE ESTUDIO */}
              {tipo === "Estudio" && (
                <p>
                  Que el(la) estudiante <span className="font-bold">{estudiante.nombre}</span>, identificado(a) con 
                  documento número <span className="font-bold">{estudiante.documento}</span>, se encuentra 
                  formalmente vinculado(a) a esta institución educativa, cursando actualmente 
                  el grado <span className="font-bold">{estudiante.grado}</span> en el año lectivo presente.
                </p>
              )}

              {/* TEXTO COMPLETO DE CONDUCTA */}
              {tipo === "Conducta" && (
                <p>
                  Que el(la) estudiante <span className="font-bold">{estudiante.nombre}</span>, durante su proceso 
                  formativo en esta institución, ha observado un comportamiento ajustado a las normas de convivencia, 
                  demostrando valores de respeto, responsabilidad y compañerismo. Por tal motivo, se le asigna 
                  la calificación de <span className="font-bold uppercase">Excelente</span> en conducta.
                </p>
              )}

              {/* TABLA DINÁMICA DE NOTAS */}
              {tipo === "Notas" && (
                <div>
                  <p className="mb-6">Que el(la) estudiante <span className="font-bold">{estudiante.nombre}</span> registra el siguiente desempeño académico:</p>
                  <table className="w-full border-collapse border border-gray-400 text-sm">
                    <thead>
                      <tr className="bg-gray-100 uppercase">
                        <th className="border border-gray-400 p-2 text-left">Asignatura</th>
                        <th className="border border-gray-400 p-2 text-center w-16">P1</th>
                        <th className="border border-gray-400 p-2 text-center w-16">P2</th>
                        <th className="border border-gray-400 p-2 text-center w-16">P3</th>
                        <th className="border border-gray-400 p-2 text-center w-20">Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notas.length > 0 ? (
                        notas.map((n, index) => (
                          <tr key={index}>
                            <td className="border border-gray-400 p-2 font-medium">{n.materia}</td>
                            <td className="border border-gray-400 p-2 text-center">{n.nota_p1 || "-"}</td>
                            <td className="border border-gray-400 p-2 text-center">{n.nota_p2 || "-"}</td>
                            <td className="border border-gray-400 p-2 text-center">{n.nota_p3 || "-"}</td>
                            <td className="border border-gray-400 p-2 text-center font-bold bg-gray-50">{n.nota_final || "-"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="border border-gray-400 p-4 text-center text-gray-500 italic">No se registran calificaciones en el sistema para este estudiante.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="mt-12">
                Se expide la presente certificación a solicitud del interesado en la ciudad de Cali, 
                a los {fechaTexto}.
              </p>
            </div>

            <div className="mt-20 flex flex-col items-center">
              <div className="w-64 border-t border-black mb-2"></div>
              <p className="font-bold text-center">RECTORÍA GENERAL</p>
              <p className="text-sm text-gray-600">Centro Educativo Salvador Lenis</p>
            </div>

            <div className="mt-auto pt-10 text-[10px] text-gray-400 text-center">
              Este documento es válido para fines informativos y legales. Verificación en secretaría@salvadorlenis.edu.co
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}