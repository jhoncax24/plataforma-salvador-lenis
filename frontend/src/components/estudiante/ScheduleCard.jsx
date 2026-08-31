import React from "react";
// 👇 NUEVO: Importamos useNavigate para el botón de detalles
import { useNavigate } from "react-router-dom"; 
// FORMA CORRECTA DE IMPORTAR PARA EVITAR EL ERROR DE AUTOTABLE
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function ScheduleCard({ student, schedule = [], faltas = 0 }) {
  // 👇 NUEVO: Inicializamos navigate
  const navigate = useNavigate(); 

  // Días de la semana obligatorios para las columnas
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  // Extraemos las horas únicas (ej: 07:00 - 08:30) y las ordenamos
  const horasUnicas = [...new Set(schedule.map(s => s.bloque_hora))].sort();

  // Función para generar y descargar el PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(0, 51, 160); 
    doc.text("Centro Educativo Salvador Lenis", 14, 16);

    doc.setFontSize(14);
    doc.setTextColor(100); 
    doc.text("Horario de Clases", 14, 25);

    doc.setFontSize(12);
    doc.text("Año Lectivo: 2025-2026", 14, 32);

    doc.setFontSize(11);
    doc.setTextColor(100);
    const gradoTexto = student?.grado ? student.grado : "No asignado";
    const docTexto = student?.documento ? student.documento : "N/A";
    doc.text(`Estudiante: ${student?.nombre || 'No registrado'} | Grado: ${gradoTexto} | Documento: ${docTexto}`, 14, 39);

    const tableData = horasUnicas.map(hora => {
      const fila = [hora]; 
      dias.forEach(dia => {
        const clase = schedule.find(s => s.bloque_hora === hora && s.dia_semana === dia);
        fila.push(clase ? clase.materia : "---");
      });
      return fila;
    });

    autoTable(doc, {
      startY: 46, 
      head: [["Hora", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [0, 51, 160], textColor: [255, 255, 255] }, 
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { fontSize: 10, cellPadding: 4, halign: "center" }
    });

    doc.save(`Horario_${student?.nombre || 'Estudiante'}.pdf`);
  };

  return (
    <div className="bg-[#e9ecef] border-2 border-gray-400 rounded flex flex-col h-full shadow-sm">
      <h3 className="text-xl text-center text-gray-800 py-4 border-b-2 border-gray-400 m-0 font-bold">Tu horario e información</h3>

      {/* Cuadro Blanco (Le añadimos max-h-[350px] y overflow-y-auto) */}
      <div className="bg-white p-4 w-full overflow-x-auto overflow-y-auto max-h-[400px]">

        <h4 className="text-center text-gray-700 font-semibold mb-2 mt-2">
          Año Lectivo: 2025-2026
        </h4>
        
        <table className="w-full border-collapse border border-gray-300 text-center text-xs text-gray-600 mb-4 mt-4 hidden md:table">
          <thead>
            <tr className="bg-gray-50 text-gray-700">
              <th className="py-2 px-1 border border-gray-300 font-bold w-1/6">Hora</th>
              {dias.map(dia => (
                <th key={dia} className="py-2 border border-gray-300 font-bold w-1/6">{dia}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.length === 0 ? (
              <tr><td colSpan="6" className="py-4 text-center text-gray-500 text-sm">No hay horario registrado para tu grado.</td></tr>
            ) : (
              horasUnicas.map(hora => {
                const [inicio, fin] = hora.split(' - ');

                if (inicio === "09:30" && fin === "10:00") {
                  return (
                    <tr key={hora} className="bg-gray-200">
                      <td className="py-2 px-1 border border-gray-300 font-bold text-gray-700 leading-tight text-[11px]">
                        {inicio} - <br /> {fin}
                      </td>
                      <td colSpan="5" className="py-2 px-1 border border-gray-300 font-bold text-gray-600 tracking-[0.2em] text-sm bg-gray-100">
                         DESCANSO / RECESO 
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={hora} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-1 border border-gray-300 font-semibold bg-gray-50 leading-tight text-[11px]">
                      {inicio} - <br /> {fin}
                    </td>

                    {dias.map(dia => {
                      const clase = schedule.find(s => s.bloque_hora === hora && s.dia_semana === dia);
                      const nombreMateria = clase ? clase.materia : "---";
                      
                      return (
                        <td key={dia} className="py-2 px-1 border border-gray-300">
                          {nombreMateria}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* TARJETAS MÓVILES: Horario apilado para pantallas pequeñas */}
        <div className="flex flex-col gap-3 md:hidden mt-4">
          {horasUnicas.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">No hay horario registrado.</p>
          ) : (
            horasUnicas.flatMap(hora => {
              const [inicio, fin] = hora.split(' - ');
              return dias
                .map(dia => {
                  const clase = schedule.find(s => s.bloque_hora === hora && s.dia_semana === dia);
                  return clase ? (
                    <div key={`${clase.dia_semana}-${clase.bloque_hora}`} className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm flex flex-col gap-1.5">
                      <p className="text-xs font-bold text-gray-500 uppercase">Día: {clase.dia_semana}</p>
                      <p className="text-xs font-bold text-gray-500">Hora: {inicio} - {fin}</p>
                      <p className="font-semibold text-[#0033a0] text-sm break-words">{clase.materia}</p>
                    </div>
                  ) : null;
                })
                .filter(Boolean);
            })
          )}
        </div>

      </div>
      
      <div className="bg-[#e9ecef] flex flex-col items-center justify-center p-6 flex-1 w-full">
        <button
          onClick={handleDownloadPDF}
          className="bg-[#0033a0] text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition-colors w-3/4 shadow"
        >
          Descargar Horario PDF
        </button>
      </div>

      {/* Cuadro Gris Inferior con mt-auto */}
      <div className="bg-[#e9ecef] flex flex-col items-center border-t-2 border-gray-400 p-6 mt-auto w-full">

        {/* 👇 NUEVO: Lógica dinámica para el mensaje de asistencias 👇 */}
        <div className="w-[90%] mb-6">
          {faltas === 0 ? (
            <div className="bg-green-50 p-3 rounded-lg shadow-sm text-center border border-green-200">
              <p className="text-green-700 font-semibold flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                ¡Asistencia Perfecta!
              </p>
              <p className="text-green-600 text-sm mt-1">
                No tienes ninguna falta. ¡Tu compromiso es impresionante, sigue así!
              </p>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow-sm text-center border border-gray-300 flex flex-col items-center">
              <p className="text-gray-700 font-medium mb-3">
                Faltas o retrasos acumulados:
                <span className="font-bold ml-2 text-xl text-red-600">
                  {faltas}
                </span>
              </p>
              <button 
                onClick={() => navigate('/estudiante/asistencia')} 
                className="text-sm bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-100 transition-colors font-medium shadow-sm w-max"
              >
                Ver detalle de inasistencias
              </button>
            </div>
          )}
        </div>

        {/* Información del estudiante */}
        <div className="w-full text-center text-sm text-gray-800 space-y-3">
          <p>Nombre: <span className="font-semibold">{student?.nombre || 'No registrado'}</span></p>
          <p>Edad: <span className="font-semibold">{student?.edad || 'N/A'}</span></p>
          <p>Documento: <span className="font-semibold">{student?.documento || 'No registrado'}</span></p>
          <p>Grado Escolar: <span className="font-semibold">{student?.grado || 'No asignado'}</span></p>
          <p>Acudiente: <span className="font-semibold">{student?.acudiente || 'Sin asignar'}</span></p>
        </div>
      </div>
    </div>
  );
}