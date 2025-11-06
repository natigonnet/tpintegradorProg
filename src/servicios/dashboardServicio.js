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
      const parametroFechaInicio = fechaInicio && fechaInicio !== '' ? fechaInicio : null;
      const parametroFechaFin = fechaFin && fechaFin !== '' ? fechaFin : null;
      const parametroSalonId = salonId && salonId !== '' ? parseInt(salonId, 10) : null;
      const parametroUsuarioId = usuarioId && usuarioId !== '' ? parseInt(usuarioId, 10) : null;

      // Validar que los IDs sean números válidos si se proporcionaron
      if (salonId && salonId !== '' && isNaN(parametroSalonId)) {
        throw new Error('El salon_id debe ser un número válido');
      }
      if (usuarioId && usuarioId !== '' && isNaN(parametroUsuarioId)) {
        throw new Error('El usuario_id debe ser un número válido');
      }

      // Ejecutamos el procedimiento almacenado
      // CALL devuelve un array; normalmente la primera posición contiene los registros
      const [rows] = await conexion.query(
        'CALL sp_obtener_reporte_reservas(?,?,?,?)',
        [parametroFechaInicio, parametroFechaFin, parametroSalonId, parametroUsuarioId]
      );

      // rows puede ser [resultRows, ...] o directamente resultRows dependiendo del driver
      const resultados = Array.isArray(rows) && rows.length > 0 && Array.isArray(rows[0]) 
        ? rows[0] 
        : rows;

      return resultados || [];
    } catch (error) {
      console.error('Error en generarReporteReservas:', error);
      throw new ErrorBaseDatos(`Error al generar reporte de reservas: ${error.message}`);
    }
  }
}

