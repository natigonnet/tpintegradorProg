import express from 'express';
import dotenv from 'dotenv';
import swaggerUI from 'swagger-ui-express';
import specs from './docs/swagger.js';
import { router as v1SalonesRutas } from './v1/rutas/salonesRutas.js';
import { router as v1AdminRutas } from './v1/rutas/adminRutas.js';
import { router as dashboardRutas } from './v1/rutas/dashboardRutas.js';
import { manejadorErrores, rutaNoEncontrada } from './middleware/manejadorErrores.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config(); // Cargamos las variables de entorno


const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/docs', swaggerUI.serve, swaggerUI.setup(specs));
// Le definimos la ruta /docs
// swaggerUI.serve -> Retorna un handler para manejar los archivos documentados
// swaggerUI.setup -> Le pasamos un archivo, o un objeto de configuración para el handler

// Ruta para el dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/utiles/dashboard.html'));
});

app.use('/api/v1/salones', v1SalonesRutas);
app.use('/api/v1/admin', v1AdminRutas);
app.use('/servicios/dashboard', dashboardRutas);

app.use(rutaNoEncontrada); // Middleware para rutas no encontradas


app.use(manejadorErrores); // Middleware centralizado para manejo de errores

app.listen(process.env.PUERTO, () => {
    console.log(`Servidor arriba en http://localhost:${process.env.PUERTO}/`);
})