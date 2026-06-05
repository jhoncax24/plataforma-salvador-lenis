import { Router } from "express"; // <-- ESTO ES VITAL QUE DIGA EXPRESS
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
  deleteEventoCalendario
} from "../controllers/users.controller.js";

const router = Router();

router.get("/acudiente/perfil/:idUsuario", authenticateToken, getAcudienteProfile);
router.get("/acudiente/:idAcudiente/estudiantes", authenticateToken, getEstudiantesByAcudiente);
router.put("/acudiente/perfil/:id", authenticateToken, updateAcudienteProfile);
router.put("/estudiante/perfil/:id", authenticateToken, updateEstudianteProfile);
router.put("/password", authenticateToken, changePassword);
router.post("/vincular", authenticateToken, vincularEstudianteAcudiente);
router.get("/estudiante/:idEstudiante/notas", authenticateToken, getNotasEstudiante);
router.get("/acudiente/:idAcudiente/eventos", authenticateToken, getEventosCalendario);
router.post("/acudiente/eventos", authenticateToken, crearEventoCalendario);
router.delete("/acudiente/eventos/:idEvento", authenticateToken, deleteEventoCalendario);

export default router;
