import Salones from "../db/salones.js";

export class SalonesServicio {
  constructor() {
    this.salones = new Salones();
  }
  async obtenerTodos() {
    return this.salones.obtenerTodos();
  }
  async obtenerPorId(id){
    return this.salones.obtenerPorId(id);
  }
  async crear(datos){
    return this.salones.crear(datos);
  }
  async actualizar(id, datos){
    return this.salones.actualizar(id, datos);
  }
  async eliminar(id){
    return this.salones.eliminar(id);
  }
}
