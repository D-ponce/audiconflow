const mongoose = require('mongoose');
const CrossResult = require('./backend/models/CrossResult');

// Conectar a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/audiconflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testCrossResultSave() {
  try {
    console.log('🔍 Probando guardado de resultado de cruce...');
    
    // Datos de prueba
    const testData = {
      auditId: 'TEST_AUDIT_001',
      crossId: `CROSS_TEST_${Date.now()}`,
      keyField: 'RUT',
      resultField: 'Tipo de Cuenta',
      processedFiles: [
        {
          filename: 'archivo_test.xlsx',
          originalName: 'archivo_test.xlsx',
          recordCount: 100
        }
      ],
      results: [
        {
          keyValue: '12345678-9',
          resultValue: 'Cuenta Corriente',
          status: 'Coincidencia',
          sourceFiles: ['archivo_test.xlsx']
        },
        {
          keyValue: '98765432-1',
          resultValue: 'Cuenta de Ahorro',
          status: 'Sin coincidencia',
          sourceFiles: ['archivo_test.xlsx']
        }
      ],
      executedBy: 'Test User'
    };

    // Crear nuevo resultado de cruce
    const crossResult = new CrossResult(testData);
    const savedResult = await crossResult.save();
    
    console.log('✅ Resultado de cruce guardado exitosamente:');
    console.log('ID:', savedResult._id);
    console.log('CrossId:', savedResult.crossId);
    console.log('AuditId:', savedResult.auditId);
    console.log('Resultados:', savedResult.results.length);
    
    // Verificar que se puede consultar
    const foundResult = await CrossResult.findOne({ crossId: savedResult.crossId });
    console.log('✅ Resultado encontrado en BD:', foundResult ? 'SÍ' : 'NO');
    
    // Consultar por auditId
    const resultsByAudit = await CrossResult.find({ auditId: testData.auditId });
    console.log('✅ Resultados por auditId:', resultsByAudit.length);
    
    // Limpiar datos de prueba
    await CrossResult.deleteOne({ crossId: savedResult.crossId });
    console.log('✅ Datos de prueba eliminados');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    mongoose.connection.close();
  }
}

testCrossResultSave();
