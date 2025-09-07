const express = require('express');
const thresholdMonitoringService = require('../services/ThresholdMonitoringService');
const Plant = require('../models/Plant');
const Alert = require('../models/Alert');
const router = express.Router();

// In-memory storage for historical sensor data
let sensorDataHistory = [];

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
  console.log('📊 GET /api/sensors - Fetching ESP32 devices...');
  try {
    console.log(`📋 Found ${esp32Devices.length} ESP32 devices`);
    res.json({
      success: true,
      data: esp32Devices,
      count: esp32Devices.length
    });
  } catch (error) {
    console.error('❌ Error in GET /api/sensors:', error);
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

// Get historical sensor data
router.get('/historical', async (req, res) => {
  try {
    const { device, range = '24h' } = req.query;
    
    console.log(`📈 GET /api/sensors/historical - Device: ${device}, Range: ${range}`);
    
    // Calculate time range
    const now = new Date();
    let startTime = new Date();
    
    switch (range) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    // Filter historical data
    let filteredData = sensorDataHistory.filter(data => {
      const dataTime = new Date(data.timestamp);
      return (!device || data.deviceId == device) && 
             dataTime >= startTime && 
             dataTime <= now;
    });
    
    // Group data by time intervals for better visualization
    // Custom interval support via query parameter
    const customInterval = parseInt(req.query.interval) || null;
    const intervalMinutes = customInterval || (range === '1h' ? 2 : range === '6h' ? 10 : range === '24h' ? 30 : 60);
    const groupedData = groupDataByInterval(filteredData, intervalMinutes);
    
    console.log(`📊 Returning ${groupedData.length} data points for device ${device} (${range})`);
    
    res.json({
      success: true,
      data: groupedData,
      range: range,
      deviceId: device,
      totalPoints: groupedData.length
    });
  } catch (error) {
    console.error('❌ Error fetching historical data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get sensor data optimized for graphing with specific intervals
router.get('/graph', (req, res) => {
  try {
    const { device, range = '1h', interval, sensor_types } = req.query;
    
    console.log(`📈 GET /api/sensors/graph - Device: ${device}, Range: ${range}, Interval: ${interval}min`);
    
    if (!device) {
      return res.status(400).json({ 
        success: false, 
        error: 'Device ID is required' 
      });
    }
    
    const now = new Date();
    let startTime;
    
    // Parse time range
    switch(range) {
      case '15m': startTime = new Date(now.getTime() - 15 * 60 * 1000); break;
      case '30m': startTime = new Date(now.getTime() - 30 * 60 * 1000); break;
      case '1h': startTime = new Date(now.getTime() - 60 * 60 * 1000); break;
      case '6h': startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000); break;
      case '12h': startTime = new Date(now.getTime() - 12 * 60 * 60 * 1000); break;
      case '24h': startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case '3d': startTime = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); break;
      case '7d': startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      default: startTime = new Date(now.getTime() - 60 * 60 * 1000);
    }
    
    // Filter data
    let filteredData = sensorDataHistory.filter(data => {
      const dataTime = new Date(data.timestamp);
      return data.deviceId == device && 
             dataTime >= startTime && 
             dataTime <= now;
    });
    
    // Determine optimal interval for graph accuracy
    let intervalMinutes;
    if (interval) {
      intervalMinutes = parseInt(interval);
    } else {
      // Auto-determine optimal interval based on range
      switch(range) {
        case '15m': intervalMinutes = 1; break;  // 1-minute intervals
        case '30m': intervalMinutes = 2; break;  // 2-minute intervals
        case '1h': intervalMinutes = 2; break;   // 2-minute intervals
        case '6h': intervalMinutes = 5; break;   // 5-minute intervals
        case '12h': intervalMinutes = 10; break; // 10-minute intervals
        case '24h': intervalMinutes = 15; break; // 15-minute intervals
        case '3d': intervalMinutes = 30; break;  // 30-minute intervals
        case '7d': intervalMinutes = 60; break;  // 1-hour intervals
        default: intervalMinutes = 2;
      }
    }
    
    // Filter by specific sensor types if requested
    const requestedSensorTypes = sensor_types ? sensor_types.split(',') : ['temperature', 'humidity', 'soil_moisture', 'light'];
    
    const groupedData = groupDataByInterval(filteredData, intervalMinutes, requestedSensorTypes);
    
    // Calculate data quality metrics
    const totalExpectedPoints = Math.ceil((now - startTime) / (intervalMinutes * 60 * 1000));
    const actualPoints = groupedData.length;
    const dataCompleteness = totalExpectedPoints > 0 ? (actualPoints / totalExpectedPoints * 100).toFixed(1) : 0;
    
    console.log(`📊 Graph data: ${actualPoints}/${totalExpectedPoints} points (${dataCompleteness}% complete) for device ${device}`);
    
    res.json({
      success: true,
      data: groupedData,
      metadata: {
        device_id: device,
        range: range,
        interval_minutes: intervalMinutes,
        start_time: startTime.toISOString(),
        end_time: now.toISOString(),
        total_points: actualPoints,
        expected_points: totalExpectedPoints,
        data_completeness: `${dataCompleteness}%`,
        sensor_types: requestedSensorTypes
      }
    });
  } catch (error) {
    console.error('❌ Error fetching graph data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to group data by intervals
function groupDataByInterval(data, intervalMinutes, sensorTypes = ['temperature', 'humidity', 'soil_moisture', 'light']) {
  const grouped = {};
  
  data.forEach(reading => {
    const time = new Date(reading.timestamp);
    const intervalKey = new Date(
      time.getFullYear(),
      time.getMonth(),
      time.getDate(),
      time.getHours(),
      Math.floor(time.getMinutes() / intervalMinutes) * intervalMinutes
    ).toISOString();
    
    if (!grouped[intervalKey]) {
      grouped[intervalKey] = {
        timestamp: intervalKey,
        temperature: [],
        humidity: [],
        soil_moisture: [],
        light_level: []
      };
    }
    
    // Only process requested sensor types
    if (sensorTypes.includes('temperature') && reading.temperature !== undefined) {
      grouped[intervalKey].temperature.push(reading.temperature);
    }
    if (sensorTypes.includes('humidity') && reading.humidity !== undefined) {
      grouped[intervalKey].humidity.push(reading.humidity);
    }
    if (sensorTypes.includes('soil_moisture') && reading.soil_moisture !== undefined) {
      grouped[intervalKey].soil_moisture.push(reading.soil_moisture);
    }
    if (sensorTypes.includes('light') && reading.light !== undefined) {
      grouped[intervalKey].light_level.push(reading.light);
    }
  });
  
  // Average the values for each interval and only include requested sensor types
  return Object.values(grouped).map(interval => {
    const result = { timestamp: interval.timestamp };
    
    if (sensorTypes.includes('temperature')) {
      result.temperature = interval.temperature.length > 0 ? 
        interval.temperature.reduce((a, b) => a + b, 0) / interval.temperature.length : null;
    }
    if (sensorTypes.includes('humidity')) {
      result.humidity = interval.humidity.length > 0 ? 
        interval.humidity.reduce((a, b) => a + b, 0) / interval.humidity.length : null;
    }
    if (sensorTypes.includes('soil_moisture')) {
      result.soil_moisture = interval.soil_moisture.length > 0 ? 
        interval.soil_moisture.reduce((a, b) => a + b, 0) / interval.soil_moisture.length : null;
    }
    if (sensorTypes.includes('light')) {
      result.light_level = interval.light_level.length > 0 ? 
        interval.light_level.reduce((a, b) => a + b, 0) / interval.light_level.length : null;
    }
    
    return result;
  }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// Export devices for use in other modules
module.exports.devices = esp32Devices;

// Function to handle incoming MQTT sensor data
const handleSensorData = async (deviceId, sensorType, value) => {
  try {
    const timestamp = new Date().toISOString();
    
    // Create sensor data record with correct format for retrieval
    const sensorRecord = {
      device_id: parseInt(deviceId),
      sensor_type: sensorType,
      value: parseFloat(value),
      timestamp: timestamp
    };
    
    sensorDataHistory.push(sensorRecord);
    
    // Keep only last 30 days of data (limit memory usage)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    sensorDataHistory = sensorDataHistory.filter(
      data => new Date(data.timestamp).getTime() > thirtyDaysAgo
    );
    
    // Update threshold monitoring service with new data
    thresholdMonitoringService.updateSensorData(deviceId, sensorType, value);
    
    // Check for alerts
    await checkAndCreateAlerts(deviceId, sensorType, value);
    
    // Count records for this device
    const deviceRecords = sensorDataHistory.filter(d => d.device_id == deviceId);
    console.log(`📊 Sensor data stored: Device ${deviceId}/${sensorType} = ${value} (${deviceRecords.length} device records, ${sensorDataHistory.length} total)`);
  } catch (error) {
    console.error('❌ Error handling sensor data:', error);
  }
};

// Function to check and create alerts
async function checkAndCreateAlerts(deviceId, sensorType, value) {
  try {
    // Find the device and its assigned plant
    const device = esp32Devices.find(d => d.id == deviceId);
    if (!device || !device.assignedPlant) {
      return; // No plant assigned, no alerts needed
    }
    
    const plant = await Plant.findById(device.assignedPlant);
    if (!plant) {
      return;
    }
    
    const thresholds = plant.thresholds[sensorType];
    if (!thresholds) {
      return;
    }
    
    let alertData = null;
    
    // Check if value is outside ideal range
    if (value < thresholds.ideal_min) {
      alertData = {
        severity: value < thresholds.min ? 'critical' : 'warning',
        title: `Low ${sensorType.replace('_', ' ')} Alert`,
        message: `${plant.name} ${sensorType.replace('_', ' ')} is ${value} (below ideal range: ${thresholds.ideal_min}-${thresholds.ideal_max})`
      };
    } else if (value > thresholds.ideal_max) {
      alertData = {
        severity: value > thresholds.max ? 'critical' : 'warning',
        title: `High ${sensorType.replace('_', ' ')} Alert`,
        message: `${plant.name} ${sensorType.replace('_', ' ')} is ${value} (above ideal range: ${thresholds.ideal_min}-${thresholds.ideal_max})`
      };
    }
    
    if (alertData) {
      // Create alert
      const alert = new Alert({
        plant: plant._id,
        deviceId: deviceId,
        type: sensorType,
        severity: alertData.severity,
        title: alertData.title,
        message: alertData.message,
        sensorValue: value,
        threshold: thresholds
      });
      
      // Check if similar alert exists in last 10 minutes
      const recentAlert = await Alert.findOne({
        plant: plant._id,
        type: sensorType,
        acknowledged: false,
        createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) }
      });
      
      if (!recentAlert) {
        await alert.save();
        console.log(`🚨 ${alertData.severity.toUpperCase()} Alert created: ${alertData.title}`);
      }
    }
  } catch (error) {
    console.error('❌ Error checking alerts:', error);
  }
}

// Get latest sensor data for a specific device and sensor type
router.get('/latest/:deviceId/:sensorType', (req, res) => {
  try {
    const { deviceId, sensorType } = req.params;
    const deviceIdNum = parseInt(deviceId);
    
    console.log(`📊 GET /api/sensors/latest/${deviceId}/${sensorType} - Fetching latest sensor data...`);
    
    // Find the most recent sensor data for this device and sensor type
    const latestData = sensorDataHistory
      .filter(data => data.device_id === deviceIdNum && data.sensor_type === sensorType)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    if (latestData) {
      console.log(`📈 Latest ${sensorType} data for device ${deviceId}: ${latestData.value}`);
      res.json({
        success: true,
        data: {
          value: latestData.value,
          timestamp: latestData.timestamp,
          deviceId: deviceIdNum,
          sensorType: sensorType
        }
      });
    } else {
      console.log(`⚠️ No data found for device ${deviceId}, sensor ${sensorType}`);
      res.json({
        success: false,
        message: 'No sensor data found',
        data: null
      });
    }
  } catch (error) {
    console.error('❌ Error fetching latest sensor data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching latest sensor data',
      error: error.message
    });
  }
});

// Export the handler function
module.exports.handleSensorData = handleSensorData;

// Register this handler with the MQTT service
const registerWithMQTTService = () => {
  try {
    const mqttSensorService = require('../services/MQTTSensorService');
    mqttSensorService.setSensorDataHandler(handleSensorData);
    console.log('✅ Sensor data handler registered with MQTT service');
  } catch (error) {
    console.warn('⚠️ Could not register with MQTT service:', error.message);
  }
};

// Call registration immediately
registerWithMQTTService();

module.exports = router;