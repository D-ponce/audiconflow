import express from 'express';
import FileUploadHistory from '../models/FileUploadHistory.js';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/file-history/:auditId - Obtener historial de archivos por auditoría
router.get('/:auditId', async (req, res) => {
  try {
    const { auditId } = req.params;
    
    const history = await FileUploadHistory.find({ auditId })
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (error) {
    console.error('Error al obtener historial de archivos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/file-history - Crear registro de carga de archivo
router.post('/', async (req, res) => {
  try {
    const {
      auditId,
      fileName,
      originalName,
      fileSize,
      fileType,
      uploadedBy,
      uploadPath,
      metadata
    } = req.body;

    // Validaciones
    if (!auditId || !fileName || !originalName || !uploadedBy) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: auditId, fileName, originalName, uploadedBy' 
      });
    }

    const historyRecord = new FileUploadHistory({
      auditId,
      fileName,
      originalName,
      fileSize: fileSize || 0,
      fileType: fileType || 'unknown',
      uploadedBy,
      uploadPath: uploadPath || '',
      metadata: metadata || {}
    });

    await historyRecord.save();

    res.status(201).json(historyRecord);
  } catch (error) {
    console.error('Error al crear registro de historial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/file-history/:id/processing - Actualizar estado de procesamiento
router.put('/:id/processing', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, results } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de historial inválido' });
    }

    const historyRecord = await FileUploadHistory.findById(id);
    if (!historyRecord) {
      return res.status(404).json({ error: 'Registro de historial no encontrado' });
    }

    await historyRecord.updateProcessingStatus(status, results);

    res.json(historyRecord);
  } catch (error) {
    console.error('Error al actualizar estado de procesamiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/file-history/:id/cross-result - Agregar resultado de cruce
router.post('/:id/cross-result', async (req, res) => {
  try {
    const { id } = req.params;
    const { crossResult } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de historial inválido' });
    }

    const historyRecord = await FileUploadHistory.findById(id);
    if (!historyRecord) {
      return res.status(404).json({ error: 'Registro de historial no encontrado' });
    }

    await historyRecord.addCrossResult(crossResult);

    res.json(historyRecord);
  } catch (error) {
    console.error('Error al agregar resultado de cruce:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/file-history/stats/:auditId - Estadísticas de archivos por auditoría
router.get('/stats/:auditId', async (req, res) => {
  try {
    const { auditId } = req.params;

    const stats = await FileUploadHistory.aggregate([
      { $match: { auditId } },
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: '$fileSize' },
          byStatus: {
            $push: {
              status: '$status',
              count: 1
            }
          },
          byFileType: {
            $push: {
              fileType: '$fileType',
              count: 1
            }
          },
          totalCrossResults: { $sum: { $size: '$crossResults' } }
        }
      }
    ]);

    res.json(stats[0] || { 
      totalFiles: 0, 
      totalSize: 0, 
      byStatus: [], 
      byFileType: [], 
      totalCrossResults: 0 
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de archivos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/file-history/:id - Eliminar registro de historial
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de historial inválido' });
    }

    const historyRecord = await FileUploadHistory.findByIdAndDelete(id);

    if (!historyRecord) {
      return res.status(404).json({ error: 'Registro de historial no encontrado' });
    }

    res.json({ message: 'Registro de historial eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar registro de historial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
