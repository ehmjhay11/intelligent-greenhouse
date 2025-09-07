const mqtt = require('mqtt');

class MQTTSensorService {
  constructor() {
    this.client = null;
  this.brokerUrl = 'mqtt://10.152.18.213:1883';
    this.isConnected = false;
    this.subscribedTopics = new Set();
    this.handleSensorData = null; // Will be set by the sensors route
  }

  // Set the sensor data handler
  setSensorDataHandler(handler) {
    this.handleSensorData = handler;
  }

  // Start the MQTT client and subscribe to sensor topics
  start() {
    console.log('🚀 Starting MQTT Sensor Service...');
    console.log(`📡 Connecting to broker: ${this.brokerUrl}`);
    
    this.client = mqtt.connect(this.brokerUrl, {
      clientId: `greenhouse_backend_${Math.random().toString(16).substr(2, 8)}`,
      keepalive: 60,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
      will: {
        topic: 'greenhouse/backend/status',
        payload: JSON.stringify({ status: 'offline', timestamp: new Date().toISOString() }),
        qos: 1,
        retain: true
      }
    });

    this.client.on('connect', () => {
      console.log('✅ MQTT Sensor Service connected to broker');
      this.isConnected = true;
      this.subscribeToSensorTopics();
      
      // Send online status
      this.client.publish('greenhouse/backend/status', JSON.stringify({
        status: 'online',
        timestamp: new Date().toISOString(),
        service: 'sensor_data_processor'
      }), { qos: 1, retain: true });
    });

    this.client.on('message', (topic, message) => {
      this.handleIncomingMessage(topic, message.toString());
    });

    this.client.on('error', (error) => {
      console.error('❌ MQTT Sensor Service error:', error);
    });

    this.client.on('offline', () => {
      console.log('📴 MQTT Sensor Service offline');
      this.isConnected = false;
    });

    this.client.on('reconnect', () => {
      console.log('🔄 MQTT Sensor Service reconnecting...');
    });
  }

  // Subscribe to all ESP32 sensor data topics
  subscribeToSensorTopics() {
    const deviceIds = [1, 2, 3]; // Add more device IDs as needed
    const sensorTypes = ['temperature', 'humidity', 'soil_moisture', 'light'];
    
    deviceIds.forEach(deviceId => {
      sensorTypes.forEach(sensorType => {
        const topic = `esp32_${deviceId}/${sensorType}`;
        this.subscribeToTopic(topic);
      });
      
      // Also subscribe to status topics
      this.subscribeToTopic(`esp32_${deviceId}/status`);
    });
  }

  // Subscribe to a specific topic
  subscribeToTopic(topic) {
    if (this.subscribedTopics.has(topic)) {
      return; // Already subscribed
    }

    this.client.subscribe(topic, { qos: 1 }, (err) => {
      if (err) {
        console.error(`❌ Failed to subscribe to ${topic}:`, err);
      } else {
        console.log(`📺 Subscribed to sensor topic: ${topic}`);
        this.subscribedTopics.add(topic);
      }
    });
  }

  // Handle incoming MQTT messages
  async handleIncomingMessage(topic, message) {
    try {
      console.log(`📨 MQTT Message received on ${topic}: ${message}`);
      
      // Parse the topic to extract device ID and sensor type
      const topicParts = topic.split('/');
      if (topicParts.length !== 2) {
        console.warn(`⚠️ Invalid topic format: ${topic}`);
        return;
      }

      const [devicePart, sensorType] = topicParts;
      const deviceIdMatch = devicePart.match(/esp32_(\d+)/);
      
      if (!deviceIdMatch) {
        console.warn(`⚠️ Invalid device format: ${devicePart}`);
        return;
      }

      const deviceId = parseInt(deviceIdMatch[1]);
      
      // Handle status messages
      if (sensorType === 'status') {
        this.handleStatusMessage(deviceId, message);
        return;
      }

      // Parse sensor data
      let sensorValue;
      try {
        const data = JSON.parse(message);
        // Extract the sensor value from the JSON
        if (data[sensorType] !== undefined) {
          sensorValue = parseFloat(data[sensorType]);
        } else if (sensorType === 'light' && data['light_level'] !== undefined) {
          // Handle ESP32 sending "light_level" instead of "light"
          sensorValue = parseFloat(data['light_level']);
        } else {
          // Fallback: try to parse as direct number
          sensorValue = parseFloat(message);
        }
      } catch (parseError) {
        // If JSON parsing fails, try to parse as direct number
        sensorValue = parseFloat(message);
      }

      if (isNaN(sensorValue)) {
        console.warn(`⚠️ Invalid sensor value: ${message} for ${topic}`);
        return;
      }

      console.log(`📊 Processing sensor data: Device ${deviceId}, ${sensorType} = ${sensorValue}`);
      
      // Send to the sensor data handler (this will store historical data and check alerts)
      if (this.handleSensorData) {
        await this.handleSensorData(deviceId, sensorType, sensorValue);
      } else {
        console.warn('⚠️ No sensor data handler set! Call setSensorDataHandler() first');
      }
      
    } catch (error) {
      console.error('❌ Error processing MQTT message:', error);
      console.error(`   Topic: ${topic}`);
      console.error(`   Message: ${message}`);
    }
  }

  // Handle device status messages
  handleStatusMessage(deviceId, message) {
    try {
      const statusData = JSON.parse(message);
      console.log(`📡 Device ${deviceId} status:`, statusData);
      
      // You can add logic here to track device online/offline status
      // and potentially create alerts for offline devices
      
    } catch (error) {
      console.log(`📡 Device ${deviceId} status: ${message}`);
    }
  }

  // Stop the MQTT service
  stop() {
    if (this.client) {
      console.log('🛑 Stopping MQTT Sensor Service...');
      
      // Send offline status
      this.client.publish('greenhouse/backend/status', JSON.stringify({
        status: 'offline',
        timestamp: new Date().toISOString()
      }), { qos: 1, retain: true });
      
      this.client.end();
      this.client = null;
      this.isConnected = false;
      this.subscribedTopics.clear();
    }
  }

  // Get connection status
  getStatus() {
    return {
      connected: this.isConnected,
      subscribedTopics: Array.from(this.subscribedTopics),
      brokerUrl: this.brokerUrl
    };
  }
}

// Create singleton instance
const mqttSensorService = new MQTTSensorService();

module.exports = mqttSensorService;