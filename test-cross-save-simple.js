// Test simple para verificar guardado de CrossResult
const mongoose = require('mongoose');

// Schema simplificado para prueba
const crossResultSchema = new mongoose.Schema({
  auditId: { type: String, required: true },
  crossId: { type: String, required: true, unique: true },
  keyField: { type: String, required: true },
  resultField: { type: String, required: true },
  results: [{
    keyValue: String,
    resultValue: String,
    status: { type: String, enum: ['hay coincidencia', 'no hay coincidencia'] }
  }],
  executedBy: String
}, { timestamps: true });

const CrossResult = mongoose.model('CrossResult', crossResultSchema);

async function testSave() {
  try {
    // Conectar a MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/audiconflow');
    console.log('✅ Conectado a MongoDB');

    // Datos de prueba
    const testData = {
      auditId: 'TEST_001',
      crossId: `CROSS_${Date.now()}`,
      keyField: 'RUT',
      resultField: 'Tipo',
      results: [
        { keyValue: '12345678-9', resultValue: 'Personal', status: 'hay coincidencia' }
      ],
      executedBy: 'Test User'
    };

    console.log('💾 Guardando resultado de cruce...');
    const crossResult = new CrossResult(testData);
    const saved = await crossResult.save();
    
    console.log('✅ Guardado exitoso:', saved.crossId);
    
    // Verificar consulta
    const found = await CrossResult.findOne({ crossId: saved.crossId });
    console.log('🔍 Encontrado:', found ? 'SÍ' : 'NO');
    
    // Consultar por auditId
    const byAudit = await CrossResult.find({ auditId: testData.auditId });
    console.log('📊 Por auditId:', byAudit.length, 'resultados');
    
    // Limpiar
    await CrossResult.deleteOne({ crossId: saved.crossId });
    console.log('🧹 Limpiado');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testSave();
