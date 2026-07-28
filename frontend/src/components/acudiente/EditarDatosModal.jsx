import { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { MdWarning, MdCheckCircle, MdLightbulb, MdChevronRight, MdEdit, MdLogout } from "react-icons/md";

export default function EditarDatosModal({ isOpen, onClose, data, onSave }) {
  const [form, setForm] = useState({
    nombre: "", tipoDoc: "", documento: "", telefono: "", correo: "", direccion: "", grado: "", foto_perfil: ""
  });
  
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        nombre: data.nombre || "",
        tipoDoc: data.tipoDoc || "CC",
        documento: data.documento || "",
        telefono: data.telefono || "",
        correo: data.correo || "",
        direccion: data.direccion || "",
        grado: data.grado || "",
        foto_perfil: data.foto_perfil || ""
      });
    }
  }, [data]);

  if (!isOpen) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubirImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, foto_perfil: reader.result });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const noHuboCambios = 
    form.nombre === (data.nombre || "") &&
    form.tipoDoc === (data.tipoDoc || "CC") &&
    form.documento === (data.documento || "") &&
    form.telefono === (data.telefono || "") &&
    form.correo === (data.correo || "") &&
    form.direccion === (data.direccion || "") &&
    form.grado === (data.grado || "") &&
    form.foto_perfil === (data.foto_perfil || "");

  const botonDeshabilitado = isUploading || noHuboCambios;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  // 🚨 Identificamos si es el Estudiante para mostrar u ocultar la foto
  const esEstudiante = data && data.grado !== undefined;
  const inicial = data?.nombre ? data.nombre.charAt(0).toUpperCase() : "U";

return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] sm:p-4 animate-fade-in-up backdrop-blur-sm">
      <div className="bg-white sm:rounded-xl shadow-2xl w-full h-full sm:h-auto sm:max-w-5xl overflow-hidden border-0 sm:border border-gray-200 flex flex-col max-h-screen sm:max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
        
        {/* ENCABEZADO */}
        <div className="bg-[#0033a0] p-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span></span> {esEstudiante ? "Configuración del Estudiante" : "Configuración de Perfil"}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-300 transition-colors">
            <MdClose />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* COLUMNA IZQUIERDA: DATOS ACTUALES */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 h-fit">
                <h3 className="font-extrabold text-gray-700 border-b border-gray-300 pb-2 mb-4">Información Actual</h3>

                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm bg-gray-200 mb-2 flex items-center justify-center">
                    {data.foto_perfil ? (
                      <img src={data.foto_perfil} alt="Actual" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-black text-[#0033a0]">{inicial}</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {esEstudiante ? "Avatar Estudiante" : "Perfil Actual"}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Nombre Completo</label>
                    <p className="font-semibold text-gray-800 bg-white p-2 rounded border border-gray-200 mt-1">{data.nombre}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">Documento</label>
                      <p className="font-semibold text-gray-800 bg-white p-2 rounded border border-gray-200 mt-1">{data.tipoDoc || "CC"} {data.documento || "—"}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">Teléfono</label>
                      <p className="font-semibold text-gray-800 bg-white p-2 rounded border border-gray-200 mt-1">{data.telefono || "—"}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Correo Electrónico</label>
                    <p className="font-semibold text-gray-800 bg-white p-2 rounded border border-gray-200 mt-1 truncate">{data.correo || "No registrado"}</p>
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA: NUEVOS DATOS */}
              <div className="p-2">
                <h3 className="font-extrabold text-[#0033a0] border-b border-blue-100 pb-2 mb-4">Nuevos Datos</h3>

                <div className="space-y-5">

                  {/* 🚨 MAGIA AQUÍ: Solo muestra la carga de foto si es Estudiante */}
                  {esEstudiante && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <label className="block text-sm font-bold text-[#0033a0] mb-2">Cambiar Foto de Perfil</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSubirImagen}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0033a0] file:text-white hover:file:bg-blue-800 transition-all cursor-pointer"
                      />
                      {isUploading && <p className="text-sm text-blue-600 font-bold mt-2 animate-pulse">Subiendo imagen, por favor espera...</p>}
                      {form.foto_perfil && form.foto_perfil !== data.foto_perfil && !isUploading && (
                        <p className="text-sm text-green-600 font-bold mt-2">¡Imagen lista para guardar!</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
                    <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0] transition-colors bg-gray-50 focus:bg-white" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Tipo Doc.</label>
                      <select name="tipoDoc" value={form.tipoDoc} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0] bg-gray-50 focus:bg-white">
                        <option value="TI">TI</option>
                        <option value="CC">CC</option>
                        <option value="RC">RC</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Número Documento</label>
                      <input type="text" name="documento" value={form.documento} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0] transition-colors bg-gray-50 focus:bg-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Nuevo Celular</label>
                      <input type="tel" name="telefono" value={form.telefono} onChange={handleChange} placeholder="Ej: 3101234567" className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0] transition-colors bg-gray-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Nuevo Correo</label>
                      <input type="email" name="correo" value={form.correo} onChange={handleChange} placeholder="ejemplo@correo.com" className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0] transition-colors bg-gray-50 focus:bg-white" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Dirección de Residencia</label>
                    <input type="text" name="direccion" value={form.direccion} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0] transition-colors bg-gray-50 focus:bg-white" />
                  </div>

                  {esEstudiante && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Grado Académico</label>
                      <input type="text" name="grado" value={form.grado} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0] transition-colors bg-gray-50 focus:bg-white" />
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* Botones de acción del modal */}
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={botonDeshabilitado}
                className={`px-5 py-2.5 rounded-lg font-bold text-white shadow-md transition-all 
                  ${botonDeshabilitado
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    : 'bg-[#0033a0] hover:bg-blue-800 cursor-pointer'
                  }`}
              >
                {isUploading ? "Subiendo Foto..." : noHuboCambios ? "Sin Cambios" : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}