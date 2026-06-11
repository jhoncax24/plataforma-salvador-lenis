import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import perfilRoutes from "./routes/perfil.routes.js";
import estudiantesRoutes from './routes/estudiantes.routes.js';
import docentesRoutes from './routes/docentes.routes.js';
import './services/cronJobs.js';

// Carga las variables de entorno locales (Render usará las suyas propias)
dotenv.config();

const app = express();

// Render asignará un puerto automáticamente, si no hay, usa el 4000
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configurado para producción
app.use(cors({
  origin: process.env.CLIENT_URL || '*'
}));

// Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/perfil", perfilRoutes);
app.use("/api/estudiantes", estudiantesRoutes);
app.use("/api/docentes", docentesRoutes);

// Endpoint de salud (Muy útil para que Render verifique si tu app encendió bien)
app.get("/api/health", (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'dev' }));

// Error handler (siempre debe ir al final de las rutas)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 CESL backend en línea y escuchando en el puerto ${PORT}`);
});