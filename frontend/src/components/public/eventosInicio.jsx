import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import feria_ciencias from "../../assets/feria_ciencias.webp";
import dia_del_idioma from "../../assets/dia_del_idioma.png";
import semana_cultural from "../../assets/semana_cultural.png";
// import backgroundImage from "../../assets/fondoInicio.jpg";

// Se mueve fuera del componente para no recrear el arreglo en cada renderizado
const eventos = [
  {
    titulo: "Feria de Ciencias Anual",
    descripcion:
      "Nuestros estudiantes presentan sus innovadores proyectos en la feria de ciencias anual. ¡Ven y descubre el futuro!",
    imagen: feria_ciencias,
  },
  {
    titulo: "Día del Idioma",
    descripcion:
      "Celebramos la riqueza de nuestro idioma con obras, poesía y actividades literarias.",
    imagen: dia_del_idioma,
  },
  {
    titulo: "Semana Cultural",
    descripcion:
      "Nuestros estudiantes muestran su talento en danza, teatro, música y arte.",
    imagen: semana_cultural,
  },
];

export default function EventosInicio() {
  const [indice, setIndice] = useState(0);

  const siguiente = () => setIndice((prev) => (prev + 1) % eventos.length);
  const anterior = () =>
    setIndice((prev) => (prev - 1 + eventos.length) % eventos.length);

  useEffect(() => {
    // Al usar una función anónima nos evitamos warnings de dependencias en React
    const intervalo = setInterval(() => {
      setIndice((prev) => (prev + 1) % eventos.length);
    }, 10000);
    
    return () => clearInterval(intervalo);
  }, [indice]); // Se deja 'indice' para que el intervalo se reinicie si el usuario hace clic

  return (
    <div className="w-full flex flex-col justify-center bg-white shadow-md rounded-xl p-6">
      <h1 className="text-center text-2xl font-semibold mt-4 mb-4">
        Nuestros eventos
      </h1>

      <br />
      <br />

      <section className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden">
        <img
          src={eventos[indice].imagen}
          alt={eventos[indice].titulo}
          loading={indice === 0 ? "eager" : "lazy"}
          className="w-full h-[250px] sm:h-[350px] md:h-[450px] object-cover w-full rounded-lg shadow-sm transition-all duration-700"
        />

        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3 rounded-b-xl align-middle text-center">
          <h3 className="font-semibold text-lg text-white">{eventos[indice].titulo}</h3>
          <p className="text-sm leading-snug">{eventos[indice].descripcion}</p>
        </div>

        <button
          aria-label="Ver evento anterior"
          onClick={anterior}
          className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          aria-label="Ver evento siguiente"
          onClick={siguiente}
          className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full transition"
        >
          <ChevronRight size={24} />
        </button>
      </section>
    </div>
  );
}