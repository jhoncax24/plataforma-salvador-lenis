import { useState } from "react";

export default function CambiarPasswordModal({ isOpen, onClose, onChange }) {
  const [form, setForm] = useState({
    actual: "",
    nueva: "",
    confirmar: ""
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.nueva !== form.confirmar) {
      alert("La nueva contraseña y la confirmación no coinciden");
      return;
    }

    onChange({
      actual: form.actual,
      nueva: form.nueva
    });

    setForm({ actual: "", nueva: "", confirmar: "" });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-600 hover:text-black text-xl"
        >
          ×
        </button>

        <h2 className="text-lg font-bold mb-4">Cambiar contraseña</h2>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div>
            <label className="block mb-1 font-semibold">Contraseña actual</label>
            <input
              type="password"
              name="actual"
              value={form.actual}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Nueva contraseña</label>
            <input
              type="password"
              name="nueva"
              value={form.nueva}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Confirmar nueva contraseña</label>
            <input
              type="password"
              name="confirmar"
              value={form.confirmar}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-2 bg-blue-700 text-white py-2 px-4 rounded w-full hover:bg-blue-800"
          >
            Cambiar contraseña
          </button>
        </form>
      </div>
    </div>
  );
}
