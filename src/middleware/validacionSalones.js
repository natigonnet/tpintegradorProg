import { body, param, validationResult } from "express-validator";
import { ErrorValidacion } from "../errores/ErrorApp.js";

// Middleware para manejar resultados de validación
export const manejarResultadosValidacion = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const detalles = errors.array().map((error) => ({
      campo: error.path,
      mensaje: error.msg,
      valor: error.value,
    }));
    throw new ErrorValidacion(detalles);
  }
  next();
};

// Validaciones para crear salón
export const validarCrearSalon = [
  body("titulo")
    .notEmpty()
    .withMessage("El título es requerido")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("El título debe tener entre 2 y 100 caracteres")
    .escape(),

  body("direccion")
    .notEmpty()
    .withMessage("La dirección es requerida")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("La dirección debe tener entre 5 y 200 caracteres")
    .escape(),

  body("capacidad")
    .isInt({ min: 1 })
    .withMessage("La capacidad debe ser un número entero mayor a 0")
    .toInt(),

  body("importe")
    .isFloat({ min: 1 })
    .withMessage("El importe debe ser un número mayor a 0")
    .toFloat(),

  manejarResultadosValidacion,
];

// Validaciones para actualizar salón
export const validarActualizarSalon = [
  param("id").isInt({ min: 1 }).withMessage("ID inválido").toInt(),

  body("titulo")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("El título debe tener entre 2 y 100 caracteres")
    .escape(),

  body("direccion")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("La dirección debe tener entre 5 y 200 caracteres")
    .escape(),

  body("capacidad")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La capacidad debe ser un número entero mayor a 0")
    .toInt(),

  body("importe")
    .optional()
    .isFloat({ min: 1 })
    .withMessage("El importe debe ser un número mayor a 0")
    .toFloat(),

  // Validamos que al menos un campo sea proporcionado
  body().custom((value, { req }) => {
    const camposPermitidos = [
      "titulo",
      "direccion",
      "capacidad",
      "importe"
    ];
    const camposProporcionados = Object.keys(req.body);

    const hayCamposValidos = camposPermitidos.some(
      (campo) =>
        camposProporcionados.includes(campo) &&
        req.body[campo] !== undefined &&
        req.body[campo] !== null &&
        req.body[campo] !== ""
    );

    if (!hayCamposValidos) {
      throw new Error(
        "Debe proporcionar al menos un campo válido para actualizar"
      );
    }

    return true;
  }),

  manejarResultadosValidacion,
];

// Validaciones para operaciones con ID
export const validarId = [
  param("id").isInt({ min: 1 }).withMessage("ID inválido").toInt(),

  manejarResultadosValidacion,
];
