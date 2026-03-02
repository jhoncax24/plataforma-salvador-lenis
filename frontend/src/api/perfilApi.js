import api from "./api"; // Usa tu instancia configurada

export const obtenerPerfilAcudiente = async (idAcudiente) => {
  const { data } = await api.get(`/perfil/acudiente/${idAcudiente}`);
  return data;
};

export const obtenerHijos = async (idAcudiente) => {
  const { data } = await api.get(`/perfil/acudiente/${idAcudiente}/estudiantes`);
  return data;
};

export const actualizarAcudiente = async (id, payload) => {
  const { data } = await api.put(`/perfil/acudiente/${id}`, payload);
  return data;
};

export const cambiarPasswordAcudiente = async (id, payload) => {
  const { data } = await api.put(`/perfil/acudiente/${id}/password`, payload);
  return data;
};

export const actualizarEstudiante = async (id, payload) => {
    const { data } = await api.put(`/perfil/estudiante/${id}`, payload);
    return data;
};

export const cambiarPasswordEstudiante = async (id, payload) => {
    const { data } = await api.put(`/perfil/estudiante/${id}/password`, payload);
    return data;
};

export const obtenerNotasEstudiante = async (idEstudiante) => {
  const { data } = await api.get(`/perfil/estudiante/${idEstudiante}/notas`);
  return data;
};