import { useState } from "react";

export default function Certificados() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="border-2 border-gray-700 p-6 bg-gray-100 h-full">
      <h3 className="text-xl font-semibold mb-4">Certificados</h3>
      <p className="mb-4">Disponibles</p>

      <div className="space-y-3 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="cert"
            onChange={() => setSelected("estudio")}
          />
          Certificado de estudio
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="cert"
            onChange={() => setSelected("notas")}
          />
          Certificado de notas
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="cert"
            onChange={() => setSelected("conducta")}
          />
          Certificado de conducta
        </label>
      </div>

      <button
        disabled={!selected}
        className={`mt-6 px-4 py-2 rounded text-white w-full ${
          selected ? "bg-blue-800 hover:bg-blue-900" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Solicitar
      </button>
    </div>
  );
}
