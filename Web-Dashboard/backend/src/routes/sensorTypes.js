const express = require('express');
const SensorType = require('../models/SensorType');
const router = express.Router();

// Get all sensor types
router.get('/', async (req, res) => {
  try {
    const sensorTypes = await SensorType.find({ isActive: true }).sort({ name: 1 });
    res.json({
      success: true,
      data: sensorTypes,
      count: sensorTypes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sensor types',
      error: error.message
    });
  }
});

// Get sensor type by ID
router.get('/:id', async (req, res) => {
  try {
    const sensorType = await SensorType.findById(req.params.id);
    if (!sensorType) {
      return res.status(404).json({
        success: false,
        message: 'Sensor type not found'
      });
    }
    res.json({
      success: true,
      data: sensorType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sensor type',
      error: error.message
    });
  }
});

// Create new sensor type
router.post('/', async (req, res) => {
  try {
    const sensorType = new SensorType(req.body);
    await sensorType.save();
    res.status(201).json({
      success: true,
      message: 'Sensor type created successfully',
      data: sensorType
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Sensor type already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating sensor type',
      error: error.message
    });
  }
});

// Update sensor type
router.put('/:id', async (req, res) => {
  try {
    const sensorType = await SensorType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!sensorType) {
      return res.status(404).json({
        success: false,
        message: 'Sensor type not found'
      });
    }
    res.json({
      success: true,
      message: 'Sensor type updated successfully',
      data: sensorType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating sensor type',
      error: error.message
    });
  }
});

// Delete sensor type (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const sensorType = await SensorType.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!sensorType) {
      return res.status(404).json({
        success: false,
        message: 'Sensor type not found'
      });
    }
    res.json({
      success: true,
      message: 'Sensor type deleted successfully',
      data: sensorType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting sensor type',
      error: error.message
    });
  }
});

module.exports = router;
