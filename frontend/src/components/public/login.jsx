import { useState } from "react";
import { login } from "../../api/auth";
import { useNavigate } from "react-router-dom";
// IMPORTAMOS LA API DE RECUPERACIÓN
import * as recoveryApi from "../../api/recoveryApi";

export default function LoginForm() {
  const navigate = useNavigate();

  // --- ESTADOS LOGIN ---
  const [form, setForm] = useState({ username: "", password: "" });
  const [errorLogin, setErrorLogin] = useState("");

  // --- ESTADOS MODAL Y LOGICA ---
  // modalState define qué pantalla se ve: 'REQUEST_CODE' | 'VERIFY_CODE' | 'RESET_PASSWORD' | 'SUCCESS'
  const [modalState, setModalState] = useState('REQUEST_CODE'); 
  const [showModal, setShowModal] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [errorModal, setErrorModal] = useState("");

  // Inputs del Modal
  const [documento, setDocumento] = useState("");
  const [codigo, setCodigo] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Datos temporales de sesión
  const [idUsuarioRecuperando, setIdUsuarioRecuperando] = useState(null);

  // --- FUNCIONES LOGIN ---
  async function handleLogin(e) {
    e.preventDefault();
    setErrorLogin("");
    try {
      const user = await login(form.username, form.password);
      alert("Bienvenido " + user.full_name);
      if (user.role === "estudiante") navigate("/estudiante");
      else if (user.role === "docente") navigate("/docente");
      else if (user.role === "acudiente") navigate("/acudiente");
      else navigate("/");
    } catch (err) {
      setErrorLogin("Credenciales inválidas");
    }
  }

  // --- FUNCIONES MODAL (FLUJO FUNCIONAL) ---

  const cerrarModal = () => {
    setShowModal(false);
    setModalState('REQUEST_CODE'); // Reiniciar flujo
    setDocumento(""); setCodigo(""); setNewPassword(""); setConfirmPassword("");
    setErrorModal(""); setIdUsuarioRecuperando(null);
  };

  // PASO 1: Enviar Documento -> Backend envía email
  const handleFase1_SolicitarCodigo = async (e) => {
    e.preventDefault();
    setErrorModal(""); setLoadingModal(true);
    try {
      const res = await recoveryApi.solicitarCodigoRecovery(documento);
      setIdUsuarioRecuperando(res.id_usuario);
      setModalState('VERIFY_CODE'); // Siguiente pantalla
    } catch (err) {
      setErrorModal(err.response?.data?.message || "Error al solicitar código");
    } finally { setLoadingModal(false); }
  };

  // PASO 2: Verificar Código
  const handleFase2_VerificarCodigo = async (e) => {
    e.preventDefault();
    setErrorModal(""); setLoadingModal(true);
    try {
      await recoveryApi.verificarCodigoRecovery(idUsuarioRecuperando, codigo);
      setModalState('RESET_PASSWORD'); // Siguiente pantalla
    } catch (err) {
      setErrorModal(err.response?.data?.message || "Código inválido");
    } finally { setLoadingModal(false); }
  };

  // PASO 3: Cambiar Contraseña Final
  const handleFase3_CambiarPasswordFinal = async (e) => {
    e.preventDefault();
    setErrorModal("");
    
    // Validaciones de frontend (RNF-06 Seguridad)
    if (newPassword.length < 6) { setErrorModal("La contraseña debe tener al menos 6 caracteres"); return; }
    if (newPassword !== confirmPassword) { setErrorModal("Las contraseñas no coinciden"); return; }

    setLoadingModal(true);
    try {
      await recoveryApi.cambiarPasswordRecovery(idUsuarioRecuperando, codigo, newPassword);
      setModalState('SUCCESS'); // Pantalla final
    } catch (err) {
      setErrorModal(err.response?.data?.message || "Error al actualizar contraseña");
    } finally { setLoadingModal(false); }
  };

  return (
    <>
      {/* FORMULARIO DE LOGIN NORMAL */}
      <aside className="w-full md:w-1/3 flex flex-col justify-center bg-white shadow-md rounded-xl m-6 p-6">
        <h3 className="text-xl font-semibold mb-4 text-center">Ingreso a la plataforma</h3>
        <form className="space-y-4" onSubmit={handleLogin}>
          {errorLogin && <p className="text-red-500 text-center text-sm">{errorLogin}</p>}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">Usuario:</label>
            <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Usuario" autoComplete="username" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1 text-gray-700 font-medium">Contraseña:</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Contraseña" autoComplete="current-password" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <button type="submit" className="w-full bg-[#0033a0] hover:bg-blue-800 text-white font-medium py-2 rounded-lg mt-2">Ingresar</button>
        </form>
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600 mb-1">¿Olvidó su contraseña?</p>
          <button type="button" onClick={() => setShowModal(true)} className="text-[#0033a0] font-semibold hover:underline bg-transparent border-none">Haga clic aquí para cambiarla</button>
        </div>
      </aside>

      {/* ========================================= */}
      {/* MODAL DE RECUPERACIÓN (FLUJO INTERNO) */}
      {/* ========================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative">
            
            {/* Botón Cerrar (X) - Solo visible antes del ÉXITO */}
            {modalState !== 'SUCCESS' && (
              <button onClick={cerrarModal} className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl">&times;</button>
            )}

            <div className="p-6">
              {errorModal && <p className="text-red-500 text-center mb-4 text-sm font-medium">{errorModal}</p>}
              {loadingModal && <p className="text-gray-600 text-center mb-4 text-sm">Procesando...</p>}

              {/* RENDERIZADO CONDICIONAL DE CADA FASE */}

              {/* FASE 1: Solicitud de Código */}
              {modalState === 'REQUEST_CODE' && (
                <>
                  <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Olvido de la contraseña</h2>
                  <p className="text-gray-600 text-center mb-6 text-sm">Introduzca su documento para enviarle un código al correo registrado.</p>
                  <form onSubmit={handleFase1_SolicitarCodigo} className="space-y-6">
                    <input type="text" value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="Ej: 1001234567" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-center" required />
                    <div className="flex justify-center">
                      <button type="submit" disabled={loadingModal} className="bg-[#0033a0] hover:bg-blue-800 text-white font-semibold py-2 px-8 rounded-lg">Enviar</button>
                    </div>
                  </form>
                </>
              )}

              {/* FASE 2: Verificación de Código */}
              {modalState === 'VERIFY_CODE' && (
                <>
                  <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Verificación</h2>
                  <p className="text-gray-600 text-center mb-6 text-sm">Introduzca el código de 6 dígitos enviado a su correo.</p>
                  <form onSubmit={handleFase2_VerificarCodigo} className="space-y-6">
                    <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="000000" maxLength={6} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-center text-2xl tracking-widest font-mono" required />
                    <div className="flex justify-center">
                      <button type="submit" disabled={loadingModal} className="bg-[#0033a0] hover:bg-blue-800 text-white font-semibold py-2 px-8 rounded-lg">Verificar</button>
                    </div>
                  </form>
                </>
              )}

              {/* FASE 3: Nueva Contraseña */}
              {modalState === 'RESET_PASSWORD' && (
                <>
                  <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Cambio de Contraseña</h2>
                  <p className="text-gray-600 text-center mb-6 text-sm">Establezca su nueva contraseña de acceso.</p>
                  <form onSubmit={handleFase3_CambiarPasswordFinal} className="space-y-4">
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nueva Contraseña" className="w-full border border-gray-300 rounded-lg px-4 py-2" required />
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar Nueva Contraseña" className="w-full border border-gray-300 rounded-lg px-4 py-2" required />
                    <div className="flex justify-center pt-2">
                      <button type="submit" disabled={loadingModal} className="bg-[#0033a0] hover:bg-blue-800 text-white font-semibold py-2 px-8 rounded-lg">Cambiar</button>
                    </div>
                  </form>
                </>
              )}

              {/* FASE 4: Éxito (Imagen) */}
              {modalState === 'SUCCESS' && (
                <div className="flex flex-col items-center">
                  <img 
                    src="/assets/success_message.png" // <-- Asegúrate de tener tu imagen aquí
                    alt="Contraseña restablecida exitosamente"
                    className="w-full object-contain mb-6" 
                  />
                  <button onClick={cerrarModal} className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 px-8 rounded-lg">Cerrar</button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}