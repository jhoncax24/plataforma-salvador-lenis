import { Router } from "express";
import { param } from "express-validator";
import { validateRequest } from "../utils/validators.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  getAcudienteProfile,
  updateAcudienteProfile,
  changePasswordAcudiente,
  getEstudiantesByAcudiente,
  updateEstudianteByAcudiente,
  changePasswordEstudianteByAcudiente,
  getNotasEstudianteByAcudiente,
  getPlanillaDetalleByAcudiente,
  getEstadoMatriculaByAcudiente,
  registrarMatriculaLineaByAcudiente,
  getEventosCalendarioByAcudiente,
  crearEventoCalendarioByAcudiente,
  deleteEventoCalendarioByAcudiente,
  getFechaLimiteMatricula,
  guardarComprobanteMatricula // 👈 1. IMPORTAMOS LA NUEVA FUNCIÓN
} from "../controllers/acudientes.controller.js";

const router = Router();

// Protegemos todas las rutas del acudiente con el Token JWT
router.use(authenticateToken);

// 1. Perfil Acudiente
router.get("/perfil/:idUsuario", param('idUsuario').isInt(), validateRequest, getAcudienteProfile);
router.put("/perfil/:idUsuario", param('idUsuario').isInt(), validateRequest, updateAcudienteProfile);
router.put("/perfil/:idUsuario/password", param('idUsuario').isInt(), validateRequest, changePasswordAcudiente);

// 2. Perfil Estudiantes (Hijos)
router.get("/:idAcudiente/estudiantes", param('idAcudiente').isInt(), validateRequest, getEstudiantesByAcudiente);
router.put("/estudiante/:idEstudiante", param('idEstudiante').isInt(), validateRequest, updateEstudianteByAcudiente);
router.put("/estudiante/:idEstudiante/password", param('idEstudiante').isInt(), validateRequest, changePasswordEstudianteByAcudiente);

// 3. Notas y Planillas
router.get("/estudiante/:idEstudiante/notas", param('idEstudiante').isInt(), validateRequest, getNotasEstudianteByAcudiente);
router.get("/planilla/:idCurso/:idMateria/:periodo", getPlanillaDetalleByAcudiente);

// 4. Matrícula
router.get("/matricula/estado/:idEstudiante", param('idEstudiante').isInt(), validateRequest, getEstadoMatriculaByAcudiente);
router.post("/matricula/enviar", registrarMatriculaLineaByAcudiente);
// 👇 2. NUEVA RUTA: Guardar comprobante de pago subido a Cloudinary 👇
router.put("/matricula/comprobante", guardarComprobanteMatricula);

// 5. Calendario Acudiente
router.get("/calendario/:idAcudiente", param('idAcudiente').isInt(), validateRequest, getEventosCalendarioByAcudiente);
router.post("/calendario/guardar", crearEventoCalendarioByAcudiente);
router.delete("/calendario/eliminar/:idEvento", validateRequest, deleteEventoCalendarioByAcudiente);
router.get('/matricula/limite', getFechaLimiteMatricula);

export default router;