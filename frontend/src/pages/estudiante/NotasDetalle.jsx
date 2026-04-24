import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerNotasEstudiante } from "../../api/perfilApi";

export default function NotasDetalle() {
  const navigate = useNavigate();
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarNotas = async () => {
      try {
        const userStr = localStorage.getItem("cesl_user");
        if (!userStr) {
          console.error("No se encontró sesión activa.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(userStr);
        // 👇 MAGIA AQUÍ: Buscamos el ID sin importar cómo lo guardó el Login 👇
        const idParaBuscar = user.id_usuario || user.id; 

        if (idParaBuscar) {
          const data = await obtenerNotasEstudiante(idParaBuscar);
          setNotas(data);
        } else {
          console.error("El usuario en localStorage no tiene ID:", user);
        }
      } catch (error) {
        console.error("Error al cargar el detalle de notas:", error);
      } finally {
        setLoading(false);
      }
    };
    
    cargarNotas();
  }, []);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl shadow-md p-6 md:p-8 animate-fade-in-up">
      
      {/* ========================================== */}
      {/* CABECERA: INSTRUCCIÓN + BOTÓN VOLVER       */}
      {/* ========================================== */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-center mb-8 bg-blue-50 p-4 rounded-lg border-l-4 border-[#0033a0] shadow-sm gap-4">
        
        {/* Mensaje Informativo */}
        <div className="flex-1 text-center md:text-left px-2">
          <p className="text-[#0033a0] text-sm md:text-base">
            <span className="font-extrabold text-lg mr-2">💡 Tip:</span>
            Para ver las notas sacadas en cada periodo (Tareas, Evaluaciones, Talleres), <strong className="underline cursor-pointer">haz clic en la materia</strong> que deseas consultar.
          </p>
        </div>

        {/* Botón Volver */}
        <button 
          onClick={() => navigate(-1)} 
          className="bg-[#0033a0] text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 transition-all shadow hover:shadow-lg whitespace-nowrap"
        >
          Volver al Menú
        </button>
      </div>

      {/* ========================================== */}
      {/* TABLA ESTILO MODERNO                       */}
      {/* ========================================== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center text-sm">
            
            {/* Encabezado Azul Moderno */}
            <thead className="bg-[#0033a0] text-white">
              <tr>
                <th className="py-4 px-6 font-bold text-left tracking-wide">Materia</th>
                <th className="py-4 px-4 font-bold tracking-wide">Docente</th>
                <th className="py-4 px-2 font-bold">Periodo I</th>
                <th className="py-4 px-2 font-bold">Periodo II</th>
                <th className="py-4 px-2 font-bold">Periodo III</th>
                <th className="py-4 px-2 font-bold">Periodo IV</th>
                <th className="py-4 px-4 font-bold text-lg">Nota Final</th>
              </tr>
            </thead>
            
            {/* Cuerpo de la Tabla */}
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {loading ? (
                <tr><td colSpan="7" className="py-12 text-gray-500 font-medium text-lg">Cargando tu boletín...</td></tr>
              ) : notas.length === 0 ? (
                <tr><td colSpan="7" className="py-12 text-gray-500 font-medium text-lg">No hay notas registradas.</td></tr>
              ) : (
                notas.map((nota, index) => {
                  // Lógica para que las filas pares tengan un fondito gris muy suave (Efecto cebra)
                  const isEven = index % 2 === 0;

                  return (
                    <tr 
                      key={index} 
                      onClick={() => navigate(`/estudiante/notas/${encodeURIComponent(nota.materia)}`)}
                      className={`${isEven ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-100 transition-colors duration-200 cursor-pointer group`}
                    >
                      {/* Materia (Se pone azul al pasar el mouse) */}
                      <td className="py-5 px-6 font-extrabold text-left text-gray-800 group-hover:text-[#0033a0] transition-colors">
                        {nota.materia}
                      </td>
                      
                      <td className="py-5 px-4 font-medium text-gray-500">{nota.docente}</td>
                      
                      {/* Notas de los Periodos */}
                      <td className="py-5 px-2 font-semibold">{nota.p1 === "0" || nota.p1 === 0 ? "-" : nota.p1}</td>
                      <td className="py-5 px-2 font-semibold">{nota.p2 === "0" || nota.p2 === 0 ? "-" : nota.p2}</td>
                      <td className="py-5 px-2 font-semibold">{nota.p3 === "0" || nota.p3 === 0 ? "-" : nota.p3}</td>
                      <td className="py-5 px-2 font-semibold">{nota.p4 === "0" || nota.p4 === 0 ? "-" : nota.p4}</td>
                      
                      {/* Nota Final con diseño de "Píldora" (Badge) */}
                      <td className="py-5 px-4">
                        <span className={`px-4 py-2 rounded-full font-black text-sm shadow-sm inline-block w-16 text-center
                          ${nota.definitiva === "0.0" || nota.definitiva === 0 
                              ? 'bg-gray-200 text-gray-600' 
                              : nota.definitiva < 3.0 
                                ? 'bg-red-100 text-red-700 border border-red-200' 
                                : 'bg-green-100 text-green-700 border border-green-200'
                          }`}
                        >
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