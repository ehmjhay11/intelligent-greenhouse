const mongoose = require('mongoose');

const thresholdSchema = {
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  ideal_min: { type: Number, required: true },
  ideal_max: { type: Number, required: true }
};

const plantTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['vegetable', 'herb', 'fruit', 'flower', 'other'],
    default: 'vegetable'
  },
  growthStages: [{
    type: String,
    enum: ['seedling', 'growing', 'flowering', 'fruiting', 'harvest']
  }],
  defaultThresholds: {
    temperature: thresholdSchema,
    humidity: thresholdSchema,
    soil_moisture: thresholdSchema,
    light: thresholdSchema
  },
  estimatedGrowthDays: {
    type: Number,
    default: 60
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PlantType', plantTypeSchema);
