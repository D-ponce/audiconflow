import mongoose from 'mongoose';
import CrossResult from './backend/models/CrossResult.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/audiconflow';

async function debugCrossSave() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conexión exitosa a MongoDB');

    // Buscar todos los CrossResults
    console.log('\n📊 Buscando todos los CrossResults...');
    const allCrossResults = await CrossResult.find().sort({ createdAt: -1 });
    console.log(`📋 Total de CrossResults encontrados: ${allCrossResults.length}`);

    if (allCrossResults.length > 0) {
      console.log('\n📄 Últimos 3 CrossResults:');
      allCrossResults.slice(0, 3).forEach((result, index) => {
        console.log(`\n${index + 1}. CrossResult:`);
        console.log(`   - _id: ${result._id}`);
        console.log(`   - auditId: ${result.auditId}`);
        console.log(`   - crossId: ${result.crossId}`);
        console.log(`   - keyField: ${result.keyField}`);
        console.log(`   - resultField: ${result.resultField}`);
        console.log(`   - status: ${result.status}`);
        console.log(`   - createdAt: ${result.createdAt}`);
        console.log(`   - results count: ${result.results?.length || 0}`);
        console.log(`   - summary:`, result.summary);
      });

      // Buscar por auditIds específicos
      console.log('\n🔍 Auditores únicos encontrados:');
      const uniqueAuditIds = await CrossResult.distinct('auditId');
      uniqueAuditIds.forEach(auditId => {
        console.log(`   - ${auditId}`);
      });

      // Probar búsqueda con el último auditId
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
        
        const foundResults = await CrossResult.find(searchQuery);
        console.log(`✅ Resultados encontrados con query: ${foundResults.length}`);
      }
    } else {
      console.log('⚠️ No se encontraron CrossResults en la base de datos');
    }

    // Crear un CrossResult de prueba
    console.log('\n🧪 Creando CrossResult de prueba...');
    const testCrossResult = new CrossResult({
      auditId: 'AUD-TEST123',
      crossId: `CROSS_TEST_${Date.now()}`,
      keyField: 'RUT',
      resultField: 'Tipo',
      processedFiles: [{
        filename: 'test.xlsx',
        originalName: 'test.xlsx',
        recordCount: 10,
        uploadDate: new Date()
      }],
      results: [
        {
          keyValue: '12345678-9',
          resultValue: 'Personal',
          status: 'hay coincidencia',
          sourceFiles: ['test.xlsx'],
          matched: true
        }
      ],
      summary: {
        totalRecords: 1,
        matchingRecords: 1,
        matchPercentage: 100
      },
      executionDetails: {
        executedBy: 'Test User',
        startTime: new Date(),
        endTime: new Date(),
        duration: 1000
      },
      status: 'Completado'
    });

    const savedTest = await testCrossResult.save();
    console.log(`✅ CrossResult de prueba guardado con ID: ${savedTest._id}`);

    // Verificar que se puede buscar
    const foundTest = await CrossResult.findOne({ auditId: 'AUD-TEST123' });
    console.log(`🔍 CrossResult de prueba encontrado: ${foundTest ? 'SÍ' : 'NO'}`);

    // Limpiar el test
    await CrossResult.deleteOne({ _id: savedTest._id });
    console.log('🧹 CrossResult de prueba eliminado');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

debugCrossSave().catch(console.error);
