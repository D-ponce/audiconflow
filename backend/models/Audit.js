import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  auditId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Inventario', 'Financiera', 'Compliance', 'Operacional', 'Calidad', 'Seguridad']
  },
  location: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['Alta', 'Media', 'Baja'],
    default: 'Media'
  },
  dueDate: {
    type: Date,
    required: true
  },
  auditor: {
    type: String,
    default: 'Sin asignar'
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pendiente', 'Activa', 'En Progreso', 'En Revisión', 'Completada'],
    default: 'Pendiente'
  },
  createdBy: {
    type: String,
    required: true
  },
  findings: [{
    title: String,
    description: String,
    severity: {
      type: String,
      enum: ['Baja', 'Media', 'Alta', 'Crítica']
    },
    status: {
      type: String,
      enum: ['Abierto', 'En Progreso', 'Cerrado']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  estimatedHours: {
    type: Number,
    default: 0
  },
  actualHours: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
auditSchema.index({ auditId: 1 });
auditSchema.index({ type: 1 });
auditSchema.index({ status: 1 });
auditSchema.index({ priority: 1 });
auditSchema.index({ dueDate: 1 });
auditSchema.index({ createdBy: 1 });

const Audit = mongoose.model('Audit', auditSchema);

export default Audit;
