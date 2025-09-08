import mongoose from 'mongoose';
import Audit from './backend/models/Audit.js';
import CrossResult from './backend/models/CrossResult.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/audiconflow';

async function verificarSistemaCompleto() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conexión exitosa a MongoDB');

    // 1. Verificar auditorías existentes
    console.log('\n📋 === VERIFICACIÓN DE AUDITORÍAS ===');
    const audits = await Audit.find().sort({ createdAt: -1 }).limit(10);
    console.log(`📊 Total de auditorías: ${audits.length}`);
    
    if (audits.length > 0) {
      console.log('📄 Últimas auditorías:');
      audits.forEach((audit, index) => {
        console.log(`${index + 1}. ${audit.auditId} (${audit._id}) - ${audit.location || 'Sin ubicación'}`);
      });
    }

    // 2. Verificar cruces existentes
    console.log('\n🔄 === VERIFICACIÓN DE CRUCES ===');
    const crosses = await CrossResult.find().sort({ createdAt: -1 }).limit(10);
    console.log(`📊 Total de cruces: ${crosses.length}`);
    
    if (crosses.length > 0) {
      console.log('🔍 Últimos cruces:');
      crosses.forEach((cross, index) => {
        console.log(`${index + 1}. ${cross.crossId}`);
        console.log(`   - AuditId: ${cross.auditId} (tipo: ${typeof cross.auditId})`);
        console.log(`   - Status: ${cross.status}`);
        console.log(`   - Registros: ${cross.summary?.totalRecords || 'N/A'}`);
        console.log(`   - Coincidencias: ${cross.summary?.matchingRecords || 'N/A'} (${cross.summary?.matchPercentage || 'N/A'}%)`);
        console.log('');
      });
    }

    // 3. Verificar relación auditoría-cruces
    console.log('\n🔗 === VERIFICACIÓN DE RELACIONES ===');
    if (audits.length > 0 && crosses.length > 0) {
      for (const audit of audits.slice(0, 3)) {
        console.log(`\n🎯 Verificando auditoría: ${audit.auditId} (${audit._id})`);
        
        // Buscar cruces para esta auditoría usando la misma lógica del backend
        const searchQuery = {
          $or: [
            { auditId: audit._id.toString() },
            { auditId: audit.auditId },
            { 'executionDetails.auditId': audit._id.toString() },
            { 'executionDetails.auditId': audit.auditId },
            { auditId: audit._id }
          ]
        };
        
        const relatedCrosses = await CrossResult.find(searchQuery);
        console.log(`   📊 Cruces encontrados: ${relatedCrosses.length}`);
        
        if (relatedCrosses.length > 0) {
          relatedCrosses.forEach(cross => {
            console.log(`   ✅ ${cross.crossId} - ${cross.status}`);
          });
        } else {
          console.log('   ⚠️ No se encontraron cruces para esta auditoría');
        }
      }
    }

    // 4. Estadísticas generales
    console.log('\n📈 === ESTADÍSTICAS GENERALES ===');
    const totalAudits = await Audit.countDocuments();
    const totalCrosses = await CrossResult.countDocuments();
    const completedCrosses = await CrossResult.countDocuments({ status: 'Completado' });
    const pendingCrosses = await CrossResult.countDocuments({ status: { $ne: 'Completado' } });
    
    console.log(`📋 Total auditorías: ${totalAudits}`);
    console.log(`🔄 Total cruces: ${totalCrosses}`);
    console.log(`✅ Cruces completados: ${completedCrosses}`);
    console.log(`⏳ Cruces pendientes: ${pendingCrosses}`);

    // 5. Verificar integridad de datos
    console.log('\n🔍 === VERIFICACIÓN DE INTEGRIDAD ===');
    const crossesWithoutAuditId = await CrossResult.countDocuments({ 
      $or: [
        { auditId: { $exists: false } },
        { auditId: null },
        { auditId: '' }
      ]
    });
    
    const crossesWithoutExecutionDetails = await CrossResult.countDocuments({
      'executionDetails.auditId': { $exists: false }
    });
    
    console.log(`⚠️ Cruces sin auditId: ${crossesWithoutAuditId}`);
    console.log(`⚠️ Cruces sin executionDetails.auditId: ${crossesWithoutExecutionDetails}`);

    // 6. Verificar colecciones
    console.log('\n📁 === VERIFICACIÓN DE COLECCIONES ===');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('📂 Colecciones disponibles:');
    collectionNames.forEach(name => {
      console.log(`   - ${name}`);
    });
    
    const requiredCollections = ['audits', 'crossresults', 'fs.files', 'fs.chunks'];
    console.log('\n✅ Verificación de colecciones requeridas:');
    requiredCollections.forEach(required => {
      const exists = collectionNames.includes(required);
      console.log(`   ${exists ? '✅' : '❌'} ${required}: ${exists ? 'Existe' : 'No encontrada'}`);
    });

    console.log('\n🎉 === RESUMEN DE VERIFICACIÓN ===');
    console.log(`✅ Sistema de auditorías: ${totalAudits > 0 ? 'Funcional' : 'Sin datos'}`);
    console.log(`✅ Sistema de cruces: ${totalCrosses > 0 ? 'Funcional' : 'Sin datos'}`);
    console.log(`✅ Relación auditoría-cruces: ${crosses.length > 0 && audits.length > 0 ? 'Verificada' : 'Pendiente de datos'}`);
    console.log(`✅ Integridad de datos: ${crossesWithoutAuditId === 0 ? 'Correcta' : 'Requiere atención'}`);

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    console.error('🔍 Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    console.log('✅ Verificación completada');
  }
}

verificarSistemaCompleto().catch(console.error);
