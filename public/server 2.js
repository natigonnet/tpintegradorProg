import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import rutaDashboard from "./src/rutas/rutaDashboard.js";
import manejadorErrores from "./src/middlewares/manejadorErrores.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares base
app.use(express.json());

// Archivos estáticos (CSS/JS del dashboard)
app.use("/public", express.static(path.join(__dirname, "public")));

// Ruta de solo plantilla (sirve /utiles/dashboard.html)
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "utiles", "dashboard.html"));
});

// Rutas del servicio del dashboard
app.use("/servicios/dashboard", rutaDashboard);

// Manejador de errores central
app.use(manejadorErrores);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
  console.log(`Dashboard:       http://localhost:${PORT}/dashboard`);
});
