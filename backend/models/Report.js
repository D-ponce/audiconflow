import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Cumplimiento', 'Recursos Humanos', 'Operaciones', 'Financiero', 'Inventario', 'Cruce de Datos']
  },
  type: {
    type: String,
    required: true,
    enum: ['cross_result', 'audit_summary', 'custom_report']
  },
  auditId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Audit',
    required: true
  },
  crossResultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CrossResult',
    required: false
  },
  createdBy: {
    type: String,
    required: true
  },
  format: {
    type: String,
    enum: ['PDF', 'Excel', 'CSV', 'JSON'],
    default: 'PDF'
  },
  size: {
    type: String,
    default: '0 KB'
  },
  shared: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  metadata: {
    totalRecords: Number,
    matchedRecords: Number,
    unmatchedRecords: Number,
    matchPercentage: Number,
    executionTime: Number,
    fileNames: [String]
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
reportSchema.index({ auditId: 1, createdAt: -1 });
reportSchema.index({ category: 1, createdAt: -1 });
reportSchema.index({ createdBy: 1, createdAt: -1 });
reportSchema.index({ type: 1, createdAt: -1 });

// Método para incrementar vistas
reportSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Método para calcular tamaño aproximado
reportSchema.methods.calculateSize = function() {
  const dataSize = JSON.stringify(this.data).length;
  if (dataSize < 1024) {
    this.size = `${dataSize} B`;
  } else if (dataSize < 1024 * 1024) {
    this.size = `${(dataSize / 1024).toFixed(1)} KB`;
  } else {
    this.size = `${(dataSize / (1024 * 1024)).toFixed(1)} MB`;
  }
  return this.save();
};

export default mongoose.model('Report', reportSchema);
