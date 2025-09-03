import mongoose from 'mongoose';
import Report from './backend/models/Report.js';
import dotenv from 'dotenv';

dotenv.config();

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/audiconflow", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado a MongoDB para prueba");
  } catch (err) {
    console.error("❌ Error al conectar a MongoDB:", err.message);
    process.exit(1);
  }
};

// Función de prueba para crear un reporte
const testReportCreation = async () => {
  try {
    console.log("🧪 Iniciando prueba de creación de reporte...");

    // Datos de prueba
    const testReportData = {
      name: "Reporte de Prueba",
      description: "Este es un reporte de prueba para verificar el guardado en BD",
      category: "Cruce de Datos",
      type: "cross_result",
      auditId: new mongoose.Types.ObjectId(), // ID de auditoría ficticio
      createdBy: "test@example.com",
      format: "PDF",
      size: "1.2 KB",
      shared: false,
      views: 0,
      data: {
        crossResult: [
          { valor: "123", resultado: "hay coincidencia", archivos: ["archivo1.xlsx", "archivo2.xlsx"] },
          { valor: "456", resultado: "no hay coincidencia", archivos: ["archivo1.xlsx"] }
        ],
        summary: {
          totalRecords: 2,
          matchedRecords: 1,
          unmatchedRecords: 1,
          matchPercentage: 50
        }
      },
      metadata: {
        totalRecords: 2,
        matchedRecords: 1,
        unmatchedRecords: 1,
        matchPercentage: 50,
        executionTime: 150,
        fileNames: ["archivo1.xlsx", "archivo2.xlsx"]
      }
    };

    console.log("📝 Creando reporte con datos:", testReportData);

    // Crear el reporte
    const report = new Report(testReportData);
    await report.save();

    console.log("✅ Reporte creado exitosamente con ID:", report._id);

    // Verificar que se guardó
    const savedReport = await Report.findById(report._id);
    if (savedReport) {
      console.log("✅ Reporte verificado en base de datos");
      console.log("📊 Datos guardados:", {
        id: savedReport._id,
        name: savedReport.name,
        category: savedReport.category,
        createdAt: savedReport.createdAt
      });
    } else {
      console.log("❌ Error: Reporte no encontrado después de guardar");
    }

    // Listar todos los reportes
    const allReports = await Report.find({});
    console.log(`📋 Total de reportes en BD: ${allReports.length}`);

    if (allReports.length > 0) {
      console.log("📄 Reportes existentes:");
      allReports.forEach((r, index) => {
        console.log(`  ${index + 1}. ${r.name} (${r.category}) - ${r.createdAt}`);
      });
    }

  } catch (error) {
    console.error("❌ Error en prueba de creación:", error);
    console.error("❌ Stack trace:", error.stack);
  }
};

// Función para limpiar reportes de prueba
const cleanupTestReports = async () => {
  try {
    const result = await Report.deleteMany({ name: { $regex: /prueba/i } });
    console.log(`🧹 Eliminados ${result.deletedCount} reportes de prueba`);
  } catch (error) {
    console.error("❌ Error al limpiar reportes de prueba:", error);
  }
};

// Ejecutar prueba
const runTest = async () => {
  await connectDB();
  
  console.log("🔍 Verificando estado inicial de la colección...");
  const initialCount = await Report.countDocuments();
  console.log(`📊 Reportes existentes antes de la prueba: ${initialCount}`);
  
  await testReportCreation();
  
  console.log("\n🔍 Verificando estado final de la colección...");
  const finalCount = await Report.countDocuments();
  console.log(`📊 Reportes existentes después de la prueba: ${finalCount}`);
  
  // Preguntar si limpiar
  console.log("\n¿Desea limpiar los reportes de prueba? (Ctrl+C para salir sin limpiar)");
  setTimeout(async () => {
    await cleanupTestReports();
    mongoose.connection.close();
    console.log("✅ Prueba completada y conexión cerrada");
  }, 3000);
};

runTest().catch(console.error);
