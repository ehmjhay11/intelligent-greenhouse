const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  plant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: true
  },
  deviceId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['temperature', 'humidity', 'soil_moisture', 'light', 'offline'],
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  sensorValue: {
    type: Number,
    required: function() {
      return this.type !== 'offline';
    }
  },
  threshold: {
    min: Number,
    max: Number,
    ideal_min: Number,
    ideal_max: Number
  },
  acknowledged: {
    type: Boolean,
    default: false
  },
  acknowledgedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
alertSchema.index({ plant: 1, type: 1, acknowledged: 1, createdAt: -1 });
alertSchema.index({ acknowledged: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
