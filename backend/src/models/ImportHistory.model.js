import mongoose from 'mongoose';

const importHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
  },
  fileType: {
    type: String,
    enum: ['csv', 'xlsx', 'xls'],
    required: true,
  },
  totalRecords: {
    type: Number,
    default: 0,
  },
  successfulRecords: {
    type: Number,
    default: 0,
  },
  duplicateRecords: {
    type: Number,
    default: 0,
  },
  failedRecords: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number, // en segundos
  },
  importErrors: [{  // Renombrado de 'errors' para evitar conflicto con palabra reservada de Mongoose
    row: Number,
    field: String,
    message: String,
    timestamp: Date,
  }],
  duplicates: [{
    row: Number,
    reason: String,
    existingId: String,
  }],
  summary: {
    totalValue: Number,
    averageValue: Number,
    categoryCounts: mongoose.Schema.Types.Mixed,
  },
  metadata: {
    odooUrl: String,
    odooDatabase: String,
    importMode: String,
    mappingUsed: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Índices
importHistorySchema.index({ userId: 1, createdAt: -1 });
importHistorySchema.index({ status: 1 });
importHistorySchema.index({ createdAt: -1 });

// Virtual para calcular tasa de éxito
importHistorySchema.virtual('successRate').get(function() {
  if (this.totalRecords === 0) return 0;
  return ((this.successfulRecords / this.totalRecords) * 100).toFixed(2);
});

// Asegurar que los virtuals se incluyan en JSON
importHistorySchema.set('toJSON', { virtuals: true });
importHistorySchema.set('toObject', { virtuals: true });

const ImportHistory = mongoose.model('ImportHistory', importHistorySchema);

export default ImportHistory;

