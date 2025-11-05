import express from 'express';
import { AdminControlador } from '../../controladores/adminControlador.js';
import { esAdmin } from '../../middleware/auth.js';

const router = express.Router();
const adminCtrl = new AdminControlador();

// Login administrador (dev): devuelve JWT
router.post('/login', adminCtrl.login);

// Endpoint protegido para instalar SPs
router.post('/instalar-sps', esAdmin, adminCtrl.instalarSps);

// Endpoint para generar reporte de reservas (protegido a administradores)
router.get('/reporte-reservas', esAdmin, adminCtrl.reporteReservas);

export { router };
