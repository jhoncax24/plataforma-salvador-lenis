import { Router } from "express";
import { login, register, solicitarCodigo, verificarCodigo, cambiarPasswordFinal } from "../controllers/auth.controller.js";
import { body } from "express-validator";
import { validateRequest } from "../utils/validators.js";

const router = Router();

router.post(
  "/login",
  body('username').isString().notEmpty(),
  body('password').isString().notEmpty(),
  validateRequest,
  login
);
router.post("/register", register);

// 👇 NUEVAS RUTAS DE RECUPERACIÓN DE CONTRASEÑA 👇
router.post("/recovery/solicitar", solicitarCodigo);
router.post("/recovery/verificar", verificarCodigo);
router.post("/recovery/cambiar", cambiarPasswordFinal);

export default router;
