import { Router } from 'express';
import { body, query } from 'express-validator';
import { DashboardControlador } from '../../controladores/dashboardControlador.js';
import { esAdmin } from '../../middleware/auth.js';
import resultadosValidacion from '../../resuladosValidacion.js';

const router = Router();
const controladorDashboard = new DashboardControlador();

// GET /servicios/dashboard/salones - Obtener lista de salones
router.get('/salones', controladorDashboard.listarSalones);

// POST /servicios/dashboard/login - Iniciar sesión de administrador
router.post(
  '/login',
  [
    body('usuario')
      .notEmpty()
      .withMessage('El usuario es requerido')
      .trim()
      .escape(),
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida')
  ],
  resultadosValidacion,
  controladorDashboard.iniciarSesion
);

// POST /servicios/dashboard/instalar-sps - Instalar procedimientos almacenados (requiere autenticación)
router.post(
  '/instalar-sps',
  esAdmin,
  controladorDashboard.instalarSPs
);

// GET /servicios/dashboard/reporte-reservas - Generar reporte de reservas (requiere autenticación)
router.get(
  '/reporte-reservas',
  esAdmin,
  [
    query('fecha_inicio')
      .optional()
      .isISO8601()
      .withMessage('La fecha_inicio debe tener formato ISO8601 válido'),
    query('fecha_fin')
      .optional()
      .isISO8601()
      .withMessage('La fecha_fin debe tener formato ISO8601 válido')
      .custom((fechaFin, { req }) => {
        const fechaInicio = req.query.fecha_inicio;
        if (fechaInicio && fechaFin) {
          if (new Date(fechaInicio) > new Date(fechaFin)) {
            throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
          }
        }
        return true;
      }),
    query('salon_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('El salon_id debe ser un número entero mayor a 0')
      .toInt(),
    query('usuario_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('El usuario_id debe ser un número entero mayor a 0')
      .toInt()
  ],
  resultadosValidacion,
  controladorDashboard.reporteReservas
);

export { router };

