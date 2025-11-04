import apicache from 'apicache';
import { SalonesServicio } from "../servicios/salonesServicio.js";

export class SalonesControlador {
  constructor() {
    this.servicio = new SalonesServicio();
  }
  crear = async (req, res, next) => {
    try {
      const datos = req.body;
      const nuevoSalon = await this.servicio.crear(datos);
      apicache.clear('/api/v1/salones'); // Limpiamos la caché de la lista completa de salones
      
      return res.status(201).json({
        estado: true,
        datos: nuevoSalon,
      });
    } catch (err) {
      next(err);
    }
  };
  actualizar = async (req, res, next) => {
    try {
      const { id } = req.params;
      const datos = req.body;
      const actualizado = await this.servicio.actualizar(id, datos);
      apicache.clear(`/api/v1/salones/${id}`); // Limpiamos la caché del detalle del salón
      apicache.clear('/api/v1/salones');
      
      if (actualizado) {
        return res.json({
          estado: true,
          mensaje: "Salón actualizado correctamente",
        });
      } else {
        return res
          .status(404)
          .json({ estado: false, mensaje: "Salón no encontrado" });
      }
    } catch (err) {
      next(err);
    }
  };
  eliminar = async (req, res, next) => {
    try {
      const { id } = req.params;
      const eliminado = await this.servicio.eliminar(id);
      apicache.clear(`/api/v1/salones/${id}`);
      apicache.clear('/api/v1/salones');

      if (eliminado) {
        return res.json({
          estado: true,
          mensaje: "Salón eliminado correctamente",
        });
      } else {
        return res
          .status(404)
          .json({ estado: false, mensaje: "Salón no encontrado" });
      }
    } catch (err) {
      next(err);
    }
  };
  obtenerTodos = async (req, res, next) => {
    try {
      const salones = await this.servicio.obtenerTodos();

      return res.json({
        estado: true,
        datos: salones,
      });
    } catch (err) {
      next(err);
    }
  };
  obtenerPorId = async (req, res, next) => {
    try {
      const { id } = req.params;
      const salon = await this.servicio.obtenerPorId(id);
      return res.json({
        estado: true,
        datos: salon,
      });
    } catch (err) {
      next(err);
    }
  };
}
