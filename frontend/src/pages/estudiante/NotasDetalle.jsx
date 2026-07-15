import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerNotasEstudiante } from "../../api/perfilApi";
import { MdLightbulb } from "react-icons/md";

export default function NotasDetalle() {
  const navigate = useNavigate();
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarNotas = async () => {
      try {
        const userStr = localStorage.getItem("cesl_user");
        if (!userStr) return setLoading(false);

        const user = JSON.parse(userStr);
        const idParaBuscar = user.id_usuario || user.id;

        if (idParaBuscar) {
          const data = await obtenerNotasEstudiante(idParaBuscar);
          setNotas(data);
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

      {/* CABECERA */}
      {/* HEADER */}
      <div className="w-full flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border-l-[6px] border-[#0033a0] mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 m-0">Planilla de Notas</h2>
          <p className="text-gray-500 mt-1 font-medium">Visualiza a detalle las notas de cada materia</p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-[#0033a0] hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow"
        >
          Volver
        </button>
      </div>
      <div className="w-full flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border-l-[6px] border-[#0033a0] mb-6">
        <p className="text-[#0033a0] text-sm md:text-base flex items-center gap-2">
          <MdLightbulb className="text-lg" />
          <span className="font-extrabold text-lg">Ayuda</span>
          <br />
          <span>Para ver las notas sacadas en cada periodo, haz clic en la materia.</span>
        </p>
      </div>


      {/* TABLA ESTILO MODERNO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center text-sm">

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

            <tbody className="divide-y divide-gray-200 text-gray-700">
              {loading ? (
                <tr><td colSpan="7" className="py-12 text-gray-500 font-medium text-lg">Cargando tu boletín...</td></tr>
              ) : notas.length === 0 ? (
                <tr><td colSpan="7" className="py-12 text-gray-500 font-medium text-lg">No hay materias asignadas a tu curso.</td></tr>
              ) : (
                notas.map((nota, index) => {

                  // Los valores ya vienen calculados de PostgreSQL (p1, p2, p3, p4, definitiva)
                  // Convertimos a número para asegurar la lógica visual
                  const p1 = parseFloat(nota.p1);
                  const p2 = parseFloat(nota.p2);
                  const p3 = parseFloat(nota.p3);
                  const p4 = parseFloat(nota.p4);
                  const def = parseFloat(nota.definitiva);

                  const isEven = index % 2 === 0;

                  return (
                    <tr
                      key={index}
                      onClick={() => navigate(`/estudiante/notas/${encodeURIComponent(nota.materia)}`)}
                      className={`${isEven ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-100 transition-colors duration-200 cursor-pointer group`}
                    >
                      <td className="py-5 px-6 font-extrabold text-left text-gray-800 group-hover:text-[#0033a0] transition-colors">
                        {nota.materia}
                      </td>

                      <td className="py-5 px-4 font-medium text-gray-500">{nota.docente}</td>

                      {/* Mostrar guiones si es 0, o la nota si existe */}
                      <td className="py-5 px-2 font-semibold">{p1 === 0 ? "-" : p1.toFixed(1)}</td>
                      <td className="py-5 px-2 font-semibold">{p2 === 0 ? "-" : p2.toFixed(1)}</td>
                      <td className="py-5 px-2 font-semibold">{p3 === 0 ? "-" : p3.toFixed(1)}</td>
                      <td className="py-5 px-2 font-semibold">{p4 === 0 ? "-" : p4.toFixed(1)}</td>

                      <td className="py-5 px-4">
                        <span className={`px-4 py-2 rounded-full font-black text-sm shadow-sm inline-block w-16 text-center
                          ${def === 0
                            ? 'bg-gray-200 text-gray-600'
                            : def < 3.0
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-green-100 text-green-700 border border-green-200'
                          }`}
                        >
                          {def === 0 ? "-" : def.toFixed(1)}
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