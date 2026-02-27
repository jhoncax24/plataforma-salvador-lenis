export default function InicioDocente() {
  return (
    <section className="w-full md:w-2/3 flex flex-col justify-center bg-white shadow-md rounded-xl m-6 p-6">
      <h2 className="text-2xl font-semibold text-center mb-6">Ayuda</h2>

      <br />
      <br />


      {/* Contenedor gris */}
      <div className="bg-gray-200 p-10 rounded-lg flex flex-col items-center text-center">

        {/* Texto guía */}
        <p className="text-gray-700 mb-3">
          ¿No sabes cómo interactuar o usar la página?
        </p>

        {/* Manual de uso */}
        <a
          href="#"
          className="text-blue-600 underline hover:text-blue-800 mb-6"
        >
          Haz clic aquí para ver el manual de uso
        </a>

        {/* Contacto soporte */}
        <p className="text-gray-700 mb-3">Contacta con soporte</p>

        {/* Icono + correo */}
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="M3 5l9 6 9-6m-18 0v14h18V5m-18 14l9-6 9 6" />
          </svg>

          <a
            href="mailto:Desarrolladores@gmail.com"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Desarrolladores@gmail.com
          </a>
        </div>
      </div>
    </section>
  );
}
