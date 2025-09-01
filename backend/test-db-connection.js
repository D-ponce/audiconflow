import mongoose from 'mongoose';

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/audiconflow");
    console.log("✅ Conectado a MongoDB");
    
    // Verificar archivos en GridFS
    const files = await mongoose.connection.db
      .collection("uploads.files")
      .find({})
      .toArray();
    
    console.log(`📁 Archivos en GridFS: ${files.length}`);
    files.forEach(file => {
      console.log(`- ${file.filename} (${file.length} bytes) - auditId: ${file.metadata?.auditId || 'N/A'}`);
    });
    
    // Verificar auditorías
    const audits = await mongoose.connection.db
      .collection("audits")
      .find({})
      .toArray();
    
    console.log(`📋 Auditorías en DB: ${audits.length}`);
    audits.forEach(audit => {
      console.log(`- ${audit.auditId}: ${audit.name} (${audit.status})`);
    });
    
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
  } finally {
    await mongoose.connection.close();
  }
};

testConnection();
