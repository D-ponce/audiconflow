// Script para eliminar todas las auditorías usando el modelo del backend
import mongoose from 'mongoose';
import Audit from './models/Audit.js';

// Conectar a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/audiconflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function cleanAudits() {
  try {
    console.log('🗑️  Limpiando auditorías...\n');
    
    // Contar auditorías antes
    const countBefore = await Audit.countDocuments();
    console.log(`📊 Auditorías encontradas: ${countBefore}`);
    
    if (countBefore === 0) {
      console.log('✅ No hay auditorías para eliminar');
      return;
    }
    
    // Mostrar algunas auditorías antes de eliminar
    const sampleAudits = await Audit.find().limit(5);
    console.log('\n📋 Muestra de auditorías a eliminar:');
    sampleAudits.forEach((audit, i) => {
      console.log(`${i+1}. ${audit.auditId || 'Sin ID'} - ${audit.name || 'Sin nombre'}`);
    });
    
    // Eliminar todas
    const deleteResult = await Audit.deleteMany({});
    console.log(`\n✅ Eliminadas ${deleteResult.deletedCount} auditorías`);
    
    // Verificar
    const countAfter = await Audit.countDocuments();
    console.log(`📊 Auditorías restantes: ${countAfter}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Limpieza completada');
  }
}

cleanAudits();
