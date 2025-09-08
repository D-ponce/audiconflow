import express from 'express';
import AuditActionLog from '../models/AuditActionLog.js';
import Audit from '../models/Audit.js';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/audit-logs/:auditId - Obtener historial de acciones de una auditoría
router.get('/:auditId', async (req, res) => {
  try {
    const { auditId } = req.params;
    const { limit = 50, skip = 0, action } = req.query;

    // Verificar que la auditoría existe
    const audit = await Audit.findOne({ auditId });
    if (!audit) {
      return res.status(404).json({ error: 'Auditoría no encontrada' });
    }

    let filter = { auditId };
    if (action) {
      filter.action = action;
    }

    const logs = await AuditActionLog.find(filter)
      .sort({ actionDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const totalCount = await AuditActionLog.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: totalCount > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener historial de auditoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/audit-logs/:auditId/stats - Obtener estadísticas de acciones
router.get('/:auditId/stats', async (req, res) => {
  try {
    const { auditId } = req.params;

    // Verificar que la auditoría existe
    const audit = await Audit.findOne({ auditId });
    if (!audit) {
      return res.status(404).json({ error: 'Auditoría no encontrada' });
    }

    const stats = await AuditActionLog.getActionStats(auditId);
    
    // Obtener información adicional
    const totalActions = await AuditActionLog.countDocuments({ auditId });
    const uniqueUsers = await AuditActionLog.distinct('actionBy', { auditId });
    const firstAction = await AuditActionLog.findOne({ auditId }).sort({ actionDate: 1 });
    const lastAction = await AuditActionLog.findOne({ auditId }).sort({ actionDate: -1 });

    res.json({
      totalActions,
      uniqueUsers: uniqueUsers.length,
      usersList: uniqueUsers,
      firstAction: firstAction?.actionDate,
      lastAction: lastAction?.actionDate,
      actionBreakdown: stats
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de auditoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/audit-logs - Registrar una nueva acción
router.post('/', async (req, res) => {
  try {
    const {
      auditId,
      action,
      actionBy,
      details = {},
      previousValue = null,
      newValue = null
    } = req.body;

    if (!auditId || !action || !actionBy) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: auditId, action, actionBy' 
      });
    }

    // Verificar que la auditoría existe
    const audit = await Audit.findOne({ auditId });
    if (!audit) {
      return res.status(404).json({ error: 'Auditoría no encontrada' });
    }

    const logEntry = await AuditActionLog.logAction(
      auditId,
      action,
      actionBy,
      details,
      previousValue,
      newValue,
      req
    );

    res.status(201).json({
      success: true,
      data: logEntry,
      message: 'Acción registrada exitosamente'
    });
  } catch (error) {
    console.error('Error al registrar acción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/audit-logs/user/:userId - Obtener acciones de un usuario específico
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, skip = 0, auditId } = req.query;

    let filter = { actionBy: userId };
    if (auditId) {
      filter.auditId = auditId;
    }

    const logs = await AuditActionLog.find(filter)
      .sort({ actionDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const totalCount = await AuditActionLog.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: totalCount > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener acciones del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/audit-logs/:auditId - Limpiar historial de una auditoría (solo administradores)
router.delete('/:auditId', async (req, res) => {
  try {
    const { auditId } = req.params;
    const { confirm } = req.body;

    if (!confirm) {
      return res.status(400).json({ 
        error: 'Debe confirmar la eliminación del historial' 
      });
    }

    // Verificar que la auditoría existe
    const audit = await Audit.findOne({ auditId });
    if (!audit) {
      return res.status(404).json({ error: 'Auditoría no encontrada' });
    }

    const deletedCount = await AuditActionLog.deleteMany({ auditId });

    res.json({
      success: true,
      message: `Se eliminaron ${deletedCount.deletedCount} registros del historial`,
      deletedCount: deletedCount.deletedCount
    });
  } catch (error) {
    console.error('Error al limpiar historial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
