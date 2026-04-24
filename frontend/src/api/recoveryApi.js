import api from "./api"; // Tu instancia configurada de Axios

export const solicitarCodigoRecovery = async (documento) => {
    const { data } = await api.post('/auth/recovery/solicitar', { documento });
    return data;
};

export const verificarCodigoRecovery = async (idUsuario, code) => {
    const { data } = await api.post('/auth/recovery/verificar', { id_usuario: idUsuario, code });
    return data;
};

export const cambiarPasswordRecovery = async (idUsuario, code, newPassword) => {
    const { data } = await api.post('/auth/recovery/cambiar', { id_usuario: idUsuario, code, newPassword });
    return data;
};