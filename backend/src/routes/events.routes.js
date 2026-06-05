import { Router } from "express";
import { body, param } from "express-validator";
import { validateRequest } from "../utils/validators.js";
import {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} from "../controllers/events.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Public: listar eventos
router.get("/", listEvents);
router.get("/:id", param('id').isInt(), validateRequest, getEvent);

// Protected: crear, editar, borrar (admins/docentes)
router.post("/", authenticateToken, body('title').isString().notEmpty(), validateRequest, createEvent);
router.put("/:id", authenticateToken, param('id').isInt(), validateRequest, updateEvent);
router.delete("/:id", authenticateToken, param('id').isInt(), validateRequest, deleteEvent);

export default router;
