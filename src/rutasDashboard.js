import { Router } from "express";
import { body, query } from "express-validator";
import ControladorDashboard from "../controladores/controladorDashboard.js";
import resultadosValidacion from "../middlewares/resultadosValidacion.js";

const router = Router();

// GET /servicios/dashboard/salones
router.get("/salones", ControladorDashboard.listarSalones);

// POST /servicios/dashboard/login
router.post(
  "/login",
  [
    body("usuario").notEmpty().withMessage("usuario es requerido"),
    body("password").notEmpty().withMessage("password es requerido"),
  ],
  resultadosValidacion,
  ControladorDashboard.iniciarSesion
);

// POST /servicios/dashboard/instalar-sps
router.post("/instalar-sps", ControladorDashboard.instalarSPs);

// GET /servicios/dashboard/reporte-reservas
router.get(
  "/reporte-reservas",
  [
    query("fecha_inicio").optional().isISO8601().withMessage("fecha_inicio inválida"),
    query("fecha_fin").optional().isISO8601().withMessage("fecha_fin inválida"),
    query("salon_id").optional().isInt({ min: 1 }).withMessage("salon_id inválido"),
    query("usuario_id").optional().isInt({ min: 1 }).withMessage("usuario_id inválido"),
  ],
  resultadosValidacion,
  ControladorDashboard.reporteReservas
);

export default router;
