const express = require('express');
const PlantType = require('../models/PlantType');
const router = express.Router();

// Get all plant types
router.get('/', async (req, res) => {
  try {
    const plantTypes = await PlantType.find({ isActive: true }).sort({ name: 1 });
    res.json({
      success: true,
      data: plantTypes,
      count: plantTypes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching plant types',
      error: error.message
    });
  }
});

// Get plant type by ID
router.get('/:id', async (req, res) => {
  try {
    const plantType = await PlantType.findById(req.params.id);
    if (!plantType) {
      return res.status(404).json({
        success: false,
        message: 'Plant type not found'
      });
    }
    res.json({
      success: true,
      data: plantType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching plant type',
      error: error.message
    });
  }
});

// Create new plant type
router.post('/', async (req, res) => {
  try {
    const plantType = new PlantType(req.body);
    await plantType.save();
    res.status(201).json({
      success: true,
      message: 'Plant type created successfully',
      data: plantType
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Plant type already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating plant type',
      error: error.message
    });
  }
});

// Update plant type
router.put('/:id', async (req, res) => {
  try {
    const plantType = await PlantType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!plantType) {
      return res.status(404).json({
        success: false,
        message: 'Plant type not found'
      });
    }
    res.json({
      success: true,
      message: 'Plant type updated successfully',
      data: plantType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating plant type',
      error: error.message
    });
  }
});

// Delete plant type (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const plantType = await PlantType.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!plantType) {
      return res.status(404).json({
        success: false,
        message: 'Plant type not found'
      });
    }
    res.json({
      success: true,
      message: 'Plant type deleted successfully',
      data: plantType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting plant type',
      error: error.message
    });
  }
});

// Get plant types by category
router.get('/category/:category', async (req, res) => {
  try {
    const plantTypes = await PlantType.find({ 
      category: req.params.category, 
      isActive: true 
    }).sort({ name: 1 });
    res.json({
      success: true,
      data: plantTypes,
      count: plantTypes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching plant types by category',
      error: error.message
    });
  }
});

module.exports = router;
