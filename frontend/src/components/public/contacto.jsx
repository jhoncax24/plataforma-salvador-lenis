export default function ComponentsContacto() {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col justify-center bg-white shadow-md rounded-xl">
            <h2 className="text-2xl font-semibold text-center mb-6">Contacto</h2>



            {/* ROLES */}
            <div className="grid grid-cols-2 text-center font-medium text-gray-700 mb-4">
                <p>Coordinadora</p>
                <p>Secretaria</p>
            </div>

            <hr className="border-gray-300 mb-6" />

            {/* TARJETAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* COORDINADORA */}
                <div className="bg-gray-100 p-5 rounded-lg shadow flex flex-col items-center">
                    {/* ICONO PERFIL */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-14 h-14 text-gray-700 mb-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>

                    {/* NOMBRE */}
                    <p className="font-semibold mb-3">Valentina Galviz</p>

                    {/* ICONO + EMAIL */}
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
                        <p className="text-gray-700 break-words">coordinacion@cesl.edu.co</p>
                    </div>
                </div>

                {/* SECRETARIA */}
                <div className="bg-gray-100 p-5 rounded-lg shadow flex flex-col items-center">
                    {/* ICONO PERFIL */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-14 h-14 text-gray-700 mb-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>

                    {/* NOMBRE */}
                    <p className="font-semibold mb-3">Gladis Orozco</p>

                    {/* ICONO + EMAIL */}
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
                        <p className="text-gray-700 break-words">secretaria@cesl.edu.co</p>
                    </div>
                </div>
            </div>

            {/* TELÉFONO */}
            <div className="flex flex-col items-center mt-10">
                <p className="font-medium text-gray-800 mb-2">Telefono - celular</p>

                <div className="flex items-center gap-3 text-gray-700">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-10 h-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                            d="M2 5l5-2 5 9-4 2c1 3 3 5 6 6l2-4 9 5-2 5c-7 1-15-6-16-13z" />
                    </svg>

                    <p className="text-lg">1123456891000</p>
                </div>
            </div>
        </section>
    );
}
