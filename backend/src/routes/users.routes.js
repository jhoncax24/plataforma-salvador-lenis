import { Router } from "express";
import { body, param } from "express-validator";
import { validateRequest } from "../utils/validators.js";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from "../controllers/users.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Public: crear usuario (registro)
router.post(
  "/",
  body('username').isString().isLength({ min: 3 }),
  body('password').isString().isLength({ min: 6 }),
  validateRequest,
  createUser
);

// Protected read list (admin)
router.get("/", authenticateToken, getUsers);

// Protected get single
router.get("/:id", authenticateToken, param('id').isInt(), validateRequest, getUserById);

// Protected update
router.put("/:id", authenticateToken, param('id').isInt(), validateRequest, updateUser);

// Protected delete
router.delete("/:id", authenticateToken, param('id').isInt(), validateRequest, deleteUser);

export default router;
