import mongoose from 'mongoose';

const auditActionLogSchema = new mongoose.Schema({
  auditId: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'created',
      'updated',
      'status_changed',
      'assigned',
      'file_uploaded',
      'file_processed',
      'cross_check_executed',
      'report_generated',
      'finding_added',
      'finding_updated',
      'comment_added',
      'approval_requested',
      'approved',
      'rejected',
      'archived',
      'deleted'
    ]
  },
  actionBy: {
    type: String,
    required: true
  },
  actionDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  previousValue: {
    type: mongoose.Schema.Types.Mixed
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  sessionId: {
    type: String
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
auditActionLogSchema.index({ auditId: 1, actionDate: -1 });
auditActionLogSchema.index({ actionBy: 1 });
auditActionLogSchema.index({ action: 1 });
auditActionLogSchema.index({ actionDate: -1 });

// Método estático para registrar una acción
auditActionLogSchema.statics.logAction = async function(auditId, action, actionBy, details = {}, previousValue = null, newValue = null, req = null) {
  const logEntry = {
    auditId,
    action,
    actionBy,
    details,
    previousValue,
    newValue
  };

  // Agregar información de la request si está disponible
  if (req) {
    logEntry.ipAddress = req.ip || req.connection.remoteAddress;
    logEntry.userAgent = req.get('User-Agent');
    logEntry.sessionId = req.sessionID;
  }

  return await this.create(logEntry);
};

// Método estático para obtener historial de una auditoría
auditActionLogSchema.statics.getAuditHistory = async function(auditId, limit = 50, skip = 0) {
  return await this.find({ auditId })
    .sort({ actionDate: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

// Método estático para obtener estadísticas de acciones
auditActionLogSchema.statics.getActionStats = async function(auditId) {
  return await this.aggregate([
    { $match: { auditId } },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        lastAction: { $max: '$actionDate' },
        users: { $addToSet: '$actionBy' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

const AuditActionLog = mongoose.model('AuditActionLog', auditActionLogSchema);

export default AuditActionLog;
