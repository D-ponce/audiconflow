import mongoose from 'mongoose';
import Audit from './models/Audit.js';

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/audiconflow', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB');
    
    // Buscar una auditoría existente
    const audits = await Audit.find().limit(1);
    if (audits.length === 0) {
      console.log('❌ No hay auditorías en la base de datos');
      process.exit(1);
    }
    
    const audit = audits[0];
    console.log('📋 Auditoría encontrada:', audit.auditId);
    console.log('📍 Ubicación actual:', audit.location);
    
    // Intentar actualizar
    const updatedAudit = await Audit.findOneAndUpdate(
      { _id: audit._id },
      { 
        location: 'Ubicación Actualizada - Test',
        description: 'Descripción actualizada desde script de prueba',
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (updatedAudit) {
      console.log('✅ Auditoría actualizada exitosamente');
      console.log('📍 Nueva ubicación:', updatedAudit.location);
      console.log('📝 Nueva descripción:', updatedAudit.description);
    } else {
      console.log('❌ No se pudo actualizar la auditoría');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

connectDB();
