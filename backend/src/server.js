import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS: permite frontend local
app.use(cors({
  origin: process.env.CLIENT_URL || '*'
}));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/events", eventsRoutes);

// Health
app.get("/api/health", (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'dev' }));

// Error handler (al final)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`CESL backend corriendo en http://localhost:${PORT}`);
});
