const express = require('express');
const mqtt = require('mqtt');
const router = express.Router();

// MQTT Client for sending commands to ESP32 devices
let mqttClient = null;

// Initialize MQTT client
const connectMQTT = () => {
  try {
    mqttClient = mqtt.connect('mqtt://10.201.52.213:1883');
    
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

// In-memory storage for plants (will move to database later)
let plants = [
  {
    id: 1,
    name: "Cherry Tomatoes",
    type: "tomato",
    description: "Sweet cherry tomato variety perfect for containers",
    stage: "growing",
    thresholds: {
      temperature: { min: 18, max: 30, ideal_min: 20, ideal_max: 25 },
      humidity: { min: 60, max: 80, ideal_min: 65, ideal_max: 75 },
      soil_moisture: { min: 40, max: 80, ideal_min: 60, ideal_max: 70 },
      light: { min: 300, max: 800, ideal_min: 400, ideal_max: 600 }
    },
    plantedDate: new Date().toISOString(),
    estimatedHarvest: "2024-12-01",
    assignedDevice: null
  },
  {
    id: 2,
    name: "Butter Lettuce",
    type: "lettuce",
    description: "Tender butter lettuce with soft leaves",
    stage: "growing",
    thresholds: {
      temperature: { min: 15, max: 25, ideal_min: 18, ideal_max: 22 },
      humidity: { min: 50, max: 70, ideal_min: 55, ideal_max: 65 },
      soil_moisture: { min: 50, max: 85, ideal_min: 65, ideal_max: 75 },
      light: { min: 200, max: 500, ideal_min: 250, ideal_max: 400 }
    },
    plantedDate: new Date().toISOString(),
    estimatedHarvest: "2024-10-15",
    assignedDevice: null
  },
  {
    id: 3,
    name: "Sweet Basil",
    type: "basil",
    description: "Aromatic sweet basil for cooking",
    stage: "flowering",
    thresholds: {
      temperature: { min: 20, max: 35, ideal_min: 22, ideal_max: 28 },
      humidity: { min: 40, max: 65, ideal_min: 45, ideal_max: 60 },
      soil_moisture: { min: 35, max: 70, ideal_min: 45, ideal_max: 60 },
      light: { min: 400, max: 1000, ideal_min: 500, ideal_max: 800 }
    },
    plantedDate: new Date().toISOString(),
    estimatedHarvest: "2024-11-01",
    assignedDevice: null
  }
];

let devicePlantAssignments = [
  { deviceId: 1, plantId: 1 }, // ESP32 Device #1 growing Tomato
  { deviceId: 2, plantId: 2 }  // ESP32 Device #2 growing Lettuce
];

// Get all plants
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: plants
  });
});

// Get plant by ID
router.get('/:id', (req, res) => {
  const plant = plants.find(p => p.id === parseInt(req.params.id));
  if (!plant) {
    return res.status(404).json({
      success: false,
      message: 'Plant not found'
    });
  }
  res.json({
    success: true,
    data: plant
  });
});

// Add new plant
router.post('/', (req, res) => {
  const newPlant = {
    id: Math.max(...plants.map(p => p.id), 0) + 1,
    name: req.body.name,
    type: req.body.type,
    description: req.body.description || '',
    stage: req.body.stage || 'seedling',
    thresholds: req.body.thresholds,
    plantedDate: new Date().toISOString(),
    estimatedHarvest: req.body.estimatedHarvest || '',
    assignedDevice: null
  };

  plants.push(newPlant);

  res.json({
    success: true,
    message: 'Plant added successfully',
    data: newPlant
  });
});

// Update plant
router.put('/:id', (req, res) => {
  const plantIndex = plants.findIndex(p => p.id === parseInt(req.params.id));
  if (plantIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Plant not found'
    });
  }

  // Update plant data
  plants[plantIndex] = {
    ...plants[plantIndex],
    name: req.body.name,
    type: req.body.type,
    description: req.body.description,
    stage: req.body.stage,
    thresholds: req.body.thresholds
  };

  res.json({
    success: true,
    message: 'Plant updated successfully',
    data: plants[plantIndex]
  });
});

// Delete plant
router.delete('/:id', (req, res) => {
  const plantIndex = plants.findIndex(p => p.id === parseInt(req.params.id));
  if (plantIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Plant not found'
    });
  }

  // Remove device assignment if any
  if (plants[plantIndex].assignedDevice) {
    // You might want to update the devices array here too
  }

  plants.splice(plantIndex, 1);

  res.json({
    success: true,
    message: 'Plant deleted successfully'
  });
});

// Assign device to plant
router.post('/:id/assign-device', (req, res) => {
  const plantId = parseInt(req.params.id);
  const { deviceId } = req.body;
  
  const plantIndex = plants.findIndex(p => p.id === plantId);
  if (plantIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Plant not found'
    });
  }

  // If deviceId is null, we're unassigning
  if (deviceId === null || deviceId === undefined) {
    plants[plantIndex].assignedDevice = null;
    res.json({
      success: true,
      message: 'Device unassigned from plant successfully',
      data: plants[plantIndex]
    });
    return;
  }

  // Remove device from any other plant first
  plants.forEach(plant => {
    if (plant.assignedDevice === deviceId) {
      plant.assignedDevice = null;
    }
  });

  // Assign device to this plant
  plants[plantIndex].assignedDevice = deviceId;

  res.json({
    success: true,
    message: 'Device assigned to plant successfully',
    data: plants[plantIndex]
  });
});

// Send thresholds to ESP32 device
router.post('/:id/send-thresholds', (req, res) => {
  const plantId = parseInt(req.params.id);
  const plant = plants.find(p => p.id === plantId);
  
  if (!plant) {
    return res.status(404).json({
      success: false,
      message: 'Plant not found'
    });
  }

  if (!plant.assignedDevice) {
    return res.status(400).json({
      success: false,
      message: 'No device assigned to this plant'
    });
  }

  // Send MQTT command to ESP32
  const deviceId = plant.assignedDevice;
  const commandTopic = `esp32_${deviceId}/commands`;
  
  const thresholdCommand = {
    command: 'update_thresholds',
    plant_name: plant.name,
    plant_type: plant.type,
    thresholds: plant.thresholds,
    timestamp: new Date().toISOString()
  };

  if (mqttClient && mqttClient.connected) {
    mqttClient.publish(commandTopic, JSON.stringify(thresholdCommand), (error) => {
      if (error) {
        console.error('❌ Failed to send thresholds to ESP32:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to send thresholds to device'
        });
      }

      console.log(`✅ Thresholds sent to ESP32 Device ${deviceId} for ${plant.name}`);
      console.log(`📡 Topic: ${commandTopic}`);
      console.log(`📊 Data:`, thresholdCommand);

      res.json({
        success: true,
        message: `Thresholds sent to ESP32 Device ${deviceId} successfully`,
        data: {
          deviceId,
          plant: plant.name,
          topic: commandTopic,
          thresholds: plant.thresholds
        }
      });
    });
  } else {
    console.error('❌ MQTT client not connected');
    return res.status(500).json({
      success: false,
      message: 'MQTT client not connected. Cannot send commands to device.'
    });
  }
});

// Test MQTT command sending
router.post('/test-command', (req, res) => {
  const { deviceId } = req.body;
  
  const commandTopic = `esp32_${deviceId}/commands`;
  const testCommand = {
    command: 'reset_thresholds',
    test: true,
    timestamp: new Date().toISOString()
  };

  console.log(`🧪 Sending test command to device ${deviceId}`);
  console.log(`📡 Topic: ${commandTopic}`);
  console.log(`📊 Command:`, testCommand);

  if (mqttClient && mqttClient.connected) {
    mqttClient.publish(commandTopic, JSON.stringify(testCommand), (error) => {
      if (error) {
        console.error('❌ Failed to send test command:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to send test command'
        });
      }

      console.log(`✅ Test command sent successfully to device ${deviceId}`);
      res.json({
        success: true,
        message: `Test command sent to ESP32 Device ${deviceId}`
      });
    });
  } else {
    console.error('❌ MQTT client not connected');
    res.status(500).json({
      success: false,
      message: 'MQTT client not connected'
    });
  }
});

// Broadcast thresholds to all devices (optional endpoint)
router.post('/broadcast-thresholds', (req, res) => {
  const plantsWithDevices = plants.filter(plant => plant.assignedDevice);
  
  if (plantsWithDevices.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No plants have assigned devices'
    });
  }

  let sentCount = 0;
  let errors = [];

  plantsWithDevices.forEach(plant => {
    const deviceId = plant.assignedDevice;
    const commandTopic = `esp32_${deviceId}/commands`;
    
    const thresholdCommand = {
      command: 'update_thresholds',
      plant_name: plant.name,
      plant_type: plant.type,
      thresholds: plant.thresholds,
      timestamp: new Date().toISOString()
    };

    if (mqttClient && mqttClient.connected) {
      mqttClient.publish(commandTopic, JSON.stringify(thresholdCommand), (error) => {
        if (error) {
          errors.push(`Device ${deviceId}: ${error.message}`);
        } else {
          sentCount++;
          console.log(`✅ Thresholds sent to ESP32 Device ${deviceId} for ${plant.name}`);
        }
      });
    } else {
      errors.push(`Device ${deviceId}: MQTT client not connected`);
    }
  });

  res.json({
    success: errors.length === 0,
    message: `Thresholds sent to ${sentCount} devices. ${errors.length} errors.`,
    data: {
      sentCount,
      totalDevices: plantsWithDevices.length,
      errors
    }
  });
});

// Test MQTT connection endpoint
router.get('/mqtt-status', (req, res) => {
  res.json({
    success: true,
    data: {
      connected: mqttClient ? mqttClient.connected : false,
      status: mqttClient ? 'Client initialized' : 'Client not initialized'
    }
  });
});

// Get all device-plant assignments
router.get('/assignments', (req, res) => {
  const assignments = devicePlantAssignments.map(assignment => {
    const plant = plants.find(p => p.id === assignment.plantId);
    return {
      ...assignment,
      plant
    };
  });

  res.json({
    success: true,
    data: assignments
  });
});

// Get plant for specific device
router.get('/device/:deviceId', (req, res) => {
  const assignment = devicePlantAssignments.find(a => a.deviceId === parseInt(req.params.deviceId));
  if (!assignment) {
    return res.json({
      success: true,
      data: null,
      message: 'No plant assigned to this device'
    });
  }

  const plant = plants.find(p => p.id === assignment.plantId);
  
  res.json({
    success: true,
    data: plant
  });
});

module.exports = router;
