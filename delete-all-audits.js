// Script para eliminar TODAS las auditorías de MongoDB
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

async function deleteAllAudits() {
  try {
    console.log('🗑️  Eliminando TODAS las auditorías...\n');
    
    // Contar auditorías antes de eliminar
    const countBefore = await Audit.countDocuments();
    console.log(`📊 Auditorías encontradas: ${countBefore}`);
    
    if (countBefore === 0) {
      console.log('✅ No hay auditorías para eliminar');
      return;
    }
    
    // Eliminar todas las auditorías
    const deleteResult = await Audit.deleteMany({});
    
    console.log(`✅ Eliminadas ${deleteResult.deletedCount} auditorías`);
    
    // Verificar que se eliminaron todas
    const countAfter = await Audit.countDocuments();
    console.log(`📊 Auditorías restantes: ${countAfter}`);
    
    if (countAfter === 0) {
      console.log('🎉 Base de datos limpia - Todas las auditorías eliminadas');
    } else {
      console.log(`⚠️  Aún quedan ${countAfter} auditorías`);
    }
    
  } catch (error) {
    console.error('❌ Error al eliminar auditorías:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Operación completada');
  }
}

deleteAllAudits();
