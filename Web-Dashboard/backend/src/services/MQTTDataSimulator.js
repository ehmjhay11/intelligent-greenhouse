const { handleSensorData } = require('../routes/sensors');

class MQTTDataSimulator {
  constructor() {
    this.isRunning = false;
    this.interval = null;
  }

  start() {
    if (this.isRunning) {
      console.log('📡 MQTT Data Simulator already running');
      return;
    }

    console.log('📡 Starting MQTT Data Simulator...');
    this.isRunning = true;

    // Simulate data every 30 seconds for testing
    this.interval = setInterval(() => {
      this.generateSimulatedData();
    }, 30000);

    // Generate initial data
    this.generateSimulatedData();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('📡 MQTT Data Simulator stopped');
  }

  generateSimulatedData() {
    const devices = ['esp32_1', 'esp32_2'];
    const sensorTypes = ['temperature', 'humidity', 'soil_moisture', 'light'];

    devices.forEach(deviceId => {
      sensorTypes.forEach(sensorType => {
        const value = this.generateSensorValue(sensorType);
        handleSensorData(deviceId, sensorType, value);
      });
    });
  }

  generateSensorValue(sensorType) {
    // Generate realistic sensor values with occasional threshold breaches for testing
    const baseValues = {
      temperature: { base: 22, range: 8, unit: '°C' },
      humidity: { base: 65, range: 20, unit: '%' },
      soil_moisture: { base: 60, range: 30, unit: '%' },
      light: { base: 500, range: 400, unit: 'lux' }
    };

    const config = baseValues[sensorType];
    if (!config) return 0;

    // 10% chance of generating extreme values to trigger threshold breaches
    if (Math.random() < 0.1) {
      // Generate extreme values
      const isHigh = Math.random() < 0.5;
      if (isHigh) {
        return config.base + config.range + Math.random() * config.range;
      } else {
        return Math.max(0, config.base - config.range - Math.random() * config.range);
      }
    }

    // Normal values with some variation
    const variation = (Math.random() - 0.5) * config.range;
    return Math.max(0, config.base + variation);
  }
}

module.exports = new MQTTDataSimulator();
