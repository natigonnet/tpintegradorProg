import { validationResult } from "express-validator";
import ErrorApp from "../utils/ErrorApp.js";

export default function resultadosValidacion(req, _res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return next(new ErrorApp("Datos inválidos", 422, errores.array()));
  }
  next();
}
