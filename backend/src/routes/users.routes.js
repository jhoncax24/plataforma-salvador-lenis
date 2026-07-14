import { Router } from "express"; 
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { 
  getAcudienteProfile, 
  getEstudiantesByAcudiente,
  updateAcudienteProfile, 
  updateEstudianteProfile, 
  changePassword, 
  vincularEstudianteAcudiente,
  getNotasEstudiante,
  getEventosCalendario,
  crearEventoCalendario, 
  deleteEventoCalendario,
  getTodasLasMaterias,
  getEstadoMatricula,
  registrarMatriculaLinea,
  getPlanillaDetalle,
  getEstudianteProfile,
  getHorarioEstudiante,
  getObservacionesAcudiente,
  getAsistenciaAcudiente
} from "../controllers/users.controller.js";

const router = Router();
router.get("/materias/todas", getTodasLasMaterias);
router.get("/acudiente/perfil/:idUsuario", authenticateToken, getAcudienteProfile);
router.get("/acudiente/:idAcudiente/estudiantes", authenticateToken, getEstudiantesByAcudiente);
router.put("/acudiente/perfil/:id", authenticateToken, updateAcudienteProfile);
router.get("/acudiente/:idAcudiente/eventos", authenticateToken, getEventosCalendario);
router.post("/acudiente/eventos", authenticateToken, crearEventoCalendario);
router.delete("/acudiente/eventos/:idEvento", authenticateToken, deleteEventoCalendario);
router.post("/acudiente/matricula", authenticateToken, registrarMatriculaLinea);
router.put("/estudiante/perfil/:id", authenticateToken, updateEstudianteProfile);
router.get("/estudiante/:idEstudiante/notas", authenticateToken, getNotasEstudiante);
router.get("/estudiante/:idEstudiante/observador", authenticateToken, getObservacionesAcudiente);
router.get("/estudiante/:idEstudiante/asistencia", authenticateToken, getAsistenciaAcudiente);
router.get("/estudiante/:idEstudiante/matricula", authenticateToken, getEstadoMatricula);
router.get("/perfil/:idUsuario", getEstudianteProfile);
router.get("/horario/:idUsuario", getHorarioEstudiante);
router.put("/password", authenticateToken, changePassword);
router.post("/vincular", authenticateToken, vincularEstudianteAcudiente);
router.get("/planilla/:idCurso/:idMateria/:periodo", getPlanillaDetalle);

export default router;