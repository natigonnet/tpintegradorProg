import { conexion } from '../config/conexion.js';
import { generarToken } from '../middleware/auth.js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { ErrorAuth, ErrorBaseDatos } from '../errores/ErrorApp.js';

dotenv.config();

const SQL_PATH = path.join(process.cwd(), 'src', 'sql', 'SP_reservas.sql');

export class AdminControlador {
  // Login simple basado en variables de entorno (no hay sistema de auth en el repo)
  login = async (req, res, next) => {
    try {
      const { usuario, password } = req.body;

      const ADMIN_USER = process.env.ADMIN_USER || 'admin';
      const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

      if (!usuario || !password) {
        throw new ErrorAuth('Usuario y contraseña requeridos');
      }

      if (usuario !== ADMIN_USER || password !== ADMIN_PASS) {
        throw new ErrorAuth('Credenciales inválidas');
      }

      const token = generarToken({ usuario, rol: 'admin' });

      return res.json({ ok: true, token });
    } catch (err) {
      next(err);
    }
  };

  instalarSps = async (req, res, next) => {
    try {
      // Leemos el archivo SQL
      let contenido = await fs.readFile(SQL_PATH, { encoding: 'utf8' });

      // Preprocesar: remover líneas DELIMITER y asegurar que los bloques terminen en ';'
      // En nuestro archivo ya guardamos las SP con delimitadores convertidos a ';',
      // pero por seguridad removemos tags innecesarios.
      contenido = contenido.replace(/DELIMITER\s+\$\$/gi, '');
      contenido = contenido.replace(/DELIMITER\s+;/gi, '');
      contenido = contenido.replace(/\$\$/g, ';');

      // Eliminar cláusulas DEFINER que pueden requerir privilegios SUPER al importar/crear routines
      // Ej: CREATE DEFINER=`root`@`localhost` PROCEDURE ...  -> convertimos a CREATE PROCEDURE ...
      contenido = contenido.replace(/CREATE\s+DEFINER=`[^`]+`@`[^`]+`\s+/gi, 'CREATE ');
      // También limpiar cualquier DEFINER=... suelto
      contenido = contenido.replace(/DEFINER=`[^`]+`@`[^`]+`/gi, '');

      // Ejecutar los statements
      // Nota: la conexión tiene multipleStatements: true en la configuración
      const [result] = await conexion.query(contenido);

      return res.json({ ok: true, mensaje: 'Procedimientos instalados/actualizados correctamente' });
    } catch (err) {
      next(new ErrorBaseDatos(err.message));
    }
  };

  // Generar reporte de reservas usando el procedimiento almacenado
  reporteReservas = async (req, res, next) => {
    try {
      // Obtenemos filtros desde query string
      const { fecha_inicio, fecha_fin, salon_id, usuario_id } = req.query;

      const p_fecha_inicio = fecha_inicio || null;
      const p_fecha_fin = fecha_fin || null;
      const p_salon_id = salon_id ? parseInt(salon_id, 10) : null;
      const p_usuario_id = usuario_id ? parseInt(usuario_id, 10) : null;

      // Ejecutamos el procedimiento almacenado
      // CALL devuelve un array; normalmente la primera posición contiene los registros
      const [rows] = await conexion.query('CALL sp_obtener_reporte_reservas(?,?,?,?)', [p_fecha_inicio, p_fecha_fin, p_salon_id, p_usuario_id]);

      // rows puede ser [resultRows, ...] o directamente resultRows dependiendo del driver
      const resultados = Array.isArray(rows) && rows.length > 0 && Array.isArray(rows[0]) ? rows[0] : rows;

      return res.json({ ok: true, datos: resultados });
    } catch (err) {
      next(new ErrorBaseDatos(err.message));
    }
  };
}
