import { Router } from "express";
import { param, body } from "express-validator";
import { validateRequest } from "../utils/validators.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  getAcudienteById,
  getHijosAcudiente,
  updateAcudiente,
  updateAcudientePassword,
  updateEstudiante,
  updateEstudiantePassword,
  getNotasEstudiante
} from "../controllers/perfil.controller.js";

const router = Router();

// Todas las rutas de perfil deben estar protegidas
router.use(authenticateToken);

// Acudiente
router.get("/acudiente/:id", param('id').isInt(), validateRequest, getAcudienteById);
router.get("/acudiente/:id/estudiantes", param('id').isInt(), validateRequest, getHijosAcudiente);
router.put("/acudiente/:id", param('id').isInt(), validateRequest, updateAcudiente);
router.put("/acudiente/:id/password", 
    param('id').isInt(), 
    body('actual').isString().notEmpty(),
    body('nueva').isString().isLength({ min: 6 }),
    validateRequest, 
    updateAcudientePassword
);

// Estudiante
router.put("/estudiante/:id", param('id').isInt(), validateRequest, updateEstudiante);
router.put("/estudiante/:id/password", 
    param('id').isInt(), 
    body('actual').isString().notEmpty(),
    body('nueva').isString().isLength({ min: 6 }),
    validateRequest, 
    updateEstudiantePassword
);
router.get("/estudiante/:id/notas", param('id').isInt(), validateRequest, getNotasEstudiante);

export default router;