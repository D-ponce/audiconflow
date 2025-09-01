import mongoose from 'mongoose';

const fileUploadHistorySchema = new mongoose.Schema({
  auditId: {
    type: String,
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  uploadPath: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'processed', 'error'],
    default: 'uploaded'
  },
  processingResults: {
    recordCount: Number,
    columns: [String],
    validationErrors: [String],
    processingTime: Number
  },
  metadata: {
    encoding: String,
    mimetype: String,
    destination: String,
    fieldname: String
  },
  crossResults: [{
    crossId: String,
    keyField: String,
    resultField: String,
    matchCount: Number,
    totalRecords: Number,
    createdAt: Date
  }]
}, {
  timestamps: true
});

// Índices para optimizar consultas
fileUploadHistorySchema.index({ auditId: 1, createdAt: -1 });
fileUploadHistorySchema.index({ uploadedBy: 1, createdAt: -1 });
fileUploadHistorySchema.index({ status: 1 });

// Método para agregar resultado de cruce
fileUploadHistorySchema.methods.addCrossResult = function(crossResult) {
  this.crossResults.push({
    crossId: crossResult.crossId,
    keyField: crossResult.keyField,
    resultField: crossResult.resultField,
    matchCount: crossResult.matchCount,
    totalRecords: crossResult.totalRecords,
    createdAt: new Date()
  });
  return this.save();
};

// Método para actualizar estado de procesamiento
fileUploadHistorySchema.methods.updateProcessingStatus = function(status, results = null) {
  this.status = status;
  if (results) {
    this.processingResults = results;
  }
  return this.save();
};

export default mongoose.model('FileUploadHistory', fileUploadHistorySchema);
