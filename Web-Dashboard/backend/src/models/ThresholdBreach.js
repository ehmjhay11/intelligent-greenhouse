const mongoose = require('mongoose');

const thresholdBreachSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true
  },
  deviceId: {
    type: String,
    required: true
  },
  plantId: {
    type: String,
    required: true
  },
  sensorType: {
    type: String,
    required: true,
    enum: ['temperature', 'humidity', 'soil_moisture', 'light']
  },
  currentValue: {
    type: Number,
    required: true
  },
  thresholds: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    ideal_min: { type: Number, required: true },
    ideal_max: { type: Number, required: true }
  },
  breachType: {
    type: String,
    required: true,
    enum: ['below_min', 'above_max', 'below_ideal', 'above_ideal']
  },
  severity: {
    type: String,
    required: true,
    enum: ['critical', 'warning'],
    default: function() {
      return (this.breachType === 'below_min' || this.breachType === 'above_max') ? 'critical' : 'warning';
    }
  },
  message: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient querying
thresholdBreachSchema.index({ deviceId: 1, sensorType: 1, createdAt: -1 });
thresholdBreachSchema.index({ plantId: 1, createdAt: -1 });
thresholdBreachSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('ThresholdBreach', thresholdBreachSchema);
