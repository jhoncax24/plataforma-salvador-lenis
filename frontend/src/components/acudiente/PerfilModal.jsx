// PerfilModal.jsx
import { useState } from "react";

export default function PerfilModal({
  isOpen,
  onClose,
  profile,
  hijos,
  onEdit,
  onChangePassword
}) {
  if (!isOpen) return null;

  const [selectedType, setSelectedType] = useState("acudiente");
  const [selectedHijoId, setSelectedHijoId] = useState(
    hijos.length > 0 ? hijos[0].id : null
  );

  const currentData =
    selectedType === "acudiente"
      ? profile
      : hijos.find((h) => h.id === selectedHijoId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded shadow-lg relative">

        {/* Botón Cerrar */}
        <button
          className="absolute top-2 right-3 text-xl font-bold"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-2xl font-semibold mb-4">Perfil</h2>

        {/* Select tipo de perfil */}
        <label className="block mb-2 font-semibold">Seleccionar perfil:</label>
        <select
          className="w-full border rounded px-3 py-2 mb-4"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="acudiente">Perfil del Acudiente</option>
          {hijos.length > 0 && <option value="hijo">Perfil de Hijo</option>}
        </select>

        {/* Si escoge hijo, mostrar este select */}
        {selectedType === "hijo" && (
          <select
            className="w-full border rounded px-3 py-2 mb-4"
            value={selectedHijoId}
            onChange={(e) => setSelectedHijoId(Number(e.target.value))}
          >
            {hijos.map((h) => (
              <option key={h.id} value={h.id}>
                {h.nombre}
              </option>
            ))}
          </select>
        )}

        {/* Información mostrada */}
        <div className="bg-gray-100 p-4 rounded mb-4">
          <p><strong>Nombre:</strong> {currentData?.nombre}</p>
          <p><strong>Correo:</strong> {currentData?.correo}</p>
          <p><strong>Teléfono:</strong> {currentData?.telefono}</p>
          <p><strong>Dirección:</strong> {currentData?.direccion}</p>
          <p><strong>Documento:</strong> {currentData?.tipoDoc} {currentData?.documento}</p>
        </div>

        {/* Botones */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => onEdit(currentData)}
            className="bg-blue-700 text-white px-4 py-2 rounded"
          >
            Editar datos
          </button>

          <button
            onClick={() =>
              onChangePassword(
                selectedType === "acudiente"
                  ? { tipo: "acudiente", id: profile.id }
                  : { tipo: "hijo", id: selectedHijoId }
              )
            }
            className="bg-green-700 text-white px-4 py-2 rounded"
          >
            Cambiar contraseña
          </button>
        </div>
      </div>
    </div>
  );
}
