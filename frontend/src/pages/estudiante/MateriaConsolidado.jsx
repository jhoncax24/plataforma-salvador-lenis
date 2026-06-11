import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// IMPORTANTE: Ajusta la ruta de importación si es necesario
import { obtenerDetalleMateria } from "../../api/perfilApi"; 

export default function MateriaConsolidado() {
  const { materia } = useParams(); // Capturamos el nombre de la materia de la URL
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [periodos, setPeriodos] = useState({ P1: [], P2: [], P3: [], P4: [] });

  // Extraemos el ID del estudiante logueado
  const userStr = localStorage.getItem("cesl_user") || localStorage.getItem("usuario");
  const user = userStr ? JSON.parse(userStr) : null;
  const idUsuario = user?.id_usuario || user?.id;

  useEffect(() => {
    if (idUsuario && materia) {
      cargarDetalles();
    }
  }, [idUsuario, materia]);

  const cargarDetalles = async () => {
    setLoading(true);
    // Llamamos a la API con el ID del estudiante y el nombre de la materia
    const data = await obtenerDetalleMateria(idUsuario, materia);
    setPeriodos(data);
    setLoading(false);
  };

 // Función para calcular el promedio PONDERADO de un periodo específico
  const calcularPromedio = (notasArray) => {
    if (notasArray.length === 0) return "-";
    
    // Calculamos cuánto suma el porcentaje de lo que el profesor ha calificado hasta ahora
    const totalPorcentajeCalificado = notasArray.reduce((acc, curr) => acc + curr.porcentaje, 0);
    
    // Calculamos la sumatoria de (nota * porcentaje)
    const sumaPonderada = notasArray.reduce((acc, curr) => acc + (curr.nota * curr.porcentaje), 0);
    
    // Dividimos la nota ponderada entre el porcentaje evaluado hasta el momento
    // Esto evita que el estudiante vea un 1.5 de definitiva si el profesor solo ha subido una tarea del 30%
    const definitivaReal = sumaPonderada / totalPorcentajeCalificado;
    
    return definitivaReal.toFixed(1);
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-sm p-8 animate-fade-in-up">
      
      {/* Cabecera y Botón Volver */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b-2 border-gray-200 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-[#0033a0]">{materia}</h2>
          <p className="text-gray-500 font-medium mt-1">Consolidado de Actividades por Periodo</p>
        </div>
        <button 
          onClick={() => navigate(-1)} 
          className="bg-[#0033a0] text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition-colors shadow mt-4 md:mt-0"
        >
          Volver a Materias
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-semibold text-lg">Cargando actividades...</div>
      ) : (
        /* Cuadrícula de Periodos (1 columna en móviles, 4 columnas en PC) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {Object.entries(periodos).map(([periodo, actividades]) => {
            const promedio = calcularPromedio(actividades);
            
            return (
              <div key={periodo} className="border-2 border-gray-300 rounded-xl overflow-hidden flex flex-col">
                
                {/* Título del Periodo */}
                <div className="bg-[#f8f9fa] border-b-2 border-gray-300 p-4 text-center">
                  <h3 className="font-bold text-gray-800 text-lg">
                    {periodo === "P1" ? "Periodo I" : periodo === "P2" ? "Periodo II" : periodo === "P3" ? "Periodo III" : "Periodo IV"}
                  </h3>
                </div>

                {/* Lista de Actividades */}
                <div className="p-4 flex-1 bg-white">
                  {actividades.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 italic text-sm text-center">
                      El docente no ha registrado<br/>actividades aún.
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {actividades.map((act) => (
                        <li key={act.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                          <div className="flex flex-col truncate pr-2">
                            <span className="text-gray-600 font-bold">{act.actividad}</span>
                            <span className="text-[10px] text-gray-400 font-medium uppercase">Valor: {act.porcentaje}%</span>
                          </div>
                          <span className={`font-extrabold px-3 py-1 rounded-md shadow-sm ${act.nota < 3.0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {act.nota.toFixed(1)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Nota Final del Periodo */}
                <div className="bg-gray-100 p-3 flex justify-between items-center border-t-2 border-gray-300">
                  <span className="font-bold text-gray-700">Definitiva:</span>
                  <span className={`font-extrabold text-lg ${promedio < 3.0 && promedio !== "-" ? 'text-red-600' : 'text-[#0033a0]'}`}>
                    {promedio}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-8 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded text-sm text-center">
        <strong>Nota:</strong> Estas actividades son administradas directamente por el docente de la asignatura. Las notas pueden estar sujetas a cambios hasta el cierre del periodo.
      </div>

    </div>
  );
}