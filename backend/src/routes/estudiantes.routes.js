import { Router } from "express";
import { getPerfilEstudiante, getNotasEstudiante, getHorarioEstudiante, getTareasEstudiante, getHistorialAcademico, crearTareaEstudiante, actualizarTareaEstudiante } from "../controllers/estudiantes.controller.js";

const router = Router();

// Ruta para obtener el perfil usando el ID del usuario (de la tabla users)
router.get("/perfil/:idUsuario", getPerfilEstudiante);

// 👇 NUEVA RUTA 👇
router.get("/notas/:idUsuario", getNotasEstudiante);

// 👇 NUEVA RUTA DEL HORARIO 👇
router.get("/horario/:idUsuario", getHorarioEstudiante);
// 👇 NUEVA RUTA DE LAS TAREAS 👇
router.get("/tareas/:idUsuario", getTareasEstudiante);
// 👇 NUEVA RUTA DEL HISTORIAL ACADEMICO 👇
router.get("/historial/:idUsuario", getHistorialAcademico);
// 👇 NUEVA RUTA PARA CREAR TAREAS 👇
router.post("/tareas/:idUsuario", crearTareaEstudiante);
// 👇 NUEVA RUTA PARA ACTUALIZAR TAREAS 👇
router.put("/tareas/editar/:idTarea", actualizarTareaEstudiante);
export default router;
