// Script para probar la creación de auditorías directamente
const testAuditCreation = async () => {
  try {
    console.log('🧪 Probando creación de auditoría...');
    
    const auditData = {
      name: 'Auditoría de Prueba',
      type: 'Inventario',
      location: 'Sucursal Test',
      priority: 'Media',
      dueDate: '2024-12-31',
      auditor: 'Usuario Test',
      description: 'Auditoría creada para probar el sistema'
    };

    const response = await fetch('http://localhost:5000/api/audits/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auditData)
    });

    console.log('📡 Response status:', response.status);
    
    const data = await response.json();
    console.log('📋 Response data:', data);

    if (data.success) {
      console.log('✅ Auditoría creada exitosamente:', data.audit.auditId);
      
      // Probar obtener auditorías
      console.log('\n🔍 Obteniendo lista de auditorías...');
      const listResponse = await fetch('http://localhost:5000/api/audits');
      const listData = await listResponse.json();
      console.log('📝 Auditorías encontradas:', listData.audits?.length || 0);
      
      if (listData.audits?.length > 0) {
        console.log('🎯 Última auditoría:', listData.audits[0].auditId);
      }
    } else {
      console.error('❌ Error:', data.message);
    }

  } catch (error) {
    console.error('💥 Error de conexión:', error.message);
    console.log('💡 Asegúrate de que el servidor esté ejecutándose en http://localhost:5000');
  }
};

// Ejecutar si se llama directamente
if (typeof window === 'undefined') {
  testAuditCreation();
}

// Exportar para uso en browser
if (typeof window !== 'undefined') {
  window.testAuditCreation = testAuditCreation;
}

import mongoose from 'mongoose';
import Audit from './backend/models/Audit.js';
import CrossResult from './backend/models/CrossResult.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/audiconflow';

async function testAuditCreationFlow() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conexión exitosa a MongoDB');

    // 1. Buscar auditorías existentes
    console.log('\n📋 Buscando auditorías existentes...');
    const existingAudits = await Audit.find().sort({ createdAt: -1 }).limit(5);
    console.log(`📊 Auditorías encontradas: ${existingAudits.length}`);

    if (existingAudits.length > 0) {
      console.log('\n📄 Últimas 5 auditorías:');
      existingAudits.forEach((audit, index) => {
        console.log(`${index + 1}. ${audit.auditId} (${audit._id}) - ${audit.location}`);
      });

      // Usar la primera auditoría para probar
      const testAudit = existingAudits[0];
      console.log(`\n🎯 Usando auditoría: ${testAudit.auditId} (ID: ${testAudit._id})`);

      // 2. Buscar cruces existentes para esta auditoría
      console.log('\n🔍 Buscando cruces existentes para esta auditoría...');
      const searchQueries = [
        { auditId: testAudit._id.toString() },
        { auditId: testAudit.auditId },
        { 'executionDetails.auditId': testAudit._id.toString() },
        { 'executionDetails.auditId': testAudit.auditId }
      ];

      for (let i = 0; i < searchQueries.length; i++) {
        const query = searchQueries[i];
        console.log(`\n🔎 Query ${i + 1}:`, JSON.stringify(query));
        const results = await CrossResult.find(query);
        console.log(`   Resultados: ${results.length}`);
        
        if (results.length > 0) {
          results.forEach(result => {
            console.log(`   - ${result.crossId} (auditId: ${result.auditId})`);
          });
        }
      }

      // 3. Crear un cruce de prueba usando el _id de MongoDB
      console.log('\n🧪 Creando cruce de prueba...');
      const testCrossResult = new CrossResult({
        auditId: testAudit._id.toString(), // Usar _id como string
        crossId: `CROSS_TEST_${Date.now()}`,
        keyField: 'RUT',
        resultField: 'Tipo',
        processedFiles: [{
          filename: 'test.xlsx',
          originalName: 'test.xlsx',
          recordCount: 10,
          uploadDate: new Date()
        }],
        results: [{
          keyValue: '12345678-9',
          resultValue: 'Personal',
          status: 'hay coincidencia',
          sourceFiles: ['test.xlsx'],
          matched: true
        }],
        summary: {
          totalRecords: 1,
          matchingRecords: 1,
          matchPercentage: 100
        },
        executionDetails: {
          executedBy: 'Test User',
          startTime: new Date(),
          endTime: new Date(),
          duration: 1000,
          auditId: testAudit._id.toString()
        },
        status: 'Completado'
      });

      const savedCross = await testCrossResult.save();
      console.log(`✅ Cruce de prueba guardado: ${savedCross._id}`);

      // 4. Verificar que se puede encontrar
      console.log('\n✅ Verificando búsqueda...');
      const foundCross = await CrossResult.findOne({ auditId: testAudit._id.toString() });
      console.log(`🔍 Cruce encontrado: ${foundCross ? 'SÍ' : 'NO'}`);

      if (foundCross) {
        console.log(`   - CrossId: ${foundCross.crossId}`);
        console.log(`   - AuditId guardado: ${foundCross.auditId}`);
        console.log(`   - Tipo de auditId: ${typeof foundCross.auditId}`);
      }

      // 5. Limpiar
      await CrossResult.deleteOne({ _id: savedCross._id });
      console.log('🧹 Cruce de prueba eliminado');

    } else {
      console.log('⚠️ No se encontraron auditorías existentes');
    }

    // 6. Mostrar todos los CrossResults existentes
    console.log('\n📊 Todos los CrossResults en la base de datos:');
    const allCrosses = await CrossResult.find().sort({ createdAt: -1 });
    console.log(`Total: ${allCrosses.length}`);
    
    allCrosses.slice(0, 5).forEach((cross, index) => {
      console.log(`${index + 1}. ${cross.crossId}`);
      console.log(`   - auditId: ${cross.auditId} (tipo: ${typeof cross.auditId})`);
      console.log(`   - executionDetails.auditId: ${cross.executionDetails?.auditId}`);
    });

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

testAuditCreationFlow().catch(console.error);
