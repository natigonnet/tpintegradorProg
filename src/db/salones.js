import { conexion } from "../config/conexion.js";

export default class Salones {

  // BROWSE - Obtener todos los salones
  async obtenerTodos() {
    const sql = "SELECT * FROM salones WHERE activo = 1";
    const [results] = await conexion.query(sql);
    return results;
  }

  // READ - Obtener un salón por ID
  async obtenerPorId(id){
    const sql = 'SELECT * FROM salones WHERE salon_id = ? AND activo = 1';
    const [results] = await conexion.query(sql, [id]);
    return results[0] || null;
  }

  // EDIT - Actualizar un salón
  async actualizar(id, datos){
    const campos = Object.keys(datos).map(key => `${key} = ?`).join(', ');
    const valores = Object.values(datos);
    valores.push(id);

    const sql = `UPDATE salones SET ${campos} WHERE salon_id = ? AND activo = 1`;
    const [result] = await conexion.query(sql, valores);

    return result.affectedRows > 0;
  }

  // ADD - Crear un nuevo salón
  async crear(datos){
    const campos = Object.keys(datos).join(', ');
    const placeholders = Object.keys(datos).map(() => '?').join(', ');
    const valores = Object.values(datos);

    const sql = `INSERT INTO salones (${campos}) VALUES (${placeholders})`;
    const [result] = await conexion.query(sql, valores);

    return {
      salon_id: result.insertId,
      ...datos
    };
  }

  // DELETE - Eliminar un salón (borrado lógico)
  async eliminar(id){
    const sql = 'UPDATE salones SET activo = 0 WHERE salon_id = ?';
    const [result] = await conexion.query(sql, [id]);

    return result.affectedRows > 0;
  }

}