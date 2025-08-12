const express = require('express');
const mqtt = require('mqtt');
const Plant = require('../models/Plant');
const router = express.Router();

// MQTT Client for sending commands to ESP32 devices
let mqttClient = null;

// Initialize MQTT client
const connectMQTT = () => {
  try {
    mqttClient = mqtt.connect('mqtt://10.240.100.213:1883');
    
    mqttClient.on('connect', () => {
      console.log('✅ Plants MQTT client connected for command sending');
    });

    mqttClient.on('error', (error) => {
      console.error('❌ Plants MQTT connection error:', error);
    });

    mqttClient.on('disconnect', () => {
      console.log('🔌 Plants MQTT client disconnected');
    });
  } catch (error) {
    console.error('❌ Failed to connect Plants MQTT client:', error);
  }
};

// Connect MQTT client on startup
connectMQTT();

// Get all plants
router.get('/', async (req, res) => {
  try {
    const plants = await Plant.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: plants,
      count: plants.length
    });
  } catch (error) {
    console.error('Error fetching plants:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plants',
      error: error.message
    });
  }
});

// Get plant by ID
router.get('/:id', async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    
    if (!plant || !plant.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    res.json({
      success: true,
      data: plant
    });
  } catch (error) {
    console.error('Error fetching plant:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plant',
      error: error.message
    });
  }
});

// Create new plant
router.post('/', async (req, res) => {
  try {
    const plantData = {
      ...req.body,
      id: undefined // Remove any frontend-generated ID
    };

    const plant = new Plant(plantData);
    await plant.save();

    res.status(201).json({
      success: true,
      message: 'Plant created successfully',
      data: plant
    });
  } catch (error) {
    console.error('Error creating plant:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating plant',
      error: error.message
    });
  }
});

// Update plant
router.put('/:id', async (req, res) => {
  try {
    const plant = await Plant.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    res.json({
      success: true,
      message: 'Plant updated successfully',
      data: plant
    });
  } catch (error) {
    console.error('Error updating plant:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating plant',
      error: error.message
    });
  }
});

// Delete plant (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const plant = await Plant.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: false, 
        status: 'removed',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    res.json({
      success: true,
      message: 'Plant deleted successfully',
      data: plant
    });
  } catch (error) {
    console.error('Error deleting plant:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting plant',
      error: error.message
    });
  }
});

// Assign device to plant
router.post('/:id/assign-device', async (req, res) => {
  try {
    const { deviceId } = req.body;
    const plantId = req.params.id;

    // If deviceId is provided, unassign it from any other plant first
    if (deviceId) {
      await Plant.updateMany(
        { 
          assignedDevice: deviceId, 
          isActive: true,
          _id: { $ne: plantId }
        },
        { $unset: { assignedDevice: 1 } }
      );
    }

    // Update the plant
    const plant = await Plant.findByIdAndUpdate(
      plantId,
      { assignedDevice: deviceId },
      { new: true }
    );

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    res.json({
      success: true,
      message: deviceId ? 'Device assigned successfully' : 'Device unassigned successfully',
      data: plant
    });
  } catch (error) {
    console.error('Error assigning device:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning device',
      error: error.message
    });
  }
});

// Send thresholds to assigned device
router.post('/:id/send-thresholds', async (req, res) => {
  try {
    console.log('🔄 === BACKEND: SEND THRESHOLDS REQUEST ===');
    console.log('📋 Plant ID:', req.params.id);
    console.log('🕐 Timestamp:', new Date().toISOString());
    
    const plant = await Plant.findById(req.params.id);
    
    if (!plant || !plant.isActive) {
      console.error('❌ Plant not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    console.log('📋 Found plant:', {
      name: plant.name,
      assignedDevice: plant.assignedDevice,
      thresholds: plant.thresholds
    });

    if (!plant.assignedDevice) {
      console.error('❌ No device assigned to plant:', plant.name);
      return res.status(400).json({
        success: false,
        message: 'No device assigned to this plant'
      });
    }

    if (!mqttClient || !mqttClient.connected) {
      console.error('❌ MQTT client not connected');
      return res.status(500).json({
        success: false,
        message: 'MQTT client not connected'
      });
    }

    // Prepare MQTT message in ESP32-expected format
    const thresholdMessage = {
      command: 'update_thresholds',
      plant_name: plant.name,
      device_id: plant.assignedDevice,
      thresholds: plant.thresholds,
      timestamp: Date.now()
    };

    // Use ESP32-expected topic format
    const topic = `esp32_${plant.assignedDevice}/commands`;
    
    console.log('📡 Sending thresholds to ESP32 device:', plant.assignedDevice);
    console.log('📤 Publishing to MQTT topic:', topic);
    console.log('📋 Thresholds payload:', JSON.stringify(thresholdMessage, null, 2));
    
    mqttClient.publish(topic, JSON.stringify(thresholdMessage), (err) => {
      if (err) {
        console.error('❌ MQTT publish error:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to send thresholds to device',
          error: err.message
        });
      }

      console.log('✅ MQTT message published successfully');
      console.log('✅ Thresholds sent to device', plant.assignedDevice, 'successfully');
      
      res.json({
        success: true,
        message: 'Thresholds sent to device successfully',
        deviceId: plant.assignedDevice,
        plantName: plant.name,
        topic: topic,
        data: thresholdMessage
      });
    });

  } catch (error) {
    console.error('❌ Error in send-thresholds endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Send test command to device
router.post('/test-command', async (req, res) => {
  try {
    console.log('🧪 === BACKEND: TEST COMMAND REQUEST ===');
    console.log('📋 Device ID:', req.body.deviceId);
    
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID required'
      });
    }

    if (!mqttClient || !mqttClient.connected) {
      console.error('❌ MQTT client not connected');
      return res.status(500).json({
        success: false,
        message: 'MQTT client not connected'
      });
    }

    // Use ESP32-expected command format
    const testMessage = {
      command: 'test',
      device_id: deviceId,
      test: true,
      message: 'Test command from Plant Management Dashboard',
      timestamp: Date.now()
    };

    // Use ESP32-expected topic format
    const topic = `esp32_${deviceId}/commands`;
    
    console.log('🧪 Sending test command to device:', deviceId);
    console.log('📤 Publishing to MQTT topic:', topic);
    console.log('📋 Test payload:', JSON.stringify(testMessage));
    
    mqttClient.publish(topic, JSON.stringify(testMessage), (err) => {
      if (err) {
        console.error('❌ Test command MQTT error:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to send test command',
          error: err.message
        });
      }

      console.log('✅ Test command sent successfully');
      res.json({
        success: true,
        message: 'Test command sent successfully',
        deviceId: deviceId,
        topic: topic,
        data: testMessage
      });
    });

  } catch (error) {
    console.error('❌ Error in test-command endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
