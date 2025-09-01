import express from 'express';
import mongoose from 'mongoose';
import Audit from '../models/Audit.js';
const router = express.Router();

// Create new audit
router.post('/create', async (req, res) => {
  try {
    const { name, type, location, priority, dueDate, auditor, description, createdBy } = req.body;

    // Validate required fields
    if (!name || !type || !location || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, tipo, ubicación y fecha límite son requeridos'
      });
    }

    // Create new audit in MongoDB
    const newAudit = new Audit({
      auditId: `AUD-${Date.now()}`,
      name,
      type,
      location,
      priority: priority || 'Media',
      dueDate: new Date(dueDate),
      auditor: auditor || 'Sin asignar',
      description: description || '',
      createdBy: createdBy || 'Usuario',
      status: 'Pendiente'
    });

    const savedAudit = await newAudit.save();

    res.status(201).json({
      success: true,
      message: 'Auditoría creada exitosamente',
      audit: savedAudit
    });

  } catch (error) {
    console.error('Error creating audit:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Get all audits (only created/active audits, excluding pending without progress)
router.get('/', async (req, res) => {
  try {
    const { status, priority, auditor } = req.query;
    
    // Build filter object for MongoDB - show all properly created audits
    let filter = {
      $and: [
        { auditId: { $exists: true, $ne: null, $ne: '' } }, // Must have audit ID
        { name: { $exists: true, $ne: null, $ne: '' } }, // Must have name
        { type: { $exists: true, $ne: null, $ne: '' } }, // Must have type
        { location: { $exists: true, $ne: null, $ne: '' } }, // Must have location
        { auditor: { $exists: true, $ne: null, $ne: '' } } // Must have auditor
      ]
    };
    
    // Apply additional filters if provided
    if (status) {
      filter.$and.push({ status: new RegExp(status, 'i') });
    }
    
    if (priority) {
      filter.$and.push({ priority: new RegExp(priority, 'i') });
    }
    
    if (auditor) {
      filter.$and.push({ auditor: new RegExp(auditor, 'i') });
    }

    const audits = await Audit.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      audits: audits,
      total: audits.length
    });

  } catch (error) {
    console.error('Error fetching audits:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Get audit statistics (only for created audits)
router.get('/stats/summary', async (req, res) => {
  try {
    // Filter for created audits only
    const createdAuditsFilter = {
      $and: [
        { auditId: { $exists: true, $ne: null, $ne: '' } }, // Must have audit ID
        { name: { $exists: true, $ne: null, $ne: '' } }, // Must have name
        { type: { $exists: true, $ne: null, $ne: '' } }, // Must have type
        { location: { $exists: true, $ne: null, $ne: '' } }, // Must have location
        { auditor: { $exists: true, $ne: null, $ne: '' } } // Must have auditor
      ]
    };

    const totalAudits = await Audit.countDocuments(createdAuditsFilter);
    const activeAudits = await Audit.countDocuments({ ...createdAuditsFilter, status: 'Activa' });
    const pendingAudits = await Audit.countDocuments({ 
      ...createdAuditsFilter,
      status: 'Pendiente'
    });
    const completedAudits = await Audit.countDocuments({ ...createdAuditsFilter, status: 'Completada' });
    const inReviewAudits = await Audit.countDocuments({ ...createdAuditsFilter, status: 'En Revisión' });
    
    const priorityStats = await Audit.aggregate([
      { $match: createdAuditsFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    const typeStats = await Audit.aggregate([
      { $match: createdAuditsFilter },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const stats = {
      total: totalAudits,
      active: activeAudits,
      pending: pendingAudits,
      completed: completedAudits,
      inReview: inReviewAudits,
      byPriority: priorityStats.reduce((acc, item) => {
        acc[item._id.toLowerCase()] = item.count;
        return acc;
      }, { alta: 0, media: 0, baja: 0 }),
      byType: typeStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Get audit by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const audit = await Audit.findOne({
      $or: [
        { _id: id },
        { auditId: id }
      ]
    });

    if (!audit) {
      return res.status(404).json({
        success: false,
        message: 'Auditoría no encontrada'
      });
    }

    res.json({
      success: true,
      audit
    });

  } catch (error) {
    console.error('Error fetching audit:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Update audit
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating audit with ID:', id);
    console.log('Update data:', req.body);
    
    // Validar que el ID sea un ObjectId válido si es necesario
    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { auditId: id };
    }
    
    const updatedAudit = await Audit.findOneAndUpdate(
      query,
      { 
        ...req.body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedAudit) {
      console.log('Audit not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Auditoría no encontrada'
      });
    }

    console.log('Audit updated successfully:', updatedAudit);
    res.json({
      success: true,
      message: 'Auditoría actualizada exitosamente',
      audit: updatedAudit
    });

  } catch (error) {
    console.error('Error updating audit:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor: ' + error.message
    });
  }
});

// Delete audit
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAudit = await Audit.findOneAndDelete({
      $or: [
        { _id: id },
        { auditId: id }
      ]
    });

    if (!deletedAudit) {
      return res.status(404).json({
        success: false,
        message: 'Auditoría no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Auditoría eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error deleting audit:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

export default router;
