const ThresholdBreach = require('../models/ThresholdBreach');
const PlantType = require('../models/PlantType');

class ThresholdMonitoringService {
  constructor() {
    this.monitoringInterval = null;
    this.intervalDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
    this.lastSensorData = new Map(); // Store latest sensor readings
  }

  // Start the monitoring service
  start() {
    if (this.monitoringInterval) {
      console.log('⚠️  Threshold monitoring already running');
      return;
    }

    console.log('🔍 Starting threshold monitoring service (5-minute intervals)');
    this.monitoringInterval = setInterval(() => {
      this.checkThresholds();
    }, this.intervalDuration);

    // Run initial check
    this.checkThresholds();
  }

  // Stop the monitoring service
  stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🛑 Threshold monitoring service stopped');
    }
  }

  // Update sensor data (called when new MQTT data arrives)
  updateSensorData(deviceId, sensorType, value) {
    const key = `${deviceId}_${sensorType}`;
    this.lastSensorData.set(key, {
      deviceId,
      sensorType,
      value,
      timestamp: new Date()
    });
  }

  // Main threshold checking function
  async checkThresholds() {
    try {
      // Get all plants with their thresholds
      const plants = await this.getAllPlantsWithThresholds();
      
      for (const plant of plants) {
        await this.checkPlantThresholds(plant);
      }
    } catch (error) {
      console.error('❌ Error in threshold monitoring:', error);
    }
  }

  // Get all plants with their associated plant types and thresholds
  async getAllPlantsWithThresholds() {
    // This would need to be updated based on your plant storage system
    // For now, we'll simulate with the sensor devices we have
    const plants = [
      {
        id: 'plant_1',
        name: 'Tomato Plant 1',
        deviceId: 'esp32_1',
        plantType: 'tomato'
      },
      {
        id: 'plant_2', 
        name: 'Lettuce Plant 1',
        deviceId: 'esp32_2',
        plantType: 'lettuce'
      }
    ];

    // Fetch plant type data with thresholds
    const plantsWithThresholds = [];
    for (const plant of plants) {
      try {
        const plantType = await PlantType.findOne({ type: plant.plantType });
        if (plantType && plantType.defaultThresholds) {
          plantsWithThresholds.push({
            ...plant,
            thresholds: plantType.defaultThresholds
          });
        }
      } catch (error) {
        console.error(`❌ Error fetching plant type for ${plant.plantType}:`, error);
      }
    }

    return plantsWithThresholds;
  }

  // Check thresholds for a specific plant
  async checkPlantThresholds(plant) {
    const sensorTypes = ['temperature', 'humidity', 'soil_moisture', 'light'];
    
    for (const sensorType of sensorTypes) {
      const key = `${plant.deviceId}_${sensorType}`;
      const sensorData = this.lastSensorData.get(key);
      
      if (!sensorData) {
        continue; // No data available for this sensor
      }

      // Check if data is recent (within last 10 minutes)
      const dataAge = Date.now() - sensorData.timestamp.getTime();
      if (dataAge > 10 * 60 * 1000) {
        continue; // Data too old
      }

      const thresholds = plant.thresholds[sensorType];
      if (!thresholds) {
        continue; // No thresholds defined for this sensor type
      }

      await this.evaluateThreshold(plant, sensorType, sensorData.value, thresholds);
    }
  }

  // Evaluate if a threshold is breached
  async evaluateThreshold(plant, sensorType, value, thresholds) {
    const breaches = [];

    // Check critical thresholds first
    if (value < thresholds.min) {
      breaches.push({
        type: 'below_min',
        severity: 'critical',
        message: `${sensorType} is critically low: ${value} (minimum: ${thresholds.min})`
      });
    } else if (value > thresholds.max) {
      breaches.push({
        type: 'above_max',
        severity: 'critical',
        message: `${sensorType} is critically high: ${value} (maximum: ${thresholds.max})`
      });
    } else {
      // Check ideal range if not in critical range
      if (value < thresholds.ideal_min) {
        breaches.push({
          type: 'below_ideal',
          severity: 'warning',
          message: `${sensorType} is below ideal range: ${value} (ideal minimum: ${thresholds.ideal_min})`
        });
      } else if (value > thresholds.ideal_max) {
        breaches.push({
          type: 'above_ideal',
          severity: 'warning',
          message: `${sensorType} is above ideal range: ${value} (ideal maximum: ${thresholds.ideal_max})`
        });
      }
    }

    // Store any breaches found
    for (const breach of breaches) {
      await this.storeBreach(plant, sensorType, value, thresholds, breach);
    }

    // If no breaches, mark any existing active breaches as resolved
    if (breaches.length === 0) {
      await this.resolveActiveBreaches(plant.deviceId, sensorType);
    }
  }

  // Store a threshold breach
  async storeBreach(plant, sensorType, value, thresholds, breach) {
    try {
      // Check if similar breach already exists and is active
      const existingBreach = await ThresholdBreach.findOne({
        deviceId: plant.deviceId,
        sensorType: sensorType,
        breachType: breach.type,
        isActive: true
      });

      if (existingBreach) {
        // Update existing breach with latest value and timestamp
        existingBreach.currentValue = value;
        existingBreach.updatedAt = new Date();
        await existingBreach.save();
        return;
      }

      // Create new breach record
      const thresholdBreach = new ThresholdBreach({
        sensorId: `${plant.deviceId}_${sensorType}`,
        deviceId: plant.deviceId,
        plantId: plant.id,
        sensorType: sensorType,
        currentValue: value,
        thresholds: thresholds,
        breachType: breach.type,
        severity: breach.severity,
        message: breach.message
      });

      await thresholdBreach.save();
      console.log(`🚨 Threshold breach detected: ${breach.message}`);
    } catch (error) {
      console.error('❌ Error storing threshold breach:', error);
    }
  }

  // Resolve active breaches for a sensor
  async resolveActiveBreaches(deviceId, sensorType) {
    try {
      await ThresholdBreach.updateMany(
        {
          deviceId: deviceId,
          sensorType: sensorType,
          isActive: true
        },
        {
          isActive: false,
          resolvedAt: new Date()
        }
      );
    } catch (error) {
      console.error('❌ Error resolving threshold breaches:', error);
    }
  }

  // Get threshold breach history
  async getBreachHistory(filters = {}) {
    try {
      const query = {};
      
      if (filters.deviceId) query.deviceId = filters.deviceId;
      if (filters.plantId) query.plantId = filters.plantId;
      if (filters.sensorType) query.sensorType = filters.sensorType;
      if (filters.severity) query.severity = filters.severity;
      if (filters.isActive !== undefined) query.isActive = filters.isActive;

      const breaches = await ThresholdBreach.find(query)
        .sort({ createdAt: -1 })
        .limit(filters.limit || 100);

      return breaches;
    } catch (error) {
      console.error('❌ Error fetching breach history:', error);
      return [];
    }
  }

  // Get active breaches
  async getActiveBreaches() {
    return this.getBreachHistory({ isActive: true });
  }
}

module.exports = new ThresholdMonitoringService();
