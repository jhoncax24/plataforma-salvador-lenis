import api from "./api"; 

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
  return obtenerEstudiantesDelAcudiente(idAcudiente);
};

export const actualizarPerfilAcudiente = async (id, datos) => {
  const response = await api.put(`/users/acudiente/perfil/${id}`, datos);
  return response.data;
};

export const actualizarAcudiente = async (id, payload) => {
  return actualizarPerfilAcudiente(id, payload);
};

export const cambiarContrasenaUsuario = async (datosPassword) => {
  const response = await api.put(`/users/password`, datosPassword);
  return response.data;
};

export const cambiarPasswordAcudiente = async (id, payload) => {
  return cambiarContrasenaUsuario(payload);
};

export const obtenerEventos = async (idAcudiente) => {
  const response = await api.get(`/users/acudiente/${idAcudiente}/eventos`);
  return response.data;
};

export const guardarEventoBD = async (datos) => {
  const response = await api.post(`/users/acudiente/eventos`, datos);
  return response.data;
};

export const eliminarEventoBD = async (idEvento) => {
  const response = await api.delete(`/users/acudiente/eventos/${idEvento}`);
  return response.data;
};

// ==========================================
// MATRÍCULA (ACUDIENTE / ESTUDIANTE)
// ==========================================
export const obtenerEstadoMatricula = async (idEstudiante) => {
  const response = await api.get(`/users/estudiante/${idEstudiante}/matricula`);
  return response.data;
};

export const enviarMatriculaBD = async (datos) => {
  const response = await api.post('/users/acudiente/matricula', datos);
  return response.data;
};

// ==========================================
// ENDPOINTS COMPARTIDOS Y GLOBALES
// ==========================================
export const obtenerTodasLasMaterias = async () => {
  try {
    const response = await api.get('/users/materias/todas'); 
    return response.data;
  } catch (error) {
    console.error("Error al obtener las materias:", error);
    return [];
  }
};

