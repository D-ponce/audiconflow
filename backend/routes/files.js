import express from 'express';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

const router = express.Router();

// Inicializar GridFS
let gfsBucket;
mongoose.connection.once('open', () => {
  gfsBucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
});

// GET /api/files - Listar todos los archivos
router.get('/', async (req, res) => {
  try {
    if (!gfsBucket) {
      return res.status(500).json({ 
        success: false, 
        message: 'GridFS no está inicializado' 
      });
    }

    const files = await gfsBucket.find({}).toArray();
    
    if (!files || files.length === 0) {
      return res.json({ 
        success: true, 
        files: [],
        message: 'No se encontraron archivos' 
      });
    }

    res.json({ 
      success: true, 
      files: files.map(file => ({
        id: file._id,
        filename: file.filename,
        originalName: file.metadata?.originalName || file.filename,
        size: file.length,
        uploadDate: file.uploadDate,
        contentType: file.contentType,
        auditId: file.metadata?.auditId || null
      }))
    });
  } catch (error) {
    console.error('Error al obtener archivos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
});

// GET /api/files/audit/:auditId - Listar archivos por auditoría
router.get('/audit/:auditId', async (req, res) => {
  try {
    const { auditId } = req.params;
    
    if (!gfsBucket) {
      return res.status(500).json({ 
        success: false, 
        message: 'GridFS no está inicializado' 
      });
    }

    const files = await gfsBucket.find({ 
      'metadata.auditId': auditId 
    }).toArray();
    
    res.json({ 
      success: true, 
      files: files.map(file => ({
        id: file._id,
        filename: file.filename,
        originalName: file.metadata?.originalName || file.filename,
        size: file.length,
        uploadDate: file.uploadDate,
        contentType: file.contentType,
        auditId: file.metadata?.auditId
      }))
    });
  } catch (error) {
    console.error('Error al obtener archivos por auditoría:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
});

// DELETE /api/files/:id - Eliminar archivo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de archivo inválido' 
      });
    }

    if (!gfsBucket) {
      return res.status(500).json({ 
        success: false, 
        message: 'GridFS no está inicializado' 
      });
    }

    await gfsBucket.delete(new mongoose.Types.ObjectId(id));
    
    res.json({ 
      success: true, 
      message: 'Archivo eliminado correctamente' 
    });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
});

// GET /api/files/download/:id - Descargar archivo
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de archivo inválido' 
      });
    }

    if (!gfsBucket) {
      return res.status(500).json({ 
        success: false, 
        message: 'GridFS no está inicializado' 
      });
    }

    const downloadStream = gfsBucket.openDownloadStream(new mongoose.Types.ObjectId(id));
    
    downloadStream.on('error', (error) => {
      console.error('Error al descargar archivo:', error);
      res.status(404).json({ 
        success: false, 
        message: 'Archivo no encontrado' 
      });
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
});

export default router;
