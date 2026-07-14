import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cambiarContrasenaUsuario } from "../../api/perfilApi"; 

export default function CambiarPasswordVista() {
  const location = useLocation();
  const navigate = useNavigate();
  const { datosUsuario } = location.state || {};

  const [form, setForm] = useState({ actual: "", nueva: "", confirmar: "" });
  const [cargando, setCargando] = useState(false);

  if (!datosUsuario) return <div className="min-h-screen flex justify-center items-center font-bold text-[#0033a0] bg-gray-50 flex-col gap-4">Error de carga. <button onClick={() => navigate(-1)} className="bg-gray-200 px-6 py-2 hover:bg-gray-300 rounded-lg">Volver</button></div>;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const esEstudiante = datosUsuario.tipo === 'estudiante';
  const nombreMostrar = esEstudiante ? datosUsuario.nombreHijo : "Mi Cuenta";
  const inicial = esEstudiante && datosUsuario.nombreHijo ? datosUsuario.nombreHijo.charAt(0).toUpperCase() : "A";

  const guardarNuevaPassword = async (e) => {
    e.preventDefault();
    if (form.nueva !== form.confirmar) return alert("Las contraseñas nuevas no coinciden");
    
    setCargando(true);
    try {
      await cambiarContrasenaUsuario({ tipo: datosUsuario.tipo, id: datosUsuario.id, actual: form.actual, nueva: form.nueva });
      alert("¡Contraseña cambiada exitosamente!");
      navigate("/acudiente");
    } catch (error) {
      alert(error.response?.data?.error || "Error al cambiar contraseña.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 sm:p-6 lg:p-8 flex justify-center items-start sm:items-center animate-fade-in-up">
      
      <div className="bg-white sm:rounded-xl shadow-none sm:shadow-2xl w-full max-w-4xl overflow-hidden border-0 sm:border border-gray-200 flex flex-col min-h-screen sm:min-h-0">

        {/* ENCABEZADO ESTILO MODAL */}
        <div className="bg-[#0033a0] p-4 sm:p-5 flex justify-between items-center shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>🔒</span> Seguridad de Acceso
          </h2>
          <button onClick={() => navigate(-1)} className="text-white hover:text-gray-300 transition-colors p-1">
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 flex-1 flex flex-col">
          <form onSubmit={guardarNuevaPassword} className="flex-1 flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 flex-1">

              {/* COLUMNA IZQUIERDA: INFORMACIÓN ACTUAL */}
              <div className="bg-gray-50 p-4 sm:p-5 rounded-xl border border-gray-200 h-fit">
                <h3 className="font-extrabold text-gray-700 border-b border-gray-300 pb-2 mb-4 text-center lg:text-left">Cuenta Seleccionada</h3>

                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-blue-100 flex items-center justify-center mb-2">
                    <span className="text-3xl sm:text-4xl font-black text-[#0033a0]">{inicial}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">{esEstudiante ? "Estudiante" : "Acudiente"}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase text-center lg:text-left">Modificando acceso de:</label>
                    <p className="font-extrabold text-[#0033a0] bg-blue-50 p-3 rounded-lg border border-blue-200 mt-1 uppercase text-center text-sm sm:text-base break-words">
                      {nombreMostrar}
                    </p>
                  </div>
                  
                  <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 mt-4 shadow-sm">
                    <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
                      <strong className="text-gray-800 block mb-1">Recomendaciones:</strong>
                      • Usa al menos 8 caracteres.<br/>
                      • No utilices fechas de nacimiento.<br/>
                      • Comparte esta clave únicamente con tu acudido.
                    </p>
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA: NUEVOS DATOS (CONTRASEÑA) */}
              <div className="p-2 flex flex-col justify-center">
                <h3 className="font-extrabold text-[#0033a0] border-b border-blue-100 pb-2 mb-4">Credenciales</h3>

                <div className="space-y-4 sm:space-y-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Contraseña Actual</label>
                    <input 
                      type="password" name="actual" value={form.actual} onChange={handleChange} required
                      className="w-full border border-gray-300 rounded-lg p-3 sm:p-3.5 focus:outline-none focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0] transition-colors bg-gray-50 focus:bg-white text-sm" 
                      placeholder="••••••••" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Nueva Contraseña</label>
                    <input 
                      type="password" name="nueva" value={form.nueva} onChange={handleChange} required
                      className="w-full border border-gray-300 rounded-lg p-3 sm:p-3.5 focus:outline-none focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0] transition-colors bg-gray-50 focus:bg-white text-sm" 
                      placeholder="••••••••" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                    <input 
                      type="password" name="confirmar" value={form.confirmar} onChange={handleChange} required
                      className="w-full border border-gray-300 rounded-lg p-3 sm:p-3.5 focus:outline-none focus:border-[#0033a0] focus:ring-1 focus:ring-[#0033a0] transition-colors bg-gray-50 focus:bg-white text-sm" 
                      placeholder="••••••••" 
                    />
                    {form.nueva && form.confirmar && form.nueva !== form.confirmar && (
                      <p className="text-red-500 text-xs font-bold mt-2">❌ Las contraseñas no coinciden</p>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-6 sm:mt-8 border-t border-gray-200 w-full pb-4 sm:pb-0">
              <button type="button" onClick={() => navigate(-1)} className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm sm:text-base">
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={cargando || (form.nueva && form.nueva !== form.confirmar)}
                className={`w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-lg font-bold text-white shadow-md transition-all text-sm sm:text-base ${cargando || (form.nueva && form.nueva !== form.confirmar) ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-[#0033a0] hover:bg-blue-800 cursor-pointer'}`}
              >
                {cargando ? "Actualizando..." : "Actualizar Contraseña"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}