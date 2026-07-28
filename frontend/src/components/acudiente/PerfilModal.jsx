import React from "react";
import { MdClose } from "react-icons/md";
import { MdWarning, MdCheckCircle, MdLightbulb, MdChevronRight, MdEdit, MdLogout } from "react-icons/md";

export default function PerfilModal({ isOpen, onClose, profile, hijos = [], onEdit, onChangePassword }) {
  if (!isOpen || !profile) return null;

  const inicial = profile.nombre ? profile.nombre.charAt(0).toUpperCase() : "A";

 return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] sm:p-4 animate-fade-in-up backdrop-blur-sm">
      <div className="bg-white sm:rounded-xl shadow-2xl w-full h-full sm:h-auto sm:max-w-6xl overflow-hidden border-0 sm:border border-gray-200 flex flex-col max-h-screen sm:max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
        {/* ENCABEZADO */}
        <div className="bg-[#0033a0] p-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span></span> Mi Perfil Institucional
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-300 transition-colors">
            <MdClose />
          </button>
        </div>

        {/* CONTENIDO EN DOBLE COLUMNA */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* COLUMNA IZQUIERDA: INFORMACIÓN ACTUAL DEL ACUDIENTE */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 h-fit">
              <h3 className="font-extrabold text-gray-700 border-b border-gray-300 pb-2 mb-4">Información del Acudiente</h3>

              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-blue-100 flex items-center justify-center mb-2">
                  <span className="text-4xl font-black text-[#0033a0]">{inicial}</span>
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Acudiente Titular</span>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase">Nombre Completo</label>
                  <p className="font-semibold text-gray-800 bg-white p-2 rounded border border-gray-200 mt-1">{profile.nombre}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase">Documento</label>
                    <p className="font-semibold text-gray-800 bg-white p-2 rounded border border-gray-200 mt-1">{profile.tipoDoc || "CC"} {profile.documento}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase">Celular / Teléfono</label>
                    <p className="font-semibold text-gray-800 bg-white p-2 rounded border border-gray-200 mt-1">{profile.telefono || "—"}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase">Correo Electrónico</label>
                  <p className="font-semibold text-gray-800 bg-white p-2 rounded border border-gray-200 mt-1 truncate">{profile.correo || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase">Dirección de Residencia</label>
                  <p className="font-semibold text-gray-800 bg-white p-2 rounded border border-gray-200 mt-1 truncate">{profile.direccion || "—"}</p>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: ESTUDIANTES A CARGO */}
            <div className="p-2">
              <h3 className="font-extrabold text-[#0033a0] border-b border-blue-100 pb-2 mb-4">Estudiantes Vinculados</h3>

              {hijos.length === 0 ? (
                <div className="text-center py-8 text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  No tienes estudiantes asignados actualmente.
                </div>
              ) : (
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                  {hijos.map((hijo) => (
                    <div key={hijo.id} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between hover:border-blue-200 transition-colors gap-3 relative overflow-hidden group">
                      {/* Cintillo decorativo lateral */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0033a0]"></div>
                      
                      <div className="pl-2">
                        <h4 className="font-extrabold text-gray-800 text-base">{hijo.nombre}</h4>
                        <span className="inline-block mt-1 bg-blue-50 text-[#0033a0] text-xs px-2.5 py-0.5 rounded-full font-bold">
                          Grado: {hijo.grado}
                        </span>
                        
                        <div className="grid grid-cols-2 gap-x-4 text-xs text-gray-400 mt-3 font-medium">
                          <p><span className="text-gray-300">Doc:</span> {hijo.tipoDoc || "TI"} {hijo.documento || "—"}</p>
                          <p><span className="text-gray-300">Tel:</span> {hijo.telefono || "—"}</p>
                        </div>
                      </div>

                      
                      <div className="pl-2 pt-3 border-t border-gray-100 mt-1 flex gap-2">
                        <button 
                          onClick={() => onChangePassword({ tipo: 'estudiante', id: hijo.id, nombreHijo: hijo.nombre })}
                          className="flex-1 text-xs bg-white text-[#0033a0] border border-blue-200 py-2 rounded-lg font-bold hover:bg-blue-50 transition-all shadow-sm truncate px-1"
                        >
                           Contraseña
                        </button>
                        <button 
                          onClick={() => onEdit({ ...hijo, grado: hijo.grado })}
                          className="flex-1 text-xs bg-gray-100 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all truncate px-1"
                        >
                           Editar Datos
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* PIE DE PÁGINA: ACCIONES PRINCIPALES DEL ACUDIENTE */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 flex flex-col sm:flex-row justify-between gap-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button 
              onClick={() => onChangePassword({ tipo: 'acudiente', id: profile.id })}
              className="w-full sm:w-auto text-sm bg-white border-2 border-blue-200 text-[#0033a0] px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-sm"
            >
               Cambiar mi Contraseña
            </button>
            <button 
              onClick={() => onEdit(profile)}
              className="w-full sm:w-auto text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors"
            >
               Editar Mis Datos
            </button>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full sm:w-auto bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition-colors text-sm"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
}