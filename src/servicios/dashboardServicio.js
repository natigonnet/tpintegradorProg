import Salones from '../db/salones.js';
import { conexion } from '../config/conexion.js';
import { ErrorBaseDatos } from '../errores/ErrorApp.js';

export class DashboardServicio {
  constructor() {
    this.salones = new Salones();
  }

  /**
   * Obtiene todos los salones activos para mostrar en el dashboard
   * @returns {Promise<Array>} Lista de salones
   */
  async obtenerSalones() {
    try {
      const listaSalones = await this.salones.obtenerTodos();
      return listaSalones;
    } catch (error) {
      throw new ErrorBaseDatos(`Error al obtener salones: ${error.message}`);
    }
  }

  /**
   * Genera un reporte de reservas usando el procedimiento almacenado
   * @param {Object} parametros - Parámetros de filtrado
   * @param {string|null} parametros.fechaInicio - Fecha de inicio del reporte
   * @param {string|null} parametros.fechaFin - Fecha de fin del reporte
   * @param {number|null} parametros.salonId - ID del salón a filtrar
   * @param {number|null} parametros.usuarioId - ID del usuario a filtrar
   * @returns {Promise<Array>} Resultados del reporte
   */
  async generarReporteReservas({ fechaInicio, fechaFin, salonId, usuarioId }) {
    try {
      const parametroFechaInicio = fechaInicio || null;
      const parametroFechaFin = fechaFin || null;
      const parametroSalonId = salonId ? parseInt(salonId, 10) : null;
      const parametroUsuarioId = usuarioId ? parseInt(usuarioId, 10) : null;

      // Ejecutamos el procedimiento almacenado
      const [filas] = await conexion.query(
        'CALL sp_obtener_reporte_reservas(?,?,?,?)',
        [parametroFechaInicio, parametroFechaFin, parametroSalonId, parametroUsuarioId]
      );

      // El resultado puede venir en diferentes formatos dependiendo del driver
      const resultados = Array.isArray(filas) && filas.length > 0 && Array.isArray(filas[0]) 
        ? filas[0] 
        : filas;

      return resultados;
    } catch (error) {
      throw new ErrorBaseDatos(`Error al generar reporte de reservas: ${error.message}`);
    }
  }
}

