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





// 1. Obtiene los datos personales (Este ya lo teníamos real)
export const obtenerPerfilEstudiante = async (idUsuario) => {
  const { data } = await api.get(`/estudiantes/perfil/${idUsuario}`);
  return data;
};

// 2. Obtiene las notas reales desde PostgreSQL
export const obtenerNotasEstudiante = async (idUsuario) => {
  try {
    const { data } = await api.get(`/estudiantes/notas/${idUsuario}`);
    return data;
  } catch (error) {
    console.error("Error obteniendo notas:", error);
    return []; // Si hay error, devolvemos un arreglo vacío para que no se rompa la vista
  }
};

export const obtenerHorarioEstudiante = async (idUsuario) => {
  try {
    const { data } = await api.get(`/estudiantes/horario/${idUsuario}`);
    return data;
  } catch (error) {
    console.error("Error obteniendo horario:", error);
    return [];
  }
};

export const obtenerHistorialAcademico = async (idUsuario) => {
  const response = await api.get(`/estudiantes/historial/${idUsuario}`); // ✅ Ahora sí coincide con tu backend
  return response.data;
};

// Obtener las tareas del calendario
export const obtenerTareasEstudiante = async (idUsuario) => {
  const response = await api.get(`/estudiantes/tareas/${idUsuario}`);
  return response.data;
};

// Guardar un nuevo recordatorio en el calendario
export const guardarRecordatorio = async (idUsuario, datosTarea) => {
  const response = await api.post(`/estudiantes/tareas/${idUsuario}`, datosTarea);
  return response.data;
};

// Actualizar un recordatorio existente
export const actualizarRecordatorio = async (idTarea, datosTarea) => {
  const response = await api.put(`/estudiantes/tareas/editar/${idTarea}`, datosTarea);
  return response.data;
};