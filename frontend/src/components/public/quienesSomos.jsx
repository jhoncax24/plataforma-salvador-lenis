export default function QuienesSomos() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col justify-center bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-semibold text-center mb-8">
        Nosotros
      </h2>
      <div className="bg-gray-100 p-5 rounded-lg text-center shadow">
            <p className="break-words">
              En el Centro Educativo Salvador Lenis, nos enorgullece brindar una educación de muy alto nivel en los grados de Preescolar,
               Primaria y Básica secundaria. Nuestro compromiso radica en ofrecer un ambiente de aprendizaje seguro, estimulante y enriquecedor
                para nuestros estudiantes. Nos apasiona nutrir sus habilidades académicas, sociales y emocionales, fomentando su desarrollo
                 integral y preparándolos para los desafíos del futuro.
            </p>
          </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* MISIÓN */}
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4">Misión</h3>

          <div className="bg-gray-100 p-5 rounded-lg text-center shadow">
            <p className="break-words">
              El Centro Educativo SALVADOR LENIS respondiendo a las necesidades de los estudiantes y del contexto, 
              forma líderes en Tecnologías de la Información y la Comunicación (TIC) con alto grado de autonomía, 
              creatividad, con sentido crítico; capaces de transformar sus realidades, atendiendo a los valores y
               el respeto por sí mismo, por los demás y por el entorno.
            </p>

          </div>

          <div className="w-32 h-32 bg-[#6366F1] rounded-lg flex items-center justify-center mt-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>

        {/* VISIÓN */}
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4">Visión</h3>

          <div className="bg-gray-100 p-5 rounded-lg text-center shadow">
            <p className="break-words">
              El centro educativo SALVADOR LENIS para el año 2028, será reconocido en el corregimiento de Rozo por su calidad educativa, 
              su competitividad e innovación en TIC, basada en los principios y valores con alto impacto en el contexto social; educando 
              integralmente líderes transformadores de la región vallecaucana.
            </p>
          </div>

          <div className="w-32 h-32 bg-[#6366F1] rounded-lg flex items-center justify-center mt-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>

      </div>
    </section>
  );
}
