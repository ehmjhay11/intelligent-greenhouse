const mongoose = require('mongoose');

const thresholdSchema = {
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  ideal_min: { type: Number, required: true },
  ideal_max: { type: Number, required: true }
};

const plantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  stage: {
    type: String,
    enum: ['seedling', 'growing', 'flowering', 'fruiting', 'harvesting'],
    default: 'seedling'
  },
  thresholds: {
    temperature: {
      type: thresholdSchema,
      required: true
    },
    humidity: {
      type: thresholdSchema,
      required: true
    },
    soil_moisture: {
      type: thresholdSchema,
      required: true
    },
    light: {
      type: thresholdSchema,
      required: true
    }
  },
  assignedDevices: {
    type: [String],
    default: [],
    index: true
  },
  plantedDate: {
    type: Date,
    default: Date.now
  },
  expectedHarvestDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'harvested', 'removed'],
    default: 'active'
  },
  notes: [{
    date: { type: Date, default: Date.now },
    content: String,
    author: { type: String, default: 'System' }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
plantSchema.index({ assignedDevices: 1, isActive: 1 });
plantSchema.index({ stage: 1, isActive: 1 });

module.exports = mongoose.model('Plant', plantSchema);
