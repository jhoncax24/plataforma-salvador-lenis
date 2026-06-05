import api from "./api"; // Usa tu instancia configurada

// ==========================================
// FUNCIONES DEL ACUDIENTE 
// ==========================================
export const obtenerPerfilAcudiente = async (idUsuario) => {
  const response = await api.get(`/users/acudiente/perfil/${idUsuario}`);
  return response.data;
};

export const obtenerEstudiantesDelAcudiente = async (idAcudiente) => {
  const response = await api.get(`/users/acudiente/${idAcudiente}/estudiantes`);
  return response.data;
};

export const obtenerHijos = async (idAcudiente) => {
  // Alias para compatibilidad
  return obtenerEstudiantesDelAcudiente(idAcudiente);
};

export const actualizarPerfilAcudiente = async (id, datos) => {
  const response = await api.put(`/users/acudiente/perfil/${id}`, datos);
  return response.data;
};

export const actualizarAcudiente = async (id, payload) => {
  // Alias para compatibilidad
  return actualizarPerfilAcudiente(id, payload);
};

export const cambiarContrasenaUsuario = async (datosPassword) => {
  const response = await api.put(`/users/password`, datosPassword);
  return response.data;
};

export const cambiarPasswordAcudiente = async (id, payload) => {
  // Alias para compatibilidad
  return cambiarContrasenaUsuario(payload);
};

// ==========================================
// FUNCIONES DEL ESTUDIANTE 
// ==========================================
export const obtenerPerfilEstudiante = async (idUsuario) => {
  const response = await api.get(`/estudiantes/perfil/${idUsuario}`);
  return response.data;
};

export const actualizarPerfilEstudiante = async (id, datos) => {
  const response = await api.put(`/users/estudiante/perfil/${id}`, datos);
  return response.data;
};

export const actualizarEstudiante = async (id, payload) => {
    // Alias para compatibilidad
    return actualizarPerfilEstudiante(id, payload);
};

export const cambiarPasswordEstudiante = async (id, payload) => {
    const data = await cambiarContrasenaUsuario(payload);
    return data;
};

// ==========================================
// NOTAS, HORARIO, TAREAS Y MÁS
// ==========================================

// Obtiene las notas de un estudiante
export const obtenerNotasEstudiante = async (idEstudiante) => {
  try {
    const response = await api.get(`/estudiantes/notas/${idEstudiante}`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo notas:", error);
    return []; // Si hay error, devolvemos un arreglo vacío para que no se rompa la vista
  }
};

export const obtenerHorarioEstudiante = async (idUsuario) => {
  try {
    const response = await api.get(`/estudiantes/horario/${idUsuario}`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo horario:", error);
    return [];
  }
};

export const obtenerHistorialAcademico = async (idUsuario) => {
  const response = await api.get(`/estudiantes/historial/${idUsuario}`);
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

// Obtener el resumen de faltas del estudiante
export const obtenerFaltasEstudiante = async (idUsuario) => {
  try {
    const response = await api.get(`/estudiantes/faltas/${idUsuario}`);
    return response.data.totalFaltas;
  } catch (error) {
    console.error("Error obteniendo faltas:", error);
    return 0; // Si hay un error (ej. tabla vacía), retornamos 0 para no dañar la UI
  }
};

// ==========================================
// EVENTOS DEL ACUDIENTE
// ==========================================

// Obtener eventos del acudiente
export const obtenerEventos = async (idAcudiente) => {
  const response = await api.get(`/users/acudiente/${idAcudiente}/eventos`);
  return response.data;
};

// Guardar un evento en la BD
export const guardarEventoBD = async (datos) => {
  const response = await api.post(`/users/acudiente/eventos`, datos);
  return response.data;
};

// Eliminar un evento de la BD
export const eliminarEventoBD = async (idEvento) => {
  const response = await api.delete(`/users/acudiente/eventos/${idEvento}`);
  return response.data;
};