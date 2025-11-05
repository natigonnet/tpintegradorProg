import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { crearConexion } from './src/config/conexion.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RUTA_SQL = path.join(__dirname, 'src', 'sql', 'SP_reservas.sql');

async function instalarProcedimientos() {
  let conexion = null;
  
  try {
    console.log('🔌 Conectando a la base de datos...');
    conexion = await crearConexion();
    console.log('✅ Conexión establecida\n');

    console.log('📖 Leyendo archivo SQL...');
    let contenido = await fs.readFile(RUTA_SQL, { encoding: 'utf8' });
    console.log('✅ Archivo leído\n');

    // Preprocesar: remover líneas DELIMITER
    contenido = contenido.replace(/DELIMITER\s+\$\$/gi, '');
    contenido = contenido.replace(/DELIMITER\s+;/gi, '');
    contenido = contenido.replace(/\$\$/g, ';');

    // Eliminar cláusulas DEFINER
    contenido = contenido.replace(/CREATE\s+DEFINER=`[^`]+`@`[^`]+`\s+/gi, 'CREATE ');
    contenido = contenido.replace(/DEFINER=`[^`]+`@`[^`]+`/gi, '');

    // Dividir el contenido en procedimientos individuales
    const procedimientos = contenido.split(/(?=CREATE\s+PROCEDURE)/gi).filter(p => p.trim());
    const procedimientosInstalados = [];
    const procedimientosExistentes = [];
    const errores = [];

    console.log(`📦 Encontrados ${procedimientos.length} procedimiento(s) para instalar\n`);

    for (const procedimiento of procedimientos) {
      // Extraer el nombre del procedimiento
      const matchNombre = procedimiento.match(/CREATE\s+PROCEDURE\s+`?([a-zA-Z_][a-zA-Z0-9_]*)`?/i);
      if (matchNombre) {
        const nombreProcedimiento = matchNombre[1];
        console.log(`📝 Procesando: ${nombreProcedimiento}...`);
        
        try {
          // Primero intentar eliminar el procedimiento si existe (para actualizarlo)
          try {
            await conexion.query(`DROP PROCEDURE IF EXISTS \`${nombreProcedimiento}\``);
            console.log(`   └─ Procedimiento anterior eliminado`);
          } catch (dropError) {
            // Si falla el DROP, continuamos igual (puede que no tenga permisos o no exista)
            console.warn(`   └─ ⚠️  No se pudo eliminar el procedimiento anterior: ${dropError.message}`);
          }
          
          // Intentar ejecutar el CREATE PROCEDURE
          await conexion.query(procedimiento.trim());
          procedimientosInstalados.push(nombreProcedimiento);
          console.log(`   └─ ✅ Instalado correctamente\n`);
        } catch (errorProcedimiento) {
          // Si el error es que ya existe, intentamos eliminarlo y recrearlo
          if (errorProcedimiento.message && errorProcedimiento.message.includes('already exists')) {
            try {
              console.log(`   └─ 🔄 Procedimiento ya existe, intentando actualizar...`);
              // Intentar eliminar y recrear
              await conexion.query(`DROP PROCEDURE IF EXISTS \`${nombreProcedimiento}\``);
              await conexion.query(procedimiento.trim());
              procedimientosInstalados.push(nombreProcedimiento);
              console.log(`   └─ ✅ Actualizado correctamente\n`);
            } catch (updateError) {
              // Si no podemos actualizar, lo marcamos como existente
              procedimientosExistentes.push(nombreProcedimiento);
              errores.push({ nombre: nombreProcedimiento, error: updateError.message });
              console.error(`   └─ ❌ Error al actualizar: ${updateError.message}\n`);
            }
          } else {
            // Si es otro error, lo registramos
            errores.push({ nombre: nombreProcedimiento, error: errorProcedimiento.message });
            console.error(`   └─ ❌ Error: ${errorProcedimiento.message}\n`);
          }
        }
      }
    }

    // Resumen
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE INSTALACIÓN');
    console.log('='.repeat(50));
    
    if (procedimientosInstalados.length > 0) {
      console.log(`\n✅ Procedimientos instalados/actualizados (${procedimientosInstalados.length}):`);
      procedimientosInstalados.forEach(p => console.log(`   - ${p}`));
    }
    
    if (procedimientosExistentes.length > 0) {
      console.log(`\n⚠️  Procedimientos que ya existían (${procedimientosExistentes.length}):`);
      procedimientosExistentes.forEach(p => console.log(`   - ${p}`));
    }
    
    if (errores.length > 0) {
      console.log(`\n❌ Errores (${errores.length}):`);
      errores.forEach(e => console.log(`   - ${e.nombre}: ${e.error}`));
    }

    if (errores.length === 0 && procedimientosInstalados.length > 0) {
      console.log('\n🎉 ¡Instalación completada exitosamente!');
    } else if (errores.length > 0) {
      console.log('\n⚠️  Instalación completada con errores. Revisa los mensajes arriba.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Error fatal durante la instalación:');
    console.error(error.message);
    process.exit(1);
  } finally {
    if (conexion) {
      await conexion.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

instalarProcedimientos();

