export default function QuienesSomos() {
  return (
    <section className="w-full md:w-2/3 flex flex-col justify-center bg-white shadow-md rounded-xl m-6 p-6">
      <h2 className="text-2xl font-semibold text-center mb-8">
        Nosotros
      </h2>
      <br />
      <br />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* MISIÓN */}
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4">Misión</h3>

          <div className="bg-gray-100 p-5 rounded-lg text-center shadow">
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Nulla laboriosam qui natus asperiores expedita beatae
              perspiciatis reiciendis.
            </p>
            <p className="mt-2">
              Optio odit illum sit, inventore tenetur facilis repellendus culpa.
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
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Nulla laboriosam qui natus asperiores expedita beatae
              perspiciatis reiciendis.
            </p>
            <p className="mt-2">
              Optio odit illum sit, inventore tenetur facilis repellendus culpa.
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
