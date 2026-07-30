import { Router } from "express";
import { 
  getMatriculasPendientes, 
  aprobarMatricula, 
  rechazarMatricula 
} from "../controllers/admin.controller.js";

const router = Router();

// Endpoint para obtener matrículas pendientes y rechazadas
router.get("/matriculas/pendientes", getMatriculasPendientes);

// Endpoint para aprobar matrícula
router.put("/matriculas/aprobar/:idMatricula", aprobarMatricula);

// 👇 ASEGÚRATE DE TENER ESTA RUTA DECLARADA COMO PUT 👇
router.put("/matriculas/rechazar/:idMatricula", rechazarMatricula);

export default router;