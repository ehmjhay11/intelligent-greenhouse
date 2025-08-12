const axios = require('axios');

// Test data generator for alerts and historical data
class TestDataGenerator {
  constructor() {
    this.baseUrl = 'http://localhost:3003/api';
    this.deviceId = 1;
  }

  // Generate realistic sensor values with some variation
  generateSensorData() {
    const timestamp = new Date().toISOString();
    
    // Base values with some randomness
    const temperature = 22 + (Math.random() - 0.5) * 20; // 12-32°C
    const humidity = 65 + (Math.random() - 0.5) * 40; // 45-85%
    const soil_moisture = 60 + (Math.random() - 0.5) * 50; // 35-85%
    const light_level = 50 + (Math.random() - 0.5) * 60; // 20-80

    return {
      timestamp,
      deviceId: this.deviceId,
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity * 10) / 10,
      soil_moisture: Math.round(soil_moisture),
      light_level: Math.round(light_level)
    };
  }

  // Simulate receiving MQTT data by calling the sensor data handler
  async simulateSensorData() {
    try {
      const data = this.generateSensorData();
      
      console.log(`🧪 Simulating sensor data for Device ${data.deviceId}:`);
      console.log(`   🌡️ Temperature: ${data.temperature}°C`);
      console.log(`   💧 Humidity: ${data.humidity}%`);
      console.log(`   🌱 Soil: ${data.soil_moisture}%`);
      console.log(`   ☀️ Light: ${data.light_level}`);

      // You can send this data to your MQTT broker or directly to the sensor handler
      // For now, we'll just log it and you can integrate with your MQTT system
      
    } catch (error) {
      console.error('❌ Error simulating sensor data:', error.message);
    }
  }

  // Generate historical data for the last few hours
  async generateHistoricalData(hours = 6) {
    console.log(`📊 Generating ${hours} hours of historical data...`);
    
    const data = [];
    const now = Date.now();
    const intervalMs = 5 * 60 * 1000; // 5 minutes
    
    for (let i = hours * 12; i >= 0; i--) {
      const timestamp = new Date(now - (i * intervalMs));
      
      // Generate data with some trends
      const temperature = 20 + Math.sin(i * 0.1) * 5 + (Math.random() - 0.5) * 3;
      const humidity = 60 + Math.cos(i * 0.08) * 15 + (Math.random() - 0.5) * 5;
      const soil_moisture = 55 + Math.sin(i * 0.05) * 20 + (Math.random() - 0.5) * 5;
      const light_level = 40 + Math.sin(i * 0.2) * 30 + (Math.random() - 0.5) * 10;
      
      data.push({
        timestamp: timestamp.toISOString(),
        deviceId: this.deviceId,
        temperature: Math.round(temperature * 10) / 10,
        humidity: Math.round(humidity * 10) / 10,
        soil_moisture: Math.round(Math.max(0, Math.min(100, soil_moisture))),
        light_level: Math.round(Math.max(0, Math.min(100, light_level)))
      });
    }
    
    console.log(`✅ Generated ${data.length} historical data points`);
    return data;
  }

  // Test alert creation
  async createTestAlert() {
    try {
      const alertData = {
        plantId: null, // You'll need to set this to an actual plant ID
        deviceId: this.deviceId,
        type: 'temperature',
        severity: 'warning',
        title: 'High Temperature Alert',
        message: 'Temperature is above optimal range for Lettuce',
        sensorValue: 32.5,
        threshold: {
          min: 15,
          max: 35,
          ideal_min: 20,
          ideal_max: 25
        }
      };

      const response = await axios.post(`${this.baseUrl}/alerts/create`, alertData);
      console.log('🚨 Test alert created:', response.data);
    } catch (error) {
      console.error('❌ Error creating test alert:', error.message);
    }
  }

  // Run continuous simulation
  startSimulation(intervalSeconds = 30) {
    console.log(`🚀 Starting sensor data simulation (every ${intervalSeconds} seconds)`);
    console.log('📊 This will generate realistic sensor data and potential alerts');
    console.log('⏹️ Press Ctrl+C to stop\n');

    // Generate initial historical data
    this.generateHistoricalData(6);

    // Start continuous simulation
    setInterval(() => {
      this.simulateSensorData();
    }, intervalSeconds * 1000);
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new TestDataGenerator();
  generator.startSimulation(15); // Every 15 seconds
}

module.exports = TestDataGenerator;