// 👇 FUNCIÓN ACTUALIZADA 👇
export const obtenerPlanillaNotas = async (idCurso, idMateria, periodo) => {
  try {
    // Conectamos a la ruta del docente y enviamos las variables como 'params'
    // Esto arma una URL tipo: /docentes/planilla?idCurso=1&idMateria=2&periodo=1
    const response = await api.get(`/docentes/planilla`, {
      params: { idCurso, idMateria, periodo }
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener planilla:", error);
    return { actividades: [], planilla: [] };
  }
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
    return actualizarPerfilEstudiante(id, payload);
};

export const cambiarPasswordEstudiante = async (id, payload) => {
    const data = await cambiarContrasenaUsuario(payload);
    return data;
};

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
  try {
    const response = await api.get(`/estudiantes/historial/${idUsuario}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener historial:", error);
    return [];
  }
};

export const obtenerTareasEstudiante = async (idUsuario) => {
  const response = await api.get(`/estudiantes/tareas/${idUsuario}`);
  return response.data;
};

export const guardarRecordatorio = async (idUsuario, datosTarea) => {
  const response = await api.post(`/estudiantes/tareas/${idUsuario}`, datosTarea);
  return response.data;
};

export const actualizarRecordatorio = async (idTarea, datosTarea) => {
  const response = await api.put(`/estudiantes/tareas/editar/${idTarea}`, datosTarea);
  return response.data;
};

export const obtenerFaltasEstudiante = async (idUsuario) => {
  try {
    const response = await api.get(`/estudiantes/faltas/${idUsuario}`);
    return response.data.totalFaltas;
  } catch (error) {
    console.error("Error obteniendo faltas:", error);
    return 0; 
  }
};

export const obtenerDetalleMateria = async (idUsuario, nombreMateria) => {
  try {
    const response = await api.get(`/estudiantes/notas-detalle/${idUsuario}/${nombreMateria}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener detalle de materia:", error);
    return { P1: [], P2: [], P3: [], P4: [] };
  }
};

export const obtenerDetalleAsistencia = async (idUsuario) => {
  try {
    const response = await api.get(`/estudiantes/asistencia-detalle/${idUsuario}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener asistencia:", error);
    return [];
  }
};

export const obtenerObservacionesHijo = async (idEstudiante) => {
  try {
    const response = await api.get(`/users/estudiante/${idEstudiante}/observador`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener observador:", error);
    return [];
  }
};

export const obtenerAsistenciaHijo = async (idEstudiante) => {
  try {
    const response = await api.get(`/users/estudiante/${idEstudiante}/asistencia`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener asistencia:", error);
    return [];
  }
};

// ==========================================
// ENTREGAR TAREA (SUBIR PDF)
// ==========================================
export const entregarTareaEstudiante = async (idUsuario, idActividad, archivoPdf) => {
  // 1. Instanciamos FormData para empaquetar el archivo y los datos
  const formData = new FormData();
  
  // 2. Agregamos los datos que espera el backend
  formData.append('idActividad', idActividad);
  
  // 3. Agregamos el archivo PDF. El nombre 'archivoPdf' debe coincidir 
  // con lo configurado en upload.single('archivoPdf') en el backend.
  formData.append('archivoPdf', archivoPdf); 

  try {
    // Usamos tu instancia 'api' y enviamos el formData
    const response = await api.post(`/estudiantes/tareas/${idUsuario}/entregar`, formData, {
      headers: {
        // Le indicamos al servidor que enviamos un archivo binario
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error al enviar la tarea:", error);
    throw error;
  }
};

// ==========================================
// ENDPOINTS PARA DOCENTES (Usando Axios)
// ==========================================
export const obtenerAsignaciones = async (idUsuario) => {
  try {
    const response = await api.get(`/docentes/asignaciones/${idUsuario}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener asignaciones:", error);
    return [];
  }
};

export const obtenerTareasDocente = async (idUsuario) => {
  try {
    const response = await api.get(`/docentes/tareas/${idUsuario}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener tareas del docente:", error);
    return [];
  }
};

export const crearTareaGlobal = async (idUsuario, tareaData) => {
  try {
    const response = await api.post(`/docentes/tareas/${idUsuario}`, tareaData);
    return response.data;
  } catch (error) {
    console.error("Error al crear tarea global:", error);
    throw error;
  }
};

export const obtenerEstudiantesNotas = async (idCurso, idMateria, periodo) => {
  try {
    const response = await api.get(`/docentes/estudiantes-notas`, {
      params: { idCurso, idMateria, periodo }
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener estudiantes:", error);
    return [];
  }
};

export const guardarNotasDocente = async (idUsuario, datosNotas) => {
  try {
    const response = await api.post(`/docentes/notas/${idUsuario}`, datosNotas);
    return response.data;
  } catch (error) {
    console.error("Error al guardar notas:", error);
    throw error;
  }
};

export const crearActividadDocente = async (idUsuario, datos) => {
  try {
    const response = await api.post(`/docentes/actividades/${idUsuario}`, datos);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const actualizarActividadDocente = async (idActividad, datos) => {
  try {
    const response = await api.put(`/docentes/actividades/${idActividad}`, datos);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar la actividad:", error);
    throw error;
  }
};

export const eliminarActividadDocente = async (idActividad) => {
  try {
    const response = await api.delete(`/docentes/actividades/${idActividad}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar la actividad:", error);
    throw error;
  }
};

export const guardarNotasMasivas = async (notasArray) => {
  try {
    const response = await api.post(`/docentes/notas-masivas`, { notasArray });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const obtenerResumenCursos = async (idUsuario) => {
  try {
    const response = await api.get(`/docentes/resumen-cursos/${idUsuario}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener resumen:", error);
    return [];
  }
};

// ==========================================
// MÓDULO OBSERVADOR
// ==========================================
export const obtenerEstudiantesCurso = async (idCurso) => {
  try {
    const response = await api.get(`/docentes/estudiantes-curso/${idCurso}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener estudiantes del curso:", error);
    return [];
  }
};

export const obtenerHistorialObservaciones = async (idEstudiante) => {
  try {
    const response = await api.get(`/docentes/observaciones/${idEstudiante}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener historial:", error);
    return [];
  }
};

export const guardarObservacion = async (idUsuario, datos) => {
  try {
    const response = await api.post(`/docentes/observaciones/${idUsuario}`, datos);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==========================================
// MÓDULO ASISTENCIA
// ==========================================
export const guardarAsistencia = async (idUsuario, datosAsistencia) => {
  try {
    const response = await api.post(`/docentes/asistencia/${idUsuario}`, datosAsistencia);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const obtenerAsistenciaPorFecha = async (idCurso, idMateria, fecha) => {
  try {
    const response = await api.get(`/docentes/asistencia-fecha`, {
      params: { idCurso, idMateria, fecha }
    });
    return response.data;
  } catch (error) {
    console.error("Error al cargar asistencia:", error);
    return [];
  }
};

export const obtenerResumenAsistencia = async (idCurso, idMateria) => {
  try {
    const response = await api.get(`/docentes/asistencia-resumen/${idCurso}/${idMateria}`);
    return response.data;
  } catch (error) {
    console.error("Error al cargar el resumen:", error);
    return [];
  }
};

// ==========================================
// ACTUALIZAR TAREA/EVENTO DEL DOCENTE
// ==========================================
export const actualizarTareaGlobal = async (idTarea, tareaData) => {
  try {
    const response = await api.put(`/docentes/tareas/${idTarea}`, tareaData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar la tarea del docente:", error);
    throw error;
  }
};

export const modificarPerfilDocente = async (idUsuario, datosNuevos) => {
  try {
    const response = await api.put(`/perfil/docente/${idUsuario}`, datosNuevos);
    return response.data; 
  } catch (error) {
    console.error("Error en la petición de modificar perfil:", error);
    throw error;
  }
};

//FUNCIONES CORRESPONDIENTES A JEFRY (ACUDIENTE)

export const obtenerFechaLimiteMatricula = async () => {
  try {
    const response = await api.get('/users/matricula/limite');
    let fechaLimpia = response.data.fecha_limite;
    if (fechaLimpia && fechaLimpia.includes(' ')) {
      fechaLimpia = fechaLimpia.replace(' ', 'T');
    }
    return fechaLimpia;
  } catch (error) {
    console.error("Error obteniendo fecha límite de la BD:", error);
    return '2026-08-15T23:59:59';
  }
};