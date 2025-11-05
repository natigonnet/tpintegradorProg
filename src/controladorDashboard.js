import ServicioDashboard from "../servicios/servicioDashboard.js";
import ErrorApp from "../utils/ErrorApp.js";

export default class ControladorDashboard {
  static async listarSalones(_req, res, next) {
    try {
      const data = await ServicioDashboard.obtenerSalones();
      res.json(data);
    } catch (e) {
      next(new ErrorApp(e.message, e.codigo || 502));
    }
  }

  static async iniciarSesion(req, res, next) {
    try {
      const { usuario, password } = req.body;
      const data = await ServicioDashboard.iniciarSesion({ usuario, password });
      res.json(data);
    } catch (e) {
      next(new ErrorApp(e.message, e.codigo || 401));
    }
  }

  static async instalarSPs(req, res, next) {
    try {
      const token = (req.headers.authorization || "").replace("Bearer ", "");
      if (!token) throw new ErrorApp("No autenticado", 401);
      const data = await ServicioDashboard.instalarSPs(token);
      res.json(data);
    } catch (e) {
      next(new ErrorApp(e.message, e.codigo || 401));
    }
  }

  static async reporteReservas(req, res, next) {
    try {
      const token = (req.headers.authorization || "").replace("Bearer ", "");
      if (!token) throw new ErrorApp("No autenticado", 401);
      const params = {
        fecha_inicio: req.query.fecha_inicio || "",
        fecha_fin: req.query.fecha_fin || "",
        salon_id: req.query.salon_id || "",
        usuario_id: req.query.usuario_id || "",
      };
      const data = await ServicioDashboard.generarReporte(params, token);
      res.json(data);
    } catch (e) {
      next(new ErrorApp(e.message, e.codigo || 400));
    }
  }
}
