import { Router } from "express";
import {
    getAsignacionesDocente,
    crearTareaDocente,
    getTareasDocente,
    getPlanillaNotas,
    crearActividad,
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

// Obtener las materias y grados que dicta un profesor
router.get("/asignaciones/:idUsuario", getAsignacionesDocente);

// Obtener las tareas que el profesor ha creado
router.get("/tareas/:idUsuario", getTareasDocente);

// Crear una nueva tarea para un grado específico
router.post("/tareas/:idUsuario", crearTareaDocente);

// Rutas de Notas Planilla
router.get("/planilla", getPlanillaNotas);
router.post("/actividades/:idUsuario", crearActividad);
router.post("/notas-masivas", guardarNotasActividades);
router.get("/resumen-cursos/:idUsuario", getResumenCursosDocente);

// Observador
router.get("/estudiantes-curso/:idCurso", getEstudiantesPorCurso);
router.get("/observaciones/:idEstudiante", getObservacionesEstudiante);
router.post("/observaciones/:idUsuario", crearObservacion);
// Asistencia
router.post("/asistencia/:idUsuario", guardarAsistenciaMasiva);
router.get("/asistencia-fecha", getAsistenciaGuardada); // <-- LA NUEVA
// Cámbiate esta ruta:
router.get("/asistencia-resumen/:idCurso/:idMateria", getResumenAsistenciaCurso);
// Actualizar una tarea o recordatorio del docente
router.put("/tareas/:idTarea", actualizarTareaDocente);

export default router;