import { useState, useEffect } from "react";

export default function EditarDatosModal({ isOpen, onClose, data, onSave }) {
  const [form, setForm] = useState({
    nombre: "",
    tipoDoc: "",
    documento: "",
    telefono: "",
    correo: "",
    direccion: "",
    grado: "" // solo estudiantes
  });

  useEffect(() => {
    if (data) {
      setForm({
        nombre: data.nombre || "",
        tipoDoc: data.tipoDoc || "CC",
        documento: data.documento || "",
        telefono: data.telefono || "",
        correo: data.correo || "",
        direccion: data.direccion || "",
        grado: data.grado || ""  // si no existe, no afecta acudiente
      });
    }
  }, [data]);

  if (!isOpen) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => onSave(form);

  const esEstudiante = data && data.grado !== undefined;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded shadow-lg relative">

        <button
          className="absolute top-2 right-3 text-xl font-bold"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-2xl font-semibold mb-4">
          Editar Datos {esEstudiante ? "del Estudiante" : "del Acudiente"}
        </h2>

        <div className="grid gap-3">

          <label>
            Nombre Completo:
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>

          <label>
            Tipo de Documento:
            <select
              name="tipoDoc"
              value={form.tipoDoc}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
            >
              <option value="TI">TI</option>
              <option value="CC">CC</option>
            </select>
          </label>

          <label>
            Número de Documento:
            <input
              type="text"
              name="documento"
              value={form.documento}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>

          <label>
            Teléfono:
            <input
              type="text"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>

          <label>
            Correo Electrónico:
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>

          <label>
            Dirección de residencia:
            <input
              type="text"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>

          {esEstudiante && (
            <label>
              Grado:
              <input
                type="text"
                name="grado"
                value={form.grado}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </label>
          )}

        </div>

        <button
          onClick={handleSubmit}
          className="mt-6 bg-blue-700 text-white w-full py-2 rounded"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
