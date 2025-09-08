import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js";
import userRoutes from "./routes/users.js";
import auditRoutes from "./routes/audits.js";
import fileRoutes from "./routes/files.js";
import crossResultsRoutes from "./routes/crossResults.js";
import reportsRoutes from "./routes/reports.js";
import fileUploadHistoryRoutes from "./routes/fileUploadHistory.js";
import migrateRoutes from "./routes/migrate.js";
import auditActionLogsRoutes from "./routes/auditActionLogs.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB con reintentos
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/audiconflow", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado a MongoDB");
  } catch (err) {
    console.error("❌ Error al conectar a MongoDB:", err.message);
    console.log("🔄 Reintentando conexión en 5 segundos...");
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Rutas de autenticación
app.use("/api", authRoutes);

// Rutas de subida de archivos
app.use("/api", uploadRoutes);

// Rutas de gestión de usuarios
app.use("/api", userRoutes);

// Rutas de auditorías
app.use("/api/audits", auditRoutes);

// Rutas de archivos
app.use("/api/files", fileRoutes);

// Rutas de resultados de cruce
app.use("/api/cross-results", crossResultsRoutes);

// Rutas de reportes
app.use("/api/reports", reportsRoutes);

// Rutas de historial de carga de archivos
app.use("/api/file-history", fileUploadHistoryRoutes);

// Rutas de migración
app.use("/api/migrate", migrateRoutes);

// Rutas de historial de acciones de auditoría
app.use("/api/audit-logs", auditActionLogsRoutes);

const PORT = process.env.PORT || 5000;

// Manejar error de puerto en uso
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 API de auditorías disponible en: http://localhost:${PORT}/api/audits`);
  console.log(`📁 API de archivos disponible en: http://localhost:${PORT}/api/files`);
  console.log(`🔗 Endpoints principales:`);
  console.log(`   POST /api/audits/create - Crear auditoría`);
  console.log(`   GET  /api/audits - Listar auditorías`);
  console.log(`   GET  /api/audits/stats/summary - Estadísticas`);
  console.log(`   GET  /api/files - Listar archivos`);
  console.log(`   GET  /api/files/audit/:auditId - Archivos por auditoría`);
  console.log(`   POST /api/cross-results - Guardar resultado de cruce`);
  console.log(`   GET  /api/cross-results/:auditId - Resultados por auditoría`);
  console.log(`   GET  /api/reports - Listar reportes guardados`);
  console.log(`   POST /api/reports/from-cross-result - Crear reporte desde cruce`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Puerto ${PORT} ya está en uso`);
    console.log(`🔄 Intentando con puerto ${PORT + 1}...`);
    server.listen(PORT + 1, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT + 1}`);
    });
  } else {
    console.error('❌ Error del servidor:', err);
  }
});
