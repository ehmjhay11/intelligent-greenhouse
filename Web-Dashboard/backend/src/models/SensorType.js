const mongoose = require('mongoose');

const sensorTypeSchema = new mongoose.Schema({
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
  unit: {
    type: String,
    required: true
  },
  defaultPin: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['environmental', 'soil', 'light', 'air_quality'],
    default: 'environmental'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SensorType', sensorTypeSchema);
