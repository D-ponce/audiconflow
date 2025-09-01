import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CrossResult from './models/CrossResult.js';
import Audit from './models/Audit.js';

dotenv.config();

const testCrossResults = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/audiconflow');
    console.log('✅ Conectado a MongoDB para pruebas');

    // Limpiar datos de prueba anteriores
    await CrossResult.deleteMany({ crossId: { $regex: /^TEST_/ } });
    console.log('🧹 Datos de prueba anteriores eliminados');

    // Crear auditoría de prueba si no existe
    let testAudit = await Audit.findOne({ auditId: 'TEST_AUDIT_001' });
    if (!testAudit) {
      testAudit = new Audit({
        auditId: 'TEST_AUDIT_001',
        name: 'Auditoría de Prueba - Cruce de Información',
        type: 'Compliance',
        location: 'Oficina Central',
        priority: 'Alta',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        auditor: 'Auditor de Prueba',
        description: 'Auditoría creada para probar funcionalidad de cruce',
        createdBy: 'Sistema de Pruebas'
      });
      await testAudit.save();
      console.log('📋 Auditoría de prueba creada:', testAudit.auditId);
    }

    // Datos de prueba para el cruce
    const testCrossData = {
      auditId: 'TEST_AUDIT_001',
      keyField: 'RUT',
      resultField: 'Tipo de cuenta',
      processedFiles: [
        {
          filename: 'maestro_vigentes.xlsx',
          originalName: 'maestro_vigentes.xlsx',
          recordCount: 10
        },
        {
          filename: 'usuarios_oracle.xlsx',
          originalName: 'usuarios_oracle.xlsx',
          recordCount: 8
        }
      ],
      results: [
        {
          keyValue: '12.345.678',
          resultValue: 'Personal',
          status: 'hay coincidencia',
          sourceFiles: ['maestro_vigentes.xlsx', 'usuarios_oracle.xlsx']
        },
        {
          keyValue: '13.456.789',
          resultValue: 'Personal',
          status: 'hay coincidencia',
          sourceFiles: ['maestro_vigentes.xlsx', 'usuarios_oracle.xlsx']
        },
        {
          keyValue: '15.678.901',
          resultValue: 'Personal',
          status: 'hay coincidencia',
          sourceFiles: ['maestro_vigentes.xlsx']
        },
        {
          keyValue: '17.890.123',
          resultValue: 'N/A',
          status: 'no hay coincidencia',
          sourceFiles: ['usuarios_oracle.xlsx']
        },
        {
          keyValue: '18.901.234',
          resultValue: 'Personal',
          status: 'hay coincidencia',
          sourceFiles: ['maestro_vigentes.xlsx', 'usuarios_oracle.xlsx']
        }
      ],
      executedBy: 'Sistema de Pruebas'
    };

    // Crear resultado de cruce
    const crossResult = new CrossResult({
      ...testCrossData,
      crossId: `TEST_CROSS_${Date.now()}`,
      executionDetails: {
        startTime: new Date(),
        endTime: new Date(),
        duration: 1500, // 1.5 segundos
        executedBy: testCrossData.executedBy
      },
      status: 'Completado'
    });

    await crossResult.save();
    console.log('✅ Resultado de cruce guardado exitosamente');
    console.log('📊 Estadísticas calculadas:', crossResult.summary);
    console.log('🆔 Cross ID:', crossResult.crossId);

    // Probar consultas
    console.log('\n🔍 Probando consultas...');
    
    // Buscar por auditoría
    const resultsByAudit = await CrossResult.find({ auditId: 'TEST_AUDIT_001' });
    console.log(`📋 Resultados encontrados para auditoría: ${resultsByAudit.length}`);

    // Buscar por crossId
    const specificResult = await CrossResult.findOne({ crossId: crossResult.crossId });
    console.log(`🎯 Resultado específico encontrado: ${specificResult ? 'Sí' : 'No'}`);

    // Estadísticas agregadas
    const stats = await CrossResult.aggregate([
      { $match: { auditId: 'TEST_AUDIT_001' } },
      {
        $group: {
          _id: null,
          totalCrosses: { $sum: 1 },
          totalRecords: { $sum: '$summary.totalRecords' },
          totalMatches: { $sum: '$summary.matchingRecords' },
          avgMatchPercentage: { $avg: '$summary.matchPercentage' }
        }
      }
    ]);

    if (stats.length > 0) {
      console.log('📈 Estadísticas agregadas:', stats[0]);
    }

    console.log('\n✅ Todas las pruebas completadas exitosamente');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
};

// Ejecutar pruebas
testCrossResults();
