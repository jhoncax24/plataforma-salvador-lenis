import { Router } from "express";
import { 
    getPerfilEstudiante, 
    getNotasEstudiante, 
    getHorarioEstudiante,
    getTareasEstudiante, 
    getHistorialAcademico, 
    crearTareaEstudiante, 
    actualizarTareaEstudiante, 
    getFaltasEstudiante, 
    getDetalleMateria, 
    getDetalleAsistencia, 
    entregarTareaEstudiante 
} from "../controllers/estudiantes.controller.js";
import upload from '../middlewares/upload.middleware.js';

const router = Router();

// ==========================================
// RUTAS DE CONSULTA (GET)
// ==========================================

// Ruta para obtener el perfil usando el ID del usuario
router.get("/perfil/:idUsuario", getPerfilEstudiante);

// Rutas de información académica
router.get("/notas/:idUsuario", getNotasEstudiante);
router.get("/horario/:idUsuario", getHorarioEstudiante);
router.get("/tareas/:idUsuario", getTareasEstudiante);
router.get("/historial/:idUsuario", getHistorialAcademico);
router.get("/faltas/:idUsuario", getFaltasEstudiante);

// Rutas de detalle por materia
router.get("/notas-detalle/:idUsuario/:nombreMateria", getDetalleMateria);
router.get("/asistencia-detalle/:idUsuario", getDetalleAsistencia);


// ==========================================
// RUTAS DE ACCIÓN (POST, PUT)
// ==========================================

// Ruta para crear un recordatorio personal
router.post("/tareas/:idUsuario", crearTareaEstudiante);

// Ruta para editar una tarea existente
router.put("/tareas/editar/:idTarea", actualizarTareaEstudiante);

// 👇 NUEVA RUTA: Entregar tarea (Subir PDF) 👇
// Usamos el middleware "upload.single('archivoPdf')" antes del controlador
router.post("/tareas/:idUsuario/entregar", upload.single('archivoPdf'), entregarTareaEstudiante);


// ==========================================
// EXPORTACIÓN (Siempre al final)
// ==========================================
export default router;