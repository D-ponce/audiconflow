import mongoose from 'mongoose';
import CrossResult from './backend/models/CrossResult.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/audiconflow';

async function testCrossResults() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conexión exitosa a MongoDB');

    // 1. Verificar si existen documentos CrossResult
    console.log('\n📊 Verificando documentos CrossResult existentes...');
    const totalCount = await CrossResult.countDocuments();
    console.log(`📋 Total de documentos CrossResult: ${totalCount}`);

    if (totalCount > 0) {
      // Mostrar algunos ejemplos
      const samples = await CrossResult.find().limit(3).sort({ createdAt: -1 });
      console.log('\n📄 Ejemplos de documentos encontrados:');
      samples.forEach((doc, index) => {
        console.log(`\n${index + 1}. CrossResult ID: ${doc._id}`);
        console.log(`   - auditId: ${doc.auditId}`);
        console.log(`   - crossId: ${doc.crossId}`);
        console.log(`   - keyField: ${doc.keyField}`);
        console.log(`   - resultField: ${doc.resultField}`);
        console.log(`   - status: ${doc.status}`);
        console.log(`   - createdAt: ${doc.createdAt}`);
        console.log(`   - results count: ${doc.results?.length || 0}`);
      });

      // Probar búsqueda por auditId específico
      console.log('\n🔍 Probando búsquedas por auditId...');
      const uniqueAuditIds = await CrossResult.distinct('auditId');
      console.log(`📋 AuditIds únicos encontrados: ${uniqueAuditIds.length}`);
      console.log('   AuditIds:', uniqueAuditIds);

      if (uniqueAuditIds.length > 0) {
        const testAuditId = uniqueAuditIds[0];
        console.log(`\n🎯 Probando búsqueda con auditId: ${testAuditId}`);
        
        const searchQuery = {
          $or: [
            { auditId: testAuditId },
            { auditId: { $regex: testAuditId, $options: 'i' } },
            { 'executionDetails.auditId': testAuditId }
          ]
        };
        
        console.log('🔎 Query de búsqueda:', JSON.stringify(searchQuery, null, 2));
        
        const results = await CrossResult.find(searchQuery);
        console.log(`✅ Resultados encontrados: ${results.length}`);
        
        if (results.length > 0) {
          console.log('📋 Primer resultado:');
          const first = results[0];
          console.log(`   - _id: ${first._id}`);
          console.log(`   - auditId: ${first.auditId}`);
          console.log(`   - crossId: ${first.crossId}`);
          console.log(`   - summary:`, first.summary);
        }
      }
    } else {
      console.log('⚠️ No se encontraron documentos CrossResult en la base de datos');
      console.log('💡 Esto podría explicar por qué la página está vacía');
    }

    // 2. Verificar estructura de la colección
    console.log('\n🏗️ Verificando estructura de la colección...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const crossResultCollection = collections.find(c => c.name === 'crossresults');
    
    if (crossResultCollection) {
      console.log('✅ Colección "crossresults" existe');
    } else {
      console.log('❌ Colección "crossresults" no existe');
      console.log('📋 Colecciones disponibles:', collections.map(c => c.name));
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    console.error('🔍 Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar la prueba
testCrossResults().catch(console.error);
