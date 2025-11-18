export default function manejadorErrores(err, _req, res, _next) {
    const estado = err.codigo || 500;
    const payload = {
      mensaje: err.message || "Error interno del servidor",
    };
    if (err.detalles) payload.detalles = err.detalles;
    res.status(estado).json(payload);
  }
  