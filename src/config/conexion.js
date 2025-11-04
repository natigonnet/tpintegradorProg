import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Creamos la conexion a la bdd
export const crearConexion = async() => { 

    try{
    return await mysql.createConnection({ // Exportamos la conexion para poder utilizarla en otro archivo js(en una ruta que necesite acceder a algún recurso de la bdd)
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    multipleStatements: true // necesario para ejecutar varios statements (p. ej. crear procedimientos)
});
    } catch(err){
         console.error('Error al crear la conexión:', err);
    throw err;
    }
}

export const conexion = await crearConexion();