import express from 'express';
import mongoose from 'mongoose';
import CrossResult from '../models/CrossResult.js';
import Audit from '../models/Audit.js';
import AuditActionLog from '../models/AuditActionLog.js';

const router = express.Router();

// POST /api/cross-results - Crear nuevo resultado de cruce (DESHABILITADO - usar upload.js)
router.post('/', async (req, res) => {
  console.log('⚠️ Endpoint POST /api/cross-results está deshabilitado');
  console.log('📍 Use el endpoint /api/upload/cross-check en su lugar');
  
  return res.status(410).json({
    success: false,
    message: 'Este endpoint está deshabilitado. Use /api/upload/cross-check para guardar cruces.',
    redirectTo: '/api/upload/cross-check'
  });
});

// GET /api/cross-results/:auditId - Obtener resultados de cruce por auditoría
router.get('/:auditId', async (req, res) => {
  try {
    const { auditId } = req.params;
    const { page = 1, limit = 10, includeResults = 'false' } = req.query;

    console.log(`🔍 Buscando resultados de cruce para auditId: ${auditId}`);
    console.log(`📋 Parámetros: page=${page}, limit=${limit}, includeResults=${includeResults}`);
    console.log(`🔌 Estado de MongoDB: ${mongoose.connection.readyState}`);

    // Verificar conexión a la base de datos
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB no está conectado');
      return res.status(503).json({
        success: false,
        message: 'Base de datos no disponible',
        error: 'MongoDB connection not ready'
      });
    }

    // Determinar si incluir resultados detallados basado en el parámetro
    const selectFields = includeResults === 'true' ? {} : { results: 0 };

    // Buscar por auditId exacto y también por patrones comunes
    const searchQuery = {
      $or: [
        { auditId: auditId },
        { auditId: { $regex: auditId, $options: 'i' } },
        { 'executionDetails.auditId': auditId },
        // Buscar también por ObjectId si el auditId parece ser uno
        ...(mongoose.Types.ObjectId.isValid(auditId) ? [{ auditId: new mongoose.Types.ObjectId(auditId) }] : [])
      ]
    };

    console.log('🔎 Query de búsqueda:', JSON.stringify(searchQuery));

    // Verificar si la colección existe
    const collections = await mongoose.connection.db.listCollections({ name: 'crossresults' }).toArray();
    console.log(`📁 Colección crossresults existe: ${collections.length > 0}`);

    const crossResults = await CrossResult.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select(selectFields);

    const total = await CrossResult.countDocuments(searchQuery);

    console.log(`📊 Encontrados ${crossResults.length} resultados de ${total} totales`);
    
    if (crossResults.length > 0) {
      console.log('📋 Primer resultado:', {
        crossId: crossResults[0].crossId,
        auditId: crossResults[0].auditId,
        keyField: crossResults[0].keyField,
        resultField: crossResults[0].resultField,
        createdAt: crossResults[0].createdAt
      });
    } else {
      console.log('ℹ️ No se encontraron resultados para este auditId');
      
      // Buscar todos los auditIds disponibles para debugging
      const allAuditIds = await CrossResult.distinct('auditId');
      console.log('📋 AuditIds disponibles en la base de datos:', allAuditIds);
    }

    res.json({
      success: true,
      data: crossResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener resultados de cruce:', error);
    console.error('🔍 Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al cargar los resultados de cruce',
      error: error.message,
      details: `Error en la consulta de base de datos para auditId: ${req.params.auditId}`,
      mongoState: mongoose.connection.readyState
    });
  }
});

// GET /api/cross-results/detail/:crossId - Obtener resultado de cruce específico
router.get('/detail/:crossId', async (req, res) => {
  try {
    const { crossId } = req.params;

    const crossResult = await CrossResult.findOne({ crossId });
    if (!crossResult) {
      return res.status(404).json({
        success: false,
        message: 'Resultado de cruce no encontrado'
      });
    }

    res.json({
      success: true,
      data: crossResult
    });

  } catch (error) {
    console.error('Error al obtener detalle de cruce:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// PUT /api/cross-results/:crossId - Actualizar resultado de cruce
router.put('/:crossId', async (req, res) => {
  try {
    const { crossId } = req.params;
    const updates = req.body;

    const crossResult = await CrossResult.findOneAndUpdate(
      { crossId },
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!crossResult) {
      return res.status(404).json({
        success: false,
        message: 'Resultado de cruce no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Resultado de cruce actualizado exitosamente',
      data: crossResult
    });

  } catch (error) {
    console.error('Error al actualizar resultado de cruce:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// DELETE /api/cross-results/:crossId - Eliminar resultado de cruce
router.delete('/:crossId', async (req, res) => {
  try {
    const { crossId } = req.params;

    console.log(`🗑️ Intentando eliminar resultado de cruce: ${crossId}`);

    const crossResult = await CrossResult.findOneAndDelete({ crossId });
    if (!crossResult) {
      console.log(`❌ Resultado de cruce no encontrado: ${crossId}`);
      return res.status(404).json({
        success: false,
        message: 'Resultado de cruce no encontrado'
      });
    }

    console.log(`✅ Resultado de cruce eliminado exitosamente de la base de datos:`);
    console.log(`   - ID: ${crossResult.crossId}`);
    console.log(`   - Auditoría: ${crossResult.auditId}`);
    console.log(`   - Registros eliminados: ${crossResult.results?.length || 0}`);
    console.log(`   - Documento MongoDB eliminado: ${crossResult._id}`);

    // Registrar acción de eliminación en audit logs si existe auditId
    if (crossResult.auditId) {
      try {
        await AuditActionLog.logAction(
          crossResult.auditId,
          'cross_check_deleted',
          req.body.deletedBy || 'Usuario',
          {
            crossId: crossResult.crossId,
            keyField: crossResult.keyField,
            resultField: crossResult.resultField,
            recordsDeleted: crossResult.results?.length || 0,
            deletedAt: new Date()
          },
          crossResult,
          null,
          req
        );
        console.log(`📝 Acción de eliminación registrada en audit logs`);
      } catch (logError) {
        console.error('⚠️ Error al registrar eliminación en audit logs:', logError);
      }
    }

    res.json({
      success: true,
      message: 'Resultado de cruce eliminado exitosamente de la base de datos',
      deletedId: crossResult._id,
      deletedCrossId: crossResult.crossId
    });

  } catch (error) {
    console.error('❌ Error al eliminar resultado de cruce de la base de datos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar de la base de datos',
      error: error.message
    });
  }
});

// GET /api/cross-results/stats/:auditId - Obtener estadísticas de cruces por auditoría
router.get('/stats/:auditId', async (req, res) => {
  try {
    const { auditId } = req.params;

    const stats = await CrossResult.aggregate([
      { $match: { auditId } },
      {
        $group: {
          _id: null,
          totalCrosses: { $sum: 1 },
          totalRecords: { $sum: '$summary.totalRecords' },
          totalMatches: { $sum: '$summary.matchingRecords' },
          avgMatchPercentage: { $avg: '$summary.matchPercentage' },
          lastExecution: { $max: '$createdAt' }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : {
      totalCrosses: 0,
      totalRecords: 0,
      totalMatches: 0,
      avgMatchPercentage: 0,
      lastExecution: null
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de cruce:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

export default router;
