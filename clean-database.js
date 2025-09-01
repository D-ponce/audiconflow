// Script para limpiar auditorías duplicadas en MongoDB
import mongoose from 'mongoose';

// Conectar a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/audiconflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema de auditoría
const auditSchema = new mongoose.Schema({
  auditId: String,
  name: String,
  type: String,
  location: String,
  priority: String,
  dueDate: Date,
  auditor: String,
  description: String,
  status: String,
  createdBy: String,
  completionPercentage: { type: Number, default: 0 },
  estimatedHours: { type: Number, default: 0 },
  actualHours: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Audit = mongoose.model('Audit', auditSchema);

async function cleanDatabase() {
  try {
    console.log('🧹 Limpiando base de datos de auditorías...\n');
    
    // Mostrar todas las auditorías actuales
    const allAudits = await Audit.find().sort({ createdAt: 1 });
    console.log(`📊 Total de auditorías encontradas: ${allAudits.length}\n`);
    
    console.log('📋 Lista de auditorías:');
    console.log('='.repeat(80));
    
    allAudits.forEach((audit, index) => {
      console.log(`${index + 1}. ID: ${audit.auditId || 'Sin ID'}`);
      console.log(`   Nombre: ${audit.name || 'Sin nombre'}`);
      console.log(`   Tipo: ${audit.type || 'Sin tipo'}`);
      console.log(`   Ubicación: ${audit.location || 'Sin ubicación'}`);
      console.log(`   Auditor: ${audit.auditor || 'Sin auditor'}`);
      console.log(`   Creado por: ${audit.createdBy || 'Sin creador'}`);
      console.log(`   Fecha: ${audit.createdAt}`);
      console.log(`   MongoDB ID: ${audit._id}`);
      console.log('');
    });
    
    // Preguntar qué hacer
    console.log('🤔 ¿Qué quieres hacer?');
    console.log('1. Eliminar TODAS las auditorías');
    console.log('2. Mantener solo la más reciente');
    console.log('3. Mantener solo las que tienen auditId válido');
    console.log('4. Solo mostrar información (no eliminar nada)');
    console.log('\n⚠️  CUIDADO: Esta operación no se puede deshacer');
    
    // Para automatizar, vamos a mantener solo las que tienen datos completos
    const validAudits = allAudits.filter(audit => 
      audit.auditId && 
      audit.name && 
      audit.type && 
      audit.location && 
      audit.auditor
    );
    
    console.log(`\n✅ Auditorías válidas encontradas: ${validAudits.length}`);
    
    if (validAudits.length > 0) {
      console.log('\n📝 Auditorías válidas:');
      validAudits.forEach((audit, index) => {
        console.log(`${index + 1}. ${audit.auditId} - ${audit.name}`);
      });
    }
    
    const invalidAudits = allAudits.filter(audit => 
      !audit.auditId || 
      !audit.name || 
      !audit.type || 
      !audit.location || 
      !audit.auditor
    );
    
    console.log(`\n❌ Auditorías inválidas/incompletas: ${invalidAudits.length}`);
    
    if (invalidAudits.length > 0) {
      console.log('\n🗑️  Se eliminarán las siguientes auditorías inválidas:');
      invalidAudits.forEach((audit, index) => {
        console.log(`${index + 1}. ID: ${audit._id} - ${audit.name || 'Sin nombre'}`);
      });
      
      // Eliminar auditorías inválidas
      const deleteResult = await Audit.deleteMany({
        _id: { $in: invalidAudits.map(a => a._id) }
      });
      
      console.log(`\n✅ Eliminadas ${deleteResult.deletedCount} auditorías inválidas`);
    }
    
    // Verificar resultado final
    const finalCount = await Audit.countDocuments();
    console.log(`\n📊 Total de auditorías después de la limpieza: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Limpieza completada');
  }
}

cleanDatabase();
