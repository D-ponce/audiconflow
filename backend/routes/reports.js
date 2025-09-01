import express from 'express';
import Report from '../models/Report.js';
import CrossResult from '../models/CrossResult.js';
import Audit from '../models/Audit.js';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/reports - Obtener todos los reportes
router.get('/', async (req, res) => {
  try {
    const { category, createdBy, type, auditId } = req.query;
    
    let filter = {};
    if (category && category !== 'all') filter.category = category;
    if (createdBy) filter.createdBy = createdBy;
    if (type) filter.type = type;
    if (auditId) filter.auditId = auditId;

    const reports = await Report.find(filter)
      .populate('auditId', 'name description')
      .populate('crossResultId', 'keyField resultField')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/reports/:id - Obtener reporte específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de reporte inválido' });
    }

    const report = await Report.findById(id)
      .populate('auditId', 'name description')
      .populate('crossResultId');

    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    // Incrementar vistas
    await report.incrementViews();

    res.json(report);
  } catch (error) {
    console.error('Error al obtener reporte:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/reports - Crear nuevo reporte
router.post('/', async (req, res) => {
  try {
    console.log('📥 Recibiendo datos para crear reporte:', req.body);
    
    const {
      name,
      description,
      category,
      type,
      auditId,
      crossResultId,
      createdBy,
      format,
      size,
      shared,
      data,
      metadata
    } = req.body;

    // Validaciones básicas
    if (!name || !description || !category || !type || !createdBy || !data) {
      console.log('❌ Faltan campos requeridos');
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: name, description, category, type, createdBy, data',
        received: Object.keys(req.body)
      });
    }

    // Validar auditId solo si no es el valor por defecto
    if (auditId && auditId !== 'AUDIT_DEFAULT' && !mongoose.Types.ObjectId.isValid(auditId)) {
      console.log('❌ ID de auditoría inválido:', auditId);
      return res.status(400).json({ error: 'ID de auditoría inválido' });
    }

    // Verificar que la auditoría existe (solo si no es el valor por defecto)
    if (auditId && auditId !== 'AUDIT_DEFAULT') {
      const audit = await Audit.findById(auditId);
      if (!audit) {
        console.log('❌ Auditoría no encontrada:', auditId);
        return res.status(404).json({ error: 'Auditoría no encontrada' });
      }
    }

    // Crear reporte
    const reportData = {
      name,
      description,
      category,
      type,
      auditId: auditId === 'AUDIT_DEFAULT' ? null : auditId,
      crossResultId,
      createdBy,
      format: format || 'PDF',
      size: size || '0 KB',
      shared: shared || false,
      views: 0,
      data,
      metadata
    };

    console.log('📝 Creando reporte con datos:', reportData);
    const report = new Report(reportData);

    // Calcular tamaño si no se proporcionó
    if (!size) {
      await report.calculateSize();
    }
    
    await report.save();
    console.log('✅ Reporte guardado con ID:', report._id);

    const populatedReport = await Report.findById(report._id)
      .populate('auditId', 'name description')
      .populate('crossResultId', 'keyField resultField');

    res.status(201).json({
      success: true,
      data: populatedReport,
      message: 'Reporte creado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al crear reporte:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// PUT /api/reports/:id - Actualizar reporte
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de reporte inválido' });
    }

    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const report = await Report.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('auditId', 'name description')
     .populate('crossResultId', 'keyField resultField');

    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    // Recalcular tamaño si se actualizó la data
    if (updateData.data) {
      await report.calculateSize();
    }

    res.json(report);
  } catch (error) {
    console.error('Error al actualizar reporte:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/reports/:id - Eliminar reporte
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de reporte inválido' });
    }

    const report = await Report.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    res.json({ message: 'Reporte eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/reports/from-cross-result - Crear reporte desde resultado de cruce
router.post('/from-cross-result', async (req, res) => {
  try {
    const { crossResultId, name, description, category, createdBy, format } = req.body;

    if (!crossResultId || !name || !createdBy) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: crossResultId, name, createdBy' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(crossResultId)) {
      return res.status(400).json({ error: 'ID de resultado de cruce inválido' });
    }

    // Obtener resultado de cruce
    const crossResult = await CrossResult.findById(crossResultId);
    if (!crossResult) {
      return res.status(404).json({ error: 'Resultado de cruce no encontrado' });
    }

    // Crear reporte basado en el resultado de cruce
    const report = new Report({
      name,
      description: description || `Reporte generado desde cruce: ${crossResult.keyField} vs ${crossResult.resultField}`,
      category: category || 'Cruce de Datos',
      type: 'cross_result',
      auditId: crossResult.auditId,
      crossResultId: crossResult._id,
      createdBy,
      format: format || 'PDF',
      data: {
        crossResult: crossResult.results,
        summary: crossResult.summary,
        executionDetails: crossResult.executionDetails
      },
      metadata: {
        totalRecords: crossResult.summary?.totalRecords || 0,
        matchedRecords: crossResult.summary?.matchedRecords || 0,
        unmatchedRecords: crossResult.summary?.unmatchedRecords || 0,
        matchPercentage: crossResult.summary?.matchPercentage || 0,
        executionTime: crossResult.executionDetails?.executionTime || 0,
        fileNames: crossResult.executionDetails?.fileNames || []
      }
    });

    await report.calculateSize();
    await report.save();

    const populatedReport = await Report.findById(report._id)
      .populate('auditId', 'name description')
      .populate('crossResultId', 'keyField resultField');

    res.status(201).json(populatedReport);
  } catch (error) {
    console.error('Error al crear reporte desde resultado de cruce:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/reports/stats/:auditId - Estadísticas de reportes por auditoría
router.get('/stats/:auditId', async (req, res) => {
  try {
    const { auditId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(auditId)) {
      return res.status(400).json({ error: 'ID de auditoría inválido' });
    }

    const stats = await Report.aggregate([
      { $match: { auditId: new mongoose.Types.ObjectId(auditId) } },
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          totalViews: { $sum: '$views' },
          byCategory: {
            $push: {
              category: '$category',
              count: 1
            }
          },
          byType: {
            $push: {
              type: '$type',
              count: 1
            }
          }
        }
      }
    ]);

    res.json(stats[0] || { totalReports: 0, totalViews: 0, byCategory: [], byType: [] });
  } catch (error) {
    console.error('Error al obtener estadísticas de reportes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
