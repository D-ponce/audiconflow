import mongoose from 'mongoose';

const crossResultSchema = new mongoose.Schema({
  auditId: {
    type: String,
    required: true,
    ref: 'Audit'
  },
  crossId: {
    type: String,
    required: true,
    unique: true
  },
  keyField: {
    type: String,
    required: true,
    description: 'Campo clave utilizado para el cruce (ej: RUT)'
  },
  resultField: {
    type: String,
    required: true,
    description: 'Campo resultado del cruce (ej: Tipo de cuenta)'
  },
  processedFiles: [{
    filename: String,
    originalName: String,
    recordCount: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  results: [{
    keyValue: String, // Valor del campo clave (ej: RUT específico)
    resultValue: String, // Valor del resultado (ej: Personal)
    status: {
      type: String,
      enum: ['hay coincidencia', 'no hay coincidencia'],
      required: true
    },
    sourceFiles: [String], // Archivos donde se encontró la coincidencia
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  summary: {
    totalRecords: {
      type: Number,
      default: 0
    },
    matchingRecords: {
      type: Number,
      default: 0
    },
    nonMatchingRecords: {
      type: Number,
      default: 0
    },
    matchPercentage: {
      type: Number,
      default: 0
    }
  },
  executionDetails: {
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: Date,
    duration: Number, // en milisegundos
    executedBy: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['En Progreso', 'Completado', 'Error'],
    default: 'En Progreso'
  },
  errorDetails: {
    message: String,
    stack: String,
    timestamp: Date
  }
}, {
  timestamps: true
});

// Índices para mejor rendimiento
crossResultSchema.index({ auditId: 1 });
crossResultSchema.index({ crossId: 1 });
crossResultSchema.index({ 'executionDetails.executedBy': 1 });
crossResultSchema.index({ status: 1 });
crossResultSchema.index({ createdAt: -1 });

// Método para calcular estadísticas
crossResultSchema.methods.calculateSummary = function() {
  const totalRecords = this.results.length;
  const matchingRecords = this.results.filter(r => r.status === 'hay coincidencia').length;
  const nonMatchingRecords = totalRecords - matchingRecords;
  const matchPercentage = totalRecords > 0 ? Math.round((matchingRecords / totalRecords) * 100) : 0;

  this.summary = {
    totalRecords,
    matchingRecords,
    nonMatchingRecords,
    matchPercentage
  };

  return this.summary;
};

// Middleware para calcular resumen antes de guardar
crossResultSchema.pre('save', function(next) {
  if (this.isModified('results')) {
    this.calculateSummary();
  }
  next();
});

const CrossResult = mongoose.model('CrossResult', crossResultSchema);

export default CrossResult;
