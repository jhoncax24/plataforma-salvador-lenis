import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ObservadorCard from "../../components/docente/ObservadorCard";
import Opciones from "../../components/docente/Opciones";
import TasksCard from "../../components/docente/TasksCard";
import { modificarPerfilDocente } from "../../api/perfilApi";

// import { actualizarPerfilDocente } from "../../api/perfilApi";

export default function DocenteInicio() {
  const navigate = useNavigate();
  const [docenteData, setDocenteData] = useState({
    id_usuario: null,
    nombre: "Cargando...",
    foto_perfil: null,
    correo: "",
    telefono: ""
  });

  // ESTADOS DEL MODAL
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // 👈 Nuevo: Estado de carga para la foto
  const [editForm, setEditForm] = useState({
    correo: "",
    telefono: "",
    foto_perfil: ""
  });

  useEffect(() => {
    cargarDatosLocales();
  }, []);

  const cargarDatosLocales = () => {
    const usuarioLogueado = localStorage.getItem("cesl_user") || localStorage.getItem("usuario");

    if (usuarioLogueado) {
      const datosUsuario = JSON.parse(usuarioLogueado);
      const nombreCompleto = datosUsuario.full_name || datosUsuario.nombre_completo || datosUsuario.username || "Docente";
      const partesNombre = nombreCompleto.split(" ");
      const nombreCorto = partesNombre.length > 1 ? `${partesNombre[0]} ${partesNombre[1]}` : nombreCompleto;

      setDocenteData({
        id_usuario: datosUsuario.id || datosUsuario.id_usuario,
        nombre: nombreCorto,
        foto_perfil: datosUsuario.foto_perfil || null,
        correo: datosUsuario.correo || datosUsuario.email || "",
        telefono: datosUsuario.telefono || ""
      });
    }
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return { texto: "Buen Día", imagen: "https://res.cloudinary.com/dmzq2qw0t/image/upload/q_auto/f_auto/v1776980377/BuenD%C3%ADa_cmpcyy.png" };
    if (hora >= 12 && hora < 19) return { texto: "Buena Tarde", imagen: "https://res.cloudinary.com/dmzq2qw0t/image/upload/q_auto/f_auto/v1776980379/BuenaTarde_oe3jrc.png" };
    return { texto: "Buena Noche", imagen: "https://res.cloudinary.com/dmzq2qw0t/image/upload/q_auto/f_auto/v1776980382/BuenaNoche_cm8hyo.png" };
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const abrirModalEditar = () => {
    setEditForm({
      correo: docenteData.correo,
      telefono: docenteData.telefono,
      foto_perfil: docenteData.foto_perfil || ""
    });
    setIsEditModalOpen(true);
  };

  // 👉 NUEVA LÓGICA: Subir imagen a Cloudinary directamente
  const handleSubirImagen = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 👇 AGREGA ESTAS DOS LÍNEAS DE PRUEBA 👇
    console.log("Cloud Name leído:", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
    console.log("Preset Docente leído:", import.meta.env.VITE_CLOUDINARY_PRESET_DOCENTES);

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    // Leemos el nombre de la nube y el preset EXCLUSIVO de docentes
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPresetDocentes = import.meta.env.VITE_CLOUDINARY_PRESET_DOCENTES;

    formData.append("upload_preset", uploadPresetDocentes);
    formData.append("cloud_name", cloudName);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      // La URL devuelta la guardamos en el estado del formulario
      setEditForm({ ...editForm, foto_perfil: data.secure_url });
    } catch (error) {
      console.error("Error al subir imagen:", error);
      alert("Hubo un problema subiendo la foto.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGuardarPerfil = async (e) => {
    e.preventDefault();

    // 1. VALIDACIÓN: Evitar campos totalmente vacíos o con puros espacios en blanco
    if (!editForm.correo || editForm.correo.trim() === "") {
      alert("⚠️ El correo electrónico es obligatorio y no puede quedar vacío.");
      return;
    }

    if (!editForm.telefono || editForm.telefono.trim() === "") {
      alert("⚠️ El número de celular es obligatorio y no puede quedar vacío.");
      return;
    }

    if (!editForm.foto_perfil || editForm.foto_perfil.trim() === "") {
      alert("⚠️ Es obligatorio seleccionar y cargar una foto de perfil.");
      return;
    }

    // 2. VALIDACIÓN: Verificar si realmente el docente modificó algo
    const noHuboCambios =
      editForm.correo === docenteData.correo &&
      editForm.telefono === docenteData.telefono &&
      editForm.foto_perfil === docenteData.foto_perfil;

    if (noHuboCambios) {
      alert(" No has realizado ninguna modificación en tus datos actuales.");
      return;
    }

    try {
      const respuesta = await modificarPerfilDocente(docenteData.id_usuario, editForm);
      localStorage.setItem("cesl_user", JSON.stringify(respuesta.user));
      cargarDatosLocales();
      setIsEditModalOpen(false);
      alert(" ¡Perfil actualizado con éxito en la base de datos!");
    } catch (error) {
      alert(" Hubo un error al guardar los cambios en el servidor.");
    }
  };

  const saludoActual = obtenerSaludo();
  // Lógicas de validación en tiempo real para el botón
  const camposVacios = !editForm.correo?.trim() || !editForm.telefono?.trim() || !editForm.foto_perfil;
  const noHuboCambios = editForm.correo === docenteData.correo && editForm.telefono === docenteData.telefono && editForm.foto_perfil === docenteData.foto_perfil;

  // El botón se bloqueará si hay campos vacíos, si no hay cambios, o si la foto aún se está subiendo a Cloudinary
  const botonDeshabilitado = camposVacios || noHuboCambios || isUploading;

  return (
    <div className="w-[95%] max-w-[1800px] mx-auto pt-6 pb-12 animate-fade-in-up font-sans">

      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 relative px-4">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6 md:mb-0">
          <div className="w-28 h-28 flex-shrink-0 rounded-full overflow-hidden bg-white shadow-sm">
            <img src={saludoActual.imagen} alt="Clima" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl text-gray-800">{saludoActual.texto}</h2>
            <h2 className="text-4xl text-[#0033a0] font-bold">{docenteData.nombre}</h2>
          </div>
        </div>

        <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:bottom-0 mb-6 md:mb-0 z-10 flex flex-col items-center">
          <div className="relative rounded-full overflow-hidden w-28 h-28 border-4 border-white shadow-lg bg-white mb-2">
            {docenteData.foto_perfil ? (
              <img src={docenteData.foto_perfil} alt="Perfil Docente" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
              </div>
            )}
          </div>
          <button onClick={abrirModalEditar} className="text-xs font-bold text-[#0033a0] bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-full hover:bg-[#0033a0] hover:text-white transition-all shadow-sm cursor-pointer">
            Editar perfil
          </button>
        </div>

        <div onClick={handleLogout} className="flex flex-col items-center cursor-pointer hover:text-red-600 transition-colors group">
          <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow border border-gray-100 group-hover:border-red-100 transition-all">
            <svg className="w-7 h-7 text-gray-600 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </div>
          <span className="text-sm font-bold text-gray-500 mt-2 group-hover:text-red-600 transition-colors">Salir</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch px-4">
        <Opciones />
        <TasksCard />

      </div>

      {/* ========================================== */}
      {/* MODAL DE EDICIÓN DE PERFIL (2 COLUMNAS)    */}
      {/* ========================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>

            <div className="bg-[#0033a0] p-4 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><span>⚙️</span> Configuración de Perfil</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white hover:text-gray-300 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleGuardarPerfil}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  {/* COLUMNA IZQUIERDA: DATOS ACTUALES */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <h3 className="font-extrabold text-gray-700 border-b border-gray-300 pb-2 mb-4">Información Actual</h3>

                    <div className="flex flex-col items-center mb-6">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm bg-gray-200 mb-2">
                        {docenteData.foto_perfil ? (
                          <img src={docenteData.foto_perfil} alt="Actual" className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-full h-full text-gray-400 p-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Foto de perfil actual</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Celular / Teléfono</label>
                        <p className="font-semibold text-gray-800 bg-white p-2 rounded border border-gray-200 mt-1">{docenteData.telefono || "No registrado"}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Correo Electrónico</label>
                        <p className="font-semibold text-gray-800 bg-white p-2 rounded border border-gray-200 mt-1 truncate">{docenteData.correo || "No registrado"}</p>
                      </div>
                    </div>
                  </div>

                  {/* COLUMNA DERECHA: NUEVOS DATOS */}
                  <div className="p-2">
                    <h3 className="font-extrabold text-[#0033a0] border-b border-blue-100 pb-2 mb-4">Nuevos Datos</h3>

                    <div className="space-y-5">

                      {/* Carga de Foto de Perfil con Input File */}
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label className="block text-sm font-bold text-[#0033a0] mb-2">Cambiar Foto de Perfil</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSubirImagen}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0033a0] file:text-white hover:file:bg-blue-800 transition-all cursor-pointer"
                        />
                        {isUploading && <p className="text-sm text-blue-600 font-bold mt-2 animate-pulse">Subiendo imagen, por favor espera...</p>}
                        {editForm.foto_perfil && !isUploading && <p className="text-sm text-green-600 font-bold mt-2">¡Imagen lista para guardar!</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nuevo Celular</label>
                        <input
                          type="tel"
                          placeholder="Ej: 3101234567"
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0] transition-colors bg-gray-50 focus:bg-white"
                          value={editForm.telefono}
                          onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nuevo Correo</label>
                        <input
                          type="email"
                          placeholder="ejemplo@correo.com"
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0] transition-colors bg-gray-50 focus:bg-white"
                          value={editForm.correo}
                          onChange={(e) => setEditForm({ ...editForm, correo: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Botones de acción del modal */}
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
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
      )}

    </div>
  );
}