import React from "react";
// Importaciones mágicas para el PDF
// FORMA CORRECTA DE IMPORTAR PARA EVITAR EL ERROR DE AUTOTABLE
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function ScheduleCard({ student, schedule = [] }) {

  // Días de la semana obligatorios para las columnas
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  // Extraemos las horas únicas (ej: 07:00 - 08:30) y las ordenamos
  const horasUnicas = [...new Set(schedule.map(s => s.bloque_hora))].sort();

  // Función para generar y descargar el PDF
 const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // 1. Título del Colegio (Arriba del todo, Y = 16)
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 160); // Azul del colegio
    doc.text("Centro Educativo Salvador Lenis", 14, 16);

    // 2. Subtítulo (Y = 25)
    doc.setFontSize(14);
    doc.setTextColor(100); // Gris
    doc.text("Horario de Clases", 14, 25);

    // 3. Año Lectivo (Y = 32)
    doc.setFontSize(12);
    doc.text("Año Lectivo: 2025-2026", 14, 32);

    // 4. Info del Estudiante (Y = 39)
    doc.setFontSize(11);
    doc.setTextColor(100);
    const gradoTexto = student?.grado ? student.grado : "No asignado";
    const docTexto = student?.documento ? student.documento : "N/A";
    doc.text(`Estudiante: ${student?.nombre || 'No registrado'} | Grado: ${gradoTexto} | Documento: ${docTexto}`, 14, 39);

    // 2. Preparar los datos de la cuadrícula
    const tableData = horasUnicas.map(hora => {
      const fila = [hora]; // Primera columna es la hora
      dias.forEach(dia => {
        // Buscamos si hay clase ese día a esa hora
        const clase = schedule.find(s => s.bloque_hora === hora && s.dia_semana === dia);
        fila.push(clase ? clase.materia : "---");
      });
      return fila;
    });

    // 3. Generar la tabla en el PDF
    autoTable(doc, {
      startY: 46, // Dejamos espacio para el título
      head: [["Hora", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [0, 51, 160], textColor: [255, 255, 255] }, // Azul cabecera
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { fontSize: 10, cellPadding: 4, halign: "center" }
    });

    // 4. Descargar
    doc.save(`Horario_${student?.nombre || 'Estudiante'}.pdf`);
  };

  return (
    <div className="bg-[#e9ecef] border-2 border-gray-400 rounded flex flex-col h-full shadow-sm">
      <h3 className="text-xl text-center text-gray-800 py-4 border-b-2 border-gray-400 m-0 font-bold">Tu horario e información</h3>

      {/* CUADRÍCULA DEL HORARIO REAL */}

      {/* Cuadro Blanco (Le añadimos max-h-[350px] y overflow-y-auto) */}
      <div className="bg-white p-4 w-full overflow-x-auto overflow-y-auto max-h-[400px]">

        {/* 👇 NUEVO: Título del Año Lectivo en la pantalla 👇 */}
        <h4 className="text-center text-gray-700 font-semibold mb-2 mt-2">
          Año Lectivo: 2025-2026
        </h4>
        {/* 👇 Le agregamos mt-4 al final de las clases de la tabla 👇 */}
        <table className="w-full border-collapse border border-gray-300 text-center text-xs text-gray-600 mb-4 mt-4">
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

                // 👇 MAGIA UX: Detectamos si es la hora de descanso para pintar una franja especial
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

                // Render normal para las clases
                return (
                  <tr key={hora} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-1 border border-gray-300 font-semibold bg-gray-50 leading-tight text-[11px]">
                      {inicio} - <br /> {fin}
                    </td>

                    {dias.map(dia => {
                      const clase = schedule.find(s => s.bloque_hora === hora && s.dia_semana === dia);
                      
                      // Pequeña validación por si es hora libre o no hay clase registrada
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



      </div>
      
      <div className="bg-[#e9ecef] flex flex-col items-center justify-center  p-6 flex-1 w-full">
        <button
          onClick={handleDownloadPDF}
          className="bg-[#0033a0] text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition-colors w-3/4 shadow"
        >
          Descargar Horario PDF
        </button>
      </div>


      {/* Cuadro Gris Inferior con mt-auto */}
      <div className="bg-[#e9ecef] flex flex-col items-center border-t-2 border-gray-400 p-6 mt-auto w-full">


        {/* 👇 NUEVO SEPARADOR: Línea gris con espacio arriba y abajo (my-6) 👇 */}
       
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