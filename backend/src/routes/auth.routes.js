import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
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

export default router;
