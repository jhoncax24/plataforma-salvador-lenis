import { Router } from "express";
import {
    getAsignacionesDocente,
    crearTareaDocente,
    getTareasDocente,
    getPlanillaNotas,
    crearActividad,
    actualizarActividad,
    eliminarActividad,
    guardarNotasActividades,
    getResumenCursosDocente,
    getEstudiantesPorCurso,
    getObservacionesEstudiante,
    crearObservacion,
    guardarAsistenciaMasiva,
    getAsistenciaGuardada,
    getResumenAsistenciaCurso,
    actualizarTareaDocente
} from "../controllers/docentes.controller.js";

const router = Router();

// ==========================================
// ASIGNACIONES Y CURSOS
// ==========================================
// Obtener las materias y grados que dicta un profesor
router.get("/asignaciones/:idUsuario", getAsignacionesDocente);
// Obtener resumen acumulado de cursos para el dashboard
router.get("/resumen-cursos/:idUsuario", getResumenCursosDocente);

// ==========================================
// TAREAS Y RECORDATORIOS
// ==========================================
// Obtener las tareas que el profesor ha creado
router.get("/tareas/:idUsuario", getTareasDocente);
// Crear una nueva tarea para un grado específico
router.post("/tareas/:idUsuario", crearTareaDocente);
// Actualizar una tarea o recordatorio del docente
router.put("/tareas/:idTarea", actualizarTareaDocente);

// ==========================================
// PLANILLA Y CALIFICACIONES
// ==========================================
// Obtener listado de estudiantes, actividades y notas (incluye archivos PDF)
router.get("/planilla", getPlanillaNotas);
// Crear una nueva actividad (soporta requiere_pdf y fecha_entrega)
router.post("/actividades/:idUsuario", crearActividad);
// Actualizar datos de una actividad existente
router.put("/actividades/:idActividad", actualizarActividad);
// Eliminar una actividad y sus dependencias (notas y tarea del calendario)
router.delete("/actividades/:idActividad", eliminarActividad); 
// Guardar notas y retroalimentaciones masivamente
router.post("/notas-masivas", guardarNotasActividades);

// ==========================================
// OBSERVADOR DEL ALUMNO
// ==========================================
// Obtener estudiantes de un curso específico
router.get("/estudiantes-curso/:idCurso", getEstudiantesPorCurso);
// Obtener el historial de observaciones de un estudiante
router.get("/observaciones/:idEstudiante", getObservacionesEstudiante);
// Crear una nueva observación disciplinaria/académica
router.post("/observaciones/:idUsuario", crearObservacion);

// ==========================================
// CONTROL DE ASISTENCIA
// ==========================================
// Guardar lista de asistencia masiva
router.post("/asistencia/:idUsuario", guardarAsistenciaMasiva);
// Obtener la asistencia guardada en una fecha específica
router.get("/asistencia-fecha", getAsistenciaGuardada); 
// Obtener el consolidado/resumen de asistencia por materia
router.get("/asistencia-resumen/:idCurso/:idMateria", getResumenAsistenciaCurso);

export default router;