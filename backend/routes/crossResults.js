import express from 'express';
import CrossResult from '../models/CrossResult.js';
import Audit from '../models/Audit.js';

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

    // Validar que la auditoría existe
    const audit = await Audit.findOne({ auditId });
    if (!audit) {
      return res.status(404).json({
        success: false,
        message: 'Auditoría no encontrada'
      });
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

    await crossResult.save();

    res.status(201).json({
      success: true,
      message: 'Resultado de cruce guardado exitosamente',
      data: {
        crossId: crossResult.crossId,
        summary: crossResult.summary,
        executionDetails: crossResult.executionDetails
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
    const { page = 1, limit = 10 } = req.query;

    const crossResults = await CrossResult.find({ auditId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-results'); // Excluir resultados detallados para mejor rendimiento

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
