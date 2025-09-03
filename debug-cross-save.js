// Script para debuggear el guardado de resultados de cruce
import mongoose from 'mongoose';
import CrossResult from './backend/models/CrossResult.js';

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/audiconflow');
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

const testSaveCrossResult = async () => {
  await connectDB();
  
  try {
    console.log('🔍 Probando guardado de CrossResult...');
    
    // Datos de prueba similares a los que envía el frontend
    const testData = {
      auditId: 'TEST_AUDIT_001',
      crossId: `CROSS_TEST_${Date.now()}`,
      keyField: 'RUT',
      resultField: 'Tipo de cuenta',
      processedFiles: [{
        filename: 'test.xlsx',
        originalName: 'test.xlsx',
        recordCount: 2
      }],
      results: [
        {
          keyValue: '12345678-9',
          resultValue: 'Cuenta Corriente',
          status: 'hay coincidencia',
          sourceFiles: ['test.xlsx'],
          metadata: { originalData: {} }
        },
        {
          keyValue: '98765432-1', 
          resultValue: 'N/A',
          status: 'no hay coincidencia',
          sourceFiles: ['test.xlsx'],
          metadata: { originalData: {} }
        }
      ],
      executionDetails: {
        executedBy: 'Test User',
        startTime: new Date()
      },
      status: 'Completado'
    };

    console.log('📝 Creando CrossResult con datos:', {
      auditId: testData.auditId,
      crossId: testData.crossId,
      resultCount: testData.results.length
    });

    const crossResult = new CrossResult(testData);
    
    // Calcular tiempo de finalización
    crossResult.executionDetails.endTime = new Date();
    crossResult.executionDetails.duration = 
      crossResult.executionDetails.endTime - crossResult.executionDetails.startTime;

    console.log('💾 Guardando en base de datos...');
    const savedResult = await crossResult.save();
    
    console.log('✅ CrossResult guardado exitosamente:');
    console.log('- ID:', savedResult._id);
    console.log('- CrossId:', savedResult.crossId);
    console.log('- AuditId:', savedResult.auditId);
    console.log('- Resultados:', savedResult.results.length);
    console.log('- Summary:', savedResult.summary);
    
    // Verificar que se puede consultar
    console.log('🔍 Verificando consulta por crossId...');
    const foundByCrossId = await CrossResult.findOne({ crossId: savedResult.crossId });
    console.log('- Encontrado por crossId:', foundByCrossId ? '✅ SÍ' : '❌ NO');
    
    console.log('🔍 Verificando consulta por auditId...');
    const foundByAuditId = await CrossResult.find({ auditId: testData.auditId });
    console.log('- Encontrados por auditId:', foundByAuditId.length);
    
    // Listar todos los CrossResults
    console.log('🔍 Listando todos los CrossResults...');
    const allResults = await CrossResult.find({});
    console.log('- Total en BD:', allResults.length);
    
    // Limpiar datos de prueba
    await CrossResult.deleteOne({ crossId: savedResult.crossId });
    console.log('🧹 Datos de prueba eliminados');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
};

testSaveCrossResult();
