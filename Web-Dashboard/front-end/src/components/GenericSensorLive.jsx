import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import '../styles/GenericSensorLive.css';

const GenericSensorLive = ({ sensor }) => {
  const [sensorValue, setSensorValue] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [client, setClient] = useState(null);

  const MQTT_CONFIG = {
    // Fix: Use WebSocket MQTT broker URL that matches your MQTT broker
    broker: 'ws://10.240.100.213:8080/mqtt', // WebSocket port for web browsers
    topic: sensor.mqttTopic,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    clientId: `web_${sensor.type}_${sensor.deviceId}_${sensor.id}_${Math.random().toString(16).substr(2, 8)}`,
  };

  useEffect(() => {
    const connectMQTT = () => {
      try {
        console.log(`Connecting to MQTT broker: ${MQTT_CONFIG.broker}`);
        console.log(`Subscribing to topic: ${MQTT_CONFIG.topic}`);
        
        setConnectionStatus('connecting');
        const mqttClient = mqtt.connect(MQTT_CONFIG.broker, {
          clientId: MQTT_CONFIG.clientId,
          reconnectPeriod: MQTT_CONFIG.reconnectPeriod,
          connectTimeout: MQTT_CONFIG.connectTimeout,
        });

        mqttClient.on('connect', () => {
          console.log(`✅ Connected to MQTT broker for ${sensor.name}`);
          setConnectionStatus('connected');
          
          mqttClient.subscribe(MQTT_CONFIG.topic, (err) => {
            if (err) {
              console.error('❌ Subscription error:', err);
              setConnectionStatus('error');
            } else {
              console.log(`✅ Subscribed to: ${MQTT_CONFIG.topic}`);
            }
          });
        });

        mqttClient.on('message', (topic, message) => {
          try {
            console.log(`📨 Message received on ${topic}:`, message.toString());
            const data = JSON.parse(message.toString());
            
            // Extract the appropriate value based on sensor type
            let value = 0;
            switch (sensor.type) {
              case 'soil_moisture':
                value = data.soil_moisture || data.moisture || 0;
                break;
              case 'temperature':
                value = data.temperature || data.temp || 20;
                break;
              case 'humidity':
                value = data.humidity || data.hum || 0;
                break;
              case 'light':
                value = data.light_level || data.light || 0;
                break;
              default:
                value = data.value || 0;
            }
            
            console.log(`📊 ${sensor.name} value:`, value);
            setSensorValue(value);
            setLastUpdate(new Date());
          } catch (error) {
            console.error('❌ Error parsing MQTT message:', error);
          }
        });

        mqttClient.on('error', (error) => {
          console.error('❌ MQTT connection error:', error);
          setConnectionStatus('error');
        });

        mqttClient.on('disconnect', () => {
          console.log('🔌 Disconnected from MQTT broker');
          setConnectionStatus('disconnected');
        });

        setClient(mqttClient);

      } catch (error) {
        console.error('❌ Failed to connect to MQTT broker:', error);
        setConnectionStatus('error');
      }
    };

    connectMQTT();

    return () => {
      if (client) {
        console.log('🔌 Cleaning up MQTT connection');
        client.end();
      }
    };
  }, [sensor]);

  const getIcon = () => {
    switch (sensor.type) {
      case 'soil_moisture': return '🌱';
      case 'temperature': return '🌡️';
      case 'humidity': return '💧';
      case 'light': return '☀️';
      default: return '📊';
    }
  };

  const getUnit = () => {
    switch (sensor.type) {
      case 'soil_moisture': return '%';
      case 'temperature': return '°C';
      case 'humidity': return '%';
      case 'light': return 'lux';
      default: return '';
    }
  };

  const getValue = () => {
    if (sensor.type === 'temperature') {
      return sensorValue.toFixed(1);
    }
    return Math.round(sensorValue);
  };

  const getValueColorClass = () => {
    switch (sensor.type) {
      case 'soil_moisture':
        if (sensorValue < 30) return 'value-critical';
        if (sensorValue < 70) return 'value-warning';
        return 'value-good';
      case 'temperature':
        if (sensorValue < 15 || sensorValue > 35) return 'value-critical';
        if (sensorValue < 20 || sensorValue > 30) return 'value-warning';
        return 'value-good';
      case 'humidity':
        if (sensorValue < 40 || sensorValue > 80) return 'value-critical';
        if (sensorValue < 50 || sensorValue > 70) return 'value-warning';
        return 'value-good';
      case 'light':
        if (sensorValue < 200) return 'value-critical';
        if (sensorValue < 500) return 'value-warning';
        return 'value-good';
      default:
        return 'value-normal';
    }
  };

  const getStatusColorClass = () => {
    switch (connectionStatus) {
      case 'connected': return 'status-connected';
      case 'connecting': return 'status-connecting';
      case 'error': return 'status-error';
      default: return 'status-disconnected';
    }
  };

  const getBadgeColorClass = () => {
    switch (sensor.type) {
      case 'soil_moisture':
        if (sensorValue < 30) return 'badge-critical';
        if (sensorValue < 70) return 'badge-warning';
        return 'badge-good';
      case 'temperature':
        if (sensorValue < 15 || sensorValue > 35) return 'badge-critical';
        if (sensorValue < 20 || sensorValue > 30) return 'badge-warning';
        return 'badge-good';
      case 'humidity':
        if (sensorValue < 40 || sensorValue > 80) return 'badge-critical';
        if (sensorValue < 50 || sensorValue > 70) return 'badge-warning';
        return 'badge-good';
      case 'light':
        if (sensorValue < 200) return 'badge-critical';
        if (sensorValue < 500) return 'badge-warning';
        return 'badge-good';
      default:
        return 'badge-normal';
    }
  };

  const getValueStatus = () => {
    switch (sensor.type) {
      case 'soil_moisture':
        if (sensorValue < 30) return 'DRY';
        if (sensorValue < 70) return 'MODERATE';
        return 'WET';
      case 'temperature':
        if (sensorValue < 15) return 'COLD';
        if (sensorValue < 20) return 'COOL';
        if (sensorValue <= 30) return 'OPTIMAL';
        if (sensorValue <= 35) return 'WARM';
        return 'HOT';
      case 'humidity':
        if (sensorValue < 40) return 'LOW';
        if (sensorValue < 50) return 'MODERATE';
        if (sensorValue <= 70) return 'OPTIMAL';
        if (sensorValue <= 80) return 'HIGH';
        return 'VERY HIGH';
      case 'light':
        if (sensorValue < 200) return 'DARK';
        if (sensorValue < 500) return 'DIM';
        if (sensorValue < 1000) return 'BRIGHT';
        return 'VERY BRIGHT';
      default:
        return 'ACTIVE';
    }
  };

  return (
    <div className="sensor-card">
      <div className="sensor-header">
        <span className="sensor-icon">{getIcon()}</span>
        <div className="sensor-info">
          <h3 className="sensor-name">{sensor.name}</h3>
        </div>
      </div>

      <div className="sensor-value-container">
        <div className={`sensor-value ${getValueColorClass()}`}>
          {getValue()}{getUnit()}
        </div>
        
        <div className={`connection-status ${getStatusColorClass()}`}>
          {connectionStatus.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default GenericSensorLive;