import { DashboardServicio } from '../servicios/dashboardServicio.js';
import { ErrorAuth, ErrorBaseDatos, ErrorApp } from '../errores/ErrorApp.js';
import { generarToken } from '../middleware/auth.js';
import fs from 'fs/promises';
import path from 'path';
import { conexion } from '../config/conexion.js';
import dotenv from 'dotenv';

dotenv.config();

const RUTA_SQL = path.join(process.cwd(), 'src', 'sql', 'SP_reservas.sql');

export class DashboardControlador {
  constructor() {
    this.servicio = new DashboardServicio();
  }

  /**
   * Lista todos los salones para el dashboard
   */
  listarSalones = async (req, res, next) => {
    try {
      const listaSalones = await this.servicio.obtenerSalones();
      
      return res.json({
        ok: true,
        datos: listaSalones
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Inicia sesión de administrador
   */
  iniciarSesion = async (req, res, next) => {
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

      return res.json({
        ok: true,
        token
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Genera un reporte de reservas con filtros opcionales
   */
  reporteReservas = async (req, res, next) => {
    try {
      const { fecha_inicio, fecha_fin, salon_id, usuario_id } = req.query;

      // Validación adicional de fechas
      if (fecha_inicio && fecha_fin) {
        const fechaInicio = new Date(fecha_inicio);
        const fechaFin = new Date(fecha_fin);
        if (fechaInicio > fechaFin) {
          throw new ErrorApp('La fecha de inicio no puede ser posterior a la fecha de fin', 400);
        }
      }

      const parametros = {
        fechaInicio: fecha_inicio || null,
        fechaFin: fecha_fin || null,
        salonId: salon_id || null,
        usuarioId: usuario_id || null
      };

      const resultados = await this.servicio.generarReporteReservas(parametros);

      return res.json({
        ok: true,
        datos: resultados
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Instala los procedimientos almacenados en la base de datos
   */
  instalarSPs = async (req, res, next) => {
    try {
      // Leemos el archivo SQL
      let contenido = await fs.readFile(RUTA_SQL, { encoding: 'utf8' });

      // Preprocesar: remover líneas DELIMITER
      contenido = contenido.replace(/DELIMITER\s+\$\$/gi, '');
      contenido = contenido.replace(/DELIMITER\s+;/gi, '');
      contenido = contenido.replace(/\$\$/g, ';');

      // Eliminar cláusulas DEFINER
      contenido = contenido.replace(/CREATE\s+DEFINER=`[^`]+`@`[^`]+`\s+/gi, 'CREATE ');
      contenido = contenido.replace(/DEFINER=`[^`]+`@`[^`]+`/gi, '');

      // Dividir el contenido en procedimientos individuales
      const procedimientos = contenido.split(/(?=CREATE\s+PROCEDURE)/gi).filter(p => p.trim());
      const procedimientosInstalados = [];
      const procedimientosExistentes = [];

      for (const procedimiento of procedimientos) {
        // Extraer el nombre del procedimiento
        const matchNombre = procedimiento.match(/CREATE\s+PROCEDURE\s+`?([a-zA-Z_][a-zA-Z0-9_]*)`?/i);
        if (matchNombre) {
          const nombreProcedimiento = matchNombre[1];
          
          try {
            // Primero intentar eliminar el procedimiento si existe (para actualizarlo)
            try {
              await conexion.query(`DROP PROCEDURE IF EXISTS \`${nombreProcedimiento}\``);
            } catch (dropError) {
              // Si falla el DROP, continuamos igual (puede que no tenga permisos o no exista)
              console.warn(`No se pudo eliminar el procedimiento ${nombreProcedimiento}: ${dropError.message}`);
            }
            
            // Intentar ejecutar el CREATE PROCEDURE
            await conexion.query(procedimiento.trim());
            procedimientosInstalados.push(nombreProcedimiento);
          } catch (errorProcedimiento) {
            // Si el error es que ya existe, intentamos eliminarlo y recrearlo
            if (errorProcedimiento.message && errorProcedimiento.message.includes('already exists')) {
              try {
                // Intentar eliminar y recrear
                await conexion.query(`DROP PROCEDURE IF EXISTS \`${nombreProcedimiento}\``);
                await conexion.query(procedimiento.trim());
                procedimientosInstalados.push(nombreProcedimiento + ' (actualizado)');
              } catch (updateError) {
                // Si no podemos actualizar, lo marcamos como existente
                procedimientosExistentes.push(nombreProcedimiento);
                console.warn(`No se pudo actualizar el procedimiento ${nombreProcedimiento}: ${updateError.message}`);
              }
            } else {
              // Si es otro error, lo lanzamos
              throw errorProcedimiento;
            }
          }
        }
      }

      // Construir mensaje de respuesta
      let mensaje = '';
      if (procedimientosInstalados.length > 0) {
        mensaje = `Procedimientos instalados: ${procedimientosInstalados.join(', ')}. `;
      }
      if (procedimientosExistentes.length > 0) {
        mensaje += `Procedimientos ya existentes (sin cambios): ${procedimientosExistentes.join(', ')}.`;
      }
      if (mensaje === '') {
        mensaje = 'No se encontraron procedimientos para instalar.';
      }

      return res.json({
        ok: true,
        mensaje: mensaje.trim() || 'Procedimientos instalados/actualizados correctamente'
      });
    } catch (error) {
      next(new ErrorBaseDatos(`Error al instalar procedimientos: ${error.message}`));
    }
  };
}

