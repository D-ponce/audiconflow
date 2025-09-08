import express from 'express';
import CrossResult from '../models/CrossResult.js';
import Audit from '../models/Audit.js';
import AuditActionLog from '../models/AuditActionLog.js';

const router = express.Router();

// POST /api/cross-results - Crear nuevo resultado de cruce
router.post('/', async (req, res) => {
  try {
    const {
      auditId,
      keyField,
      resultField,
      processedFiles,
      results,
      executedBy
    } = req.body;

    // Validar que la auditoría existe (buscar por _id o auditId)
    const audit = await Audit.findOne({ 
      $or: [
        { auditId: auditId },
        { _id: auditId }
      ]
    });
    
    console.log('🔍 Buscando auditoría con ID:', auditId);
    console.log('📋 Auditoría encontrada:', audit ? 'SÍ' : 'NO');
    
    if (!audit) {
      console.log('⚠️ Auditoría no encontrada, continuando sin validación...');
      // No bloquear el guardado si no se encuentra la auditoría
      // return res.status(404).json({
      //   success: false,
      //   message: 'Auditoría no encontrada'
      // });
    }

    // Generar ID único para el cruce
    const crossId = `CROSS_${auditId}_${Date.now()}`;

    // Crear nuevo resultado de cruce
    const crossResult = new CrossResult({
      auditId,
      crossId,
      keyField,
      resultField,
      processedFiles,
      results,
      executionDetails: {
        executedBy,
        startTime: new Date()
      },
      status: 'Completado'
    });

    // Calcular tiempo de finalización
    crossResult.executionDetails.endTime = new Date();
    crossResult.executionDetails.duration = 
      crossResult.executionDetails.endTime - crossResult.executionDetails.startTime;

    console.log('💾 Guardando CrossResult en BD...');
    console.log('📊 Datos a guardar:', {
      auditId: crossResult.auditId,
      crossId: crossResult.crossId,
      resultCount: crossResult.results?.length || 0
    });

    const savedResult = await crossResult.save();
    console.log('✅ CrossResult guardado exitosamente con ID:', savedResult._id);

    // Auto-generar reporte de análisis del cruce
    let generatedReport = null;
    if (audit && results && results.length > 0) {
      try {
        // Calcular estadísticas del cruce
        const totalRecords = results.length;
        const matchedRecords = results.filter(r => r.matched === true || r.status === 'matched').length;
        const unmatchedRecords = totalRecords - matchedRecords;
        const matchPercentage = totalRecords > 0 ? ((matchedRecords / totalRecords) * 100).toFixed(2) : 0;

        // Generar datos del reporte
        const reportData = {
          name: `Reporte de Cruce - ${audit.name || audit.auditId}`,
          description: `Análisis automático del cruce de información para la auditoría ${audit.auditId}`,
          category: 'cross_analysis',
          type: 'cross_result',
          auditId: audit._id,
          crossResultId: savedResult._id,
          createdBy: executedBy || 'Sistema',
          format: 'JSON',
          shared: false,
          data: {
            summary: {
              totalRecords,
              matchedRecords,
              unmatchedRecords,
              matchPercentage,
              keyField,
              resultField,
              executionTime: crossResult.executionDetails.duration
            },
            results: results.slice(0, 100), // Primeros 100 resultados para el reporte
            statistics: {
              byStatus: results.reduce((acc, r) => {
                const status = r.status || (r.matched ? 'matched' : 'unmatched');
                acc[status] = (acc[status] || 0) + 1;
                return acc;
              }, {}),
              processedFiles: processedFiles || []
            },
            metadata: {
              crossId: savedResult.crossId,
              generatedAt: new Date(),
              auditInfo: {
                auditId: audit.auditId,
                auditName: audit.name,
                location: audit.location
              }
            }
          }
        };

        // Importar modelo Report
        const Report = (await import('../models/Report.js')).default;
        
        // Crear y guardar el reporte
        const report = new Report(reportData);
        await report.calculateSize();
        generatedReport = await report.save();

        console.log('✅ Reporte automático generado:', generatedReport._id);

        // Actualizar CrossResult con referencia al reporte
        savedResult.reportId = generatedReport._id;
        await savedResult.save();

      } catch (reportError) {
        console.error('❌ Error generando reporte automático:', reportError);
        // No fallar el cruce si hay error en el reporte
      }
    }

    // Registrar acción de ejecución de cruce
    if (audit) {
      await AuditActionLog.logAction(
        audit.auditId,
        'cross_check_executed',
        executedBy || 'Usuario',
        {
          crossId: savedResult.crossId,
          keyField: keyField,
          resultField: resultField,
          filesProcessed: processedFiles?.length || 0,
          resultsCount: results?.length || 0,
          executionTime: crossResult.executionDetails.duration,
          reportGenerated: generatedReport ? true : false,
          reportId: generatedReport?._id
        },
        null,
        {
          crossResultId: savedResult._id,
          status: 'Completado',
          reportId: generatedReport?._id
        },
        req
      );
    }

    res.status(201).json({
      success: true,
      message: 'Resultado de cruce guardado exitosamente',
      data: {
        _id: savedResult._id,
        crossId: savedResult.crossId,
        auditId: savedResult.auditId,
        summary: savedResult.summary,
        executionDetails: savedResult.executionDetails
      }
    });

  } catch (error) {
    console.error('Error al guardar resultado de cruce:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/cross-results/:auditId - Obtener resultados de cruce por auditoría
router.get('/:auditId', async (req, res) => {
  try {
    const { auditId } = req.params;
    const { page = 1, limit = 10, includeResults = 'false' } = req.query;

    // Determinar si incluir resultados detallados basado en el parámetro
    const selectFields = includeResults === 'true' ? {} : { results: 0 };

    const crossResults = await CrossResult.find({ auditId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select(selectFields);

    const total = await CrossResult.countDocuments({ auditId });

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
    console.error('Error al obtener resultados de cruce:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
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

    const crossResult = await CrossResult.findOneAndDelete({ crossId });
    if (!crossResult) {
      return res.status(404).json({
        success: false,
        message: 'Resultado de cruce no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Resultado de cruce eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar resultado de cruce:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
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
