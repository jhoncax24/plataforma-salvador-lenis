import React, { useState, useEffect, useRef } from 'react';

export const ChatWidget = ({ usuarioActual, API_URL = 'http://localhost:4000/api/chat' }) => {
    const [abierto, setAbierto] = useState(false);
    const [contactos, setContactos] = useState([]);
    const [contactoSeleccionado, setContactoSeleccionado] = useState(null);
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    // NUEVOS ESTADOS PARA EL BUSCADOR
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
    const [buscando, setBuscando] = useState(false);

    const [posicion, setPosicion] = useState({ x: 0, y: 0 });
    const [arrastrando, setArrastrando] = useState(false);
    const posicionInicial = useRef({ x: 0, y: 0 });
    const offset = useRef({ x: 0, y: 0 });
    const movido = useRef(false);

    const iniciarArrastre = (e) => {
        if (window.innerWidth < 768) return;
        setArrastrando(true);
        movido.current = false;
        offset.current = { x: e.clientX - posicion.x, y: e.clientY - posicion.y };
        posicionInicial.current = { x: e.clientX, y: e.clientY };
    };

    useEffect(() => {
        const duranteArrastre = (e) => {
            if (!arrastrando) return;
            if (Math.abs(e.clientX - posicionInicial.current.x) > 5 || Math.abs(e.clientY - posicionInicial.current.y) > 5) {
                movido.current = true;
            }
            setPosicion({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
        };
        const finalizarArrastre = () => setArrastrando(false);

        if (arrastrando) {
            window.addEventListener('mousemove', duranteArrastre);
            window.addEventListener('mouseup', finalizarArrastre);
        }
        return () => {
            window.removeEventListener('mousemove', duranteArrastre);
            window.removeEventListener('mouseup', finalizarArrastre);
        };
    }, [arrastrando]);

    const manejarClicBurbuja = () => {
        if (!movido.current) setAbierto(!abierto);
    };

    const idUsuario = usuarioActual?.id_usuario || usuarioActual?.id;

    useEffect(() => {
        if (abierto && idUsuario) {
            cargarContactos(idUsuario);
            // Limpiamos la búsqueda al abrir
            setTerminoBusqueda('');
            setResultadosBusqueda([]);
        }
    }, [abierto, usuarioActual]);

    useEffect(() => {
        if (contactoSeleccionado && idUsuario) {
            cargarConversacion(idUsuario, contactoSeleccionado.contacto_id);
        }
    }, [contactoSeleccionado]);

    // EFECTO PARA EL BUSCADOR DE CONTACTOS
    useEffect(() => {
        const buscarNuevosContactos = async () => {
            if (terminoBusqueda.trim().length < 2) {
                setResultadosBusqueda([]);
                return;
            }
            setBuscando(true);
            try {
                const res = await fetch(`${API_URL}/buscar/${idUsuario}?q=${terminoBusqueda}`);
                const data = await res.json();
                if (data.ok) setResultadosBusqueda(data.resultados);
            } catch (error) {
                console.error('Error en búsqueda:', error);
            } finally {
                setBuscando(false);
            }
        };

        // Un pequeño retraso (debounce) para no saturar el servidor mientras escribe
        const timer = setTimeout(() => buscarNuevosContactos(), 400);
        return () => clearTimeout(timer);
    }, [terminoBusqueda, idUsuario, API_URL]);

    const cargarContactos = async (idUser) => {
        try {
            const res = await fetch(`${API_URL}/contactos/${idUser}`);
            const data = await res.json();
            if (data.ok) setContactos(data.contactos);
        } catch (error) {
            console.error('Error al cargar contactos:', error);
        }
    };

    const cargarConversacion = async (idUser, idContacto) => {
        setCargando(true);
        try {
            const res = await fetch(`${API_URL}/conversacion/${idUser}/${idContacto}`);
            const data = await res.json();
            if (data.ok) {
                setMensajes(data.mensajes);
                cargarContactos(idUser);
            }
        } catch (error) {
            console.error('Error al cargar conversación:', error);
        } finally {
            setCargando(false);
        }
    };

    const manejarEnvio = async (e) => {
        e.preventDefault();
        if (!nuevoMensaje.trim() || !contactoSeleccionado || !idUsuario) return;
        const mensajeTexto = nuevoMensaje.trim();
        setNuevoMensaje('');

        try {
            const res = await fetch(`${API_URL}/mensaje`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_emisor: idUsuario,
                    id_receptor: contactoSeleccionado.contacto_id,
                    mensaje: mensajeTexto
                })
            });
            const data = await res.json();
            if (data.ok) {
                setMensajes(prev => [...prev, data.data]);
                cargarContactos(idUsuario);
            }
        } catch (error) { console.error('Error al enviar:', error); }
    };

    // Función auxiliar para seleccionar un usuario desde la búsqueda
    const seleccionarDesdeBusqueda = (contacto) => {
        setContactoSeleccionado(contacto);
        setTerminoBusqueda(''); // Limpia el buscador
    };

    return (
        <div className="fixed z-50 bottom-5 right-5 flex flex-col items-end pointer-events-auto" style={{ transform: `translate(${posicion.x}px, ${posicion.y}px)` }}>
            {abierto && (
                <div className="w-[calc(100vw-2rem)] sm:w-96 h-[75vh] sm:h-[460px] max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden mb-3 transition-all">
                    
                    {/* ENCABEZADO */}
                    <div className="bg-[#0033a0] text-white p-4 flex items-center justify-between select-none">
                        {contactoSeleccionado ? (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setContactoSeleccionado(null)} className="text-white hover:bg-blue-700 px-2 py-1 rounded-lg text-sm font-bold">
                                    ← Volver
                                </button>
                                <div>
                                    <p className="font-semibold text-sm leading-tight">{contactoSeleccionado.nombre_contacto}</p>
                                    <span className="text-xs text-blue-200 capitalize">{contactoSeleccionado.rol_contacto}</span>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 className="font-bold text-white text-lg">Mensajería Académica</h3>
                                <p className="text-xs text-blue-200">Bandeja de entrada</p>
                            </div>
                        )}
                        <button aria-label="Cerrar chat de mensajería" onClick={() => setAbierto(false)} className="text-white hover:text-gray-300 font-bold text-lg px-2">✕</button>
                    </div>

                    {/* CUERPO DEL CHAT */}
                    <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
                        {!contactoSeleccionado ? (
                            <div className="p-4 flex-1">
                                {/* BARRA DE BÚSQUEDA */}
                                <div className="mb-4">
                                    <input 
                                        type="text"
                                        placeholder={usuarioActual?.role === 'acudiente' ? "Buscar un docente..." : "Buscar un estudiante..."}
                                        value={terminoBusqueda}
                                        onChange={(e) => setTerminoBusqueda(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0033a0]"
                                    />
                                </div>

                                {/* RESULTADOS DE BÚSQUEDA O CONTACTOS RECIENTES */}
                                {terminoBusqueda.trim().length >= 2 ? (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Resultados de búsqueda</p>
                                        {buscando ? (
                                            <p className="text-sm text-gray-400 text-center">Buscando...</p>
                                        ) : resultadosBusqueda.length === 0 ? (
                                            <p className="text-sm text-gray-400 text-center">No se encontraron resultados.</p>
                                        ) : (
                                            resultadosBusqueda.map(contacto => (
                                                <div 
                                                    key={contacto.contacto_id} 
                                                    onClick={() => seleccionarDesdeBusqueda(contacto)} 
                                                    className="p-3 bg-white rounded-xl mb-2 border border-gray-200 hover:border-[#0033a0] cursor-pointer shadow-sm"
                                                >
                                                    {/* NOMBRE DEL CONTACTO (Acudiente o Docente) */}
                                                    <p className="font-medium text-sm text-gray-800 truncate">
                                                        {contacto.nombre_contacto}
                                                    </p>
                                                    
                                                    {/* LÓGICA CONDICIONAL: Si trae nombre de estudiante, lo muestra */}
                                                    {contacto.nombre_estudiante ? (
                                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                                            Acudiente de: <span className="font-semibold text-gray-700">{contacto.nombre_estudiante}</span>
                                                        </p>
                                                    ) : (
                                                        <p className="text-xs text-gray-500 capitalize mt-0.5">
                                                            {contacto.rol_contacto}
                                                        </p>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Conversaciones recientes</p>
                                        {contactos.length === 0 ? (
                                            <p className="text-sm text-gray-400 text-center py-8">No tienes conversaciones activas.</p>
                                        ) : (
                                            contactos.map(contacto => (
                                                <div 
                                                    key={contacto.contacto_id} 
                                                    onClick={() => setContactoSeleccionado(contacto)} 
                                                    className="p-3 bg-white rounded-xl mb-2 border border-gray-100 hover:border-blue-300 cursor-pointer shadow-sm flex justify-between items-center"
                                                >
                                                    <div className="overflow-hidden mr-2">
                                                        <p className="font-medium text-sm text-gray-800 truncate">{contacto.nombre_contacto}</p>
                                                        <p className="text-xs text-gray-500 truncate">{contacto.ultimo_mensaje}</p>
                                                    </div>
                                                    {contacto.no_leidos > 0 && (
                                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                            {contacto.no_leidos}
                                                        </span>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3 p-4">
                                {cargando ? (
                                    <p className="text-center text-xs text-gray-400 py-4">Cargando mensajes...</p>
                                ) : mensajes.length === 0 ? (
                                    <p className="text-center text-xs text-gray-400 py-4">Envía un mensaje para iniciar la conversación.</p>
                                ) : (
                                    mensajes.map((m, index) => {
                                        const esMio = m.id_emisor === idUsuario;
                                        return (
                                            <div key={m.id_mensaje || index} className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}>
                                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                                    esMio 
                                                        ? 'bg-[#0033a0] text-white rounded-br-none' 
                                                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                                }`}>
                                                    <p>{m.mensaje}</p>
                                                </div>
                                                <span className="text-[10px] text-gray-400 mt-1 px-1">
                                                    {new Date(m.fecha_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {/* CAJA DE MENSAJE */}
                    {contactoSeleccionado && (
                        <form onSubmit={manejarEnvio} className="p-3 bg-white border-t border-gray-200 flex gap-2">
                            <input 
                                type="text" 
                                value={nuevoMensaje} 
                                onChange={(e) => setNuevoMensaje(e.target.value)} 
                                placeholder="Escribe tu mensaje..." 
                                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#0033a0]"
                            />
                            <button 
                                type="submit" 
                                className="bg-[#0033a0] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800 transition"
                            >
                                Enviar
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* BOTÓN BURBUJA FLOTANTE */}
            <button
                aria-label={abierto ? "Cerrar chat de mensajería" : "Abrir chat de mensajería"}
                onMouseDown={iniciarArrastre}
                onClick={manejarClicBurbuja}
                className={`bg-[#0033a0] hover:bg-blue-800 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform transform ${
                    arrastrando ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-105'
                } active:scale-95 select-none`}
                title="Mantén presionado para arrastrar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>
        </div>
    );
};