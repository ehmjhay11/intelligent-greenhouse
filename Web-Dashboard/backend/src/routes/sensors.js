const express = require('express');
const router = express.Router();

// In-memory storage for ESP32 devices
let esp32Devices = [
  {
    id: 1,
    name: 'ESP32 Device #1',
    location: 'Greenhouse Section A',
    ipAddress: '10.146.132.213',
    isActive: true,
    assignedPlant: null,
    createdAt: new Date().toISOString(),
    sensors: [
      { 
        id: 1, 
        name: 'Soil Moisture Sensor', 
        type: 'soil_moisture', 
        mqttTopic: 'esp32_1/soil_moisture',
        pin: 'A0',
        isActive: true
      },
      { 
        id: 2, 
        name: 'Temperature Sensor', 
        type: 'temperature', 
        mqttTopic: 'esp32_1/temperature',
        pin: 'D4',
        isActive: true
      },
      { 
        id: 3, 
        name: 'Humidity Sensor', 
        type: 'humidity', 
        mqttTopic: 'esp32_1/humidity',
        pin: 'D5',
        isActive: true
      },
      { 
        id: 4, 
        name: 'Light Sensor', 
        type: 'light', 
        mqttTopic: 'esp32_1/light',
        pin: 'A1',
        isActive: true
      }
    ]
  },
  {
    id: 2,
    name: 'ESP32 Device #2',
    location: 'Greenhouse Section B',
    ipAddress: '10.146.132.214',
    isActive: true,
    assignedPlant: null,
    createdAt: new Date().toISOString(),
    sensors: [
      { 
        id: 5, 
        name: 'Soil Moisture Sensor B', 
        type: 'soil_moisture', 
        mqttTopic: 'esp32_2/soil_moisture',
        pin: 'A0',
        isActive: true
      },
      { 
        id: 6, 
        name: 'Temperature Sensor B', 
        type: 'temperature', 
        mqttTopic: 'esp32_2/temperature',
        pin: 'D4',
        isActive: true
      },
      { 
        id: 7, 
        name: 'Humidity Sensor B', 
        type: 'humidity', 
        mqttTopic: 'esp32_2/humidity',
        pin: 'D4',
        isActive: true
      },
      { 
        id: 8, 
        name: 'Light Sensor B', 
        type: 'light', 
        mqttTopic: 'esp32_2/light',
        pin: 'A1',
        isActive: true
      }
    ]
  }
];

// Get all ESP32 devices with their sensors
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: esp32Devices,
      count: esp32Devices.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ESP32 devices',
      error: error.message
    });
  }
});

// Get all sensors from all devices (flattened)
router.get('/sensors', (req, res) => {
  try {
    const allSensors = esp32Devices.reduce((acc, device) => {
      const deviceSensors = device.sensors.map(sensor => ({
        ...sensor,
        deviceId: device.id,
        deviceName: device.name,
        deviceLocation: device.location
      }));
      return [...acc, ...deviceSensors];
    }, []);

    res.json({
      success: true,
      data: allSensors,
      count: allSensors.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sensors',
      error: error.message
    });
  }
});

// Add new ESP32 device
router.post('/', (req, res) => {
  try {
    const { name, location, ipAddress } = req.body;
    
    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: 'Device name and location are required'
      });
    }
    
    const deviceId = Math.max(...esp32Devices.map(d => d.id), 0) + 1;
    
    const newDevice = {
      id: deviceId,
      name: name.trim(),
      location: location.trim(),
      ipAddress: ipAddress || '',
      isActive: true,
      createdAt: new Date().toISOString(),
      sensors: [
        {
          id: 1,
          name: 'Soil Moisture Sensor',
          type: 'soil_moisture',
          mqttTopic: `esp32_${deviceId}/soil_moisture`,
          pin: 'A0',
          isActive: true
        },
        {
          id: 2,
          name: 'Temperature Sensor',
          type: 'temperature',
          mqttTopic: `esp32_${deviceId}/temperature`,
          pin: 'D4',
          isActive: true
        },
        {
          id: 3,
          name: 'Humidity Sensor',
          type: 'humidity',
          mqttTopic: `esp32_${deviceId}/humidity`,
          pin: 'D5',
          isActive: true
        },
        {
          id: 4,
          name: 'Light Sensor',
          type: 'light',
          mqttTopic: `esp32_${deviceId}/light`,
          pin: 'A1',
          isActive: true
        }
      ]
    };
    
    esp32Devices.push(newDevice);
    
    res.status(201).json({
      success: true,
      message: 'ESP32 device added successfully',
      data: newDevice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding ESP32 device',
      error: error.message
    });
  }
});

// Delete ESP32 device
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deviceIndex = esp32Devices.findIndex(d => d.id === id);
    
    if (deviceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'ESP32 device not found'
      });
    }
    
    const deletedDevice = esp32Devices[deviceIndex];
    esp32Devices = esp32Devices.filter(d => d.id !== id);
    
    res.json({
      success: true,
      message: 'ESP32 device deleted successfully',
      data: deletedDevice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting ESP32 device',
      error: error.message
    });
  }
});

// Toggle sensor within a device
router.put('/:deviceId/sensors/:sensorId/toggle', (req, res) => {
  try {
    const deviceId = parseInt(req.params.deviceId);
    const sensorId = parseInt(req.params.sensorId);
    
    const device = esp32Devices.find(d => d.id === deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'ESP32 device not found'
      });
    }
    
    const sensor = device.sensors.find(s => s.id === sensorId);
    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }
    
    sensor.isActive = !sensor.isActive;
    
    res.json({
      success: true,
      message: `Sensor ${sensor.isActive ? 'enabled' : 'disabled'} successfully`,
      data: sensor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling sensor',
      error: error.message
    });
  }
});

// Update device assignment
router.put('/:id/assignment', (req, res) => {
  const deviceId = parseInt(req.params.id);
  const { assignedPlant } = req.body;
  
  const deviceIndex = esp32Devices.findIndex(d => d.id === deviceId);
  if (deviceIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Device not found'
    });
  }

  // Remove assignment from other devices first
  esp32Devices.forEach(device => {
    if (device.assignedPlant === assignedPlant && device.id !== deviceId) {
      device.assignedPlant = null;
    }
  });

  // Update device assignment
  esp32Devices[deviceIndex].assignedPlant = assignedPlant;

  res.json({
    success: true,
    message: 'Device assignment updated successfully',
    data: esp32Devices[deviceIndex]
  });
});

// Export devices for use in other modules
module.exports.devices = esp32Devices;

module.exports = router;