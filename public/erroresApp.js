export default class ErrorApp extends Error {
    constructor(mensaje, codigo = 400, detalles = null) {
      super(mensaje);
      this.name = "ErrorApp";
      this.codigo = codigo;
      this.detalles = detalles;
    }
  }
  