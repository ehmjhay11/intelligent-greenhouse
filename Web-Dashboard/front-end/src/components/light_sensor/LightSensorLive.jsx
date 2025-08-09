import React, { useEffect, useState, useCallback } from 'react';
import LightSensorGauge from './lightSensor';
import './lightSensor.css';
import mqtt from 'mqtt';

// Configuration - with proper fallbacks for browser environment
const MQTT_CONFIG = {
  broker: (typeof process !== 'undefined' && process.env?.REACT_APP_MQTT_BROKER) || 'ws://10.146.132.213:8080/mqtt',
  topic: (typeof process !== 'undefined' && process.env?.REACT_APP_MQTT_TOPIC) || 'esp32',
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  clientId: `light_sensor_${Math.random().toString(16).substr(2, 8)}`,
};

const LightSensorLive = () => {
  const [lightLevel, setLightLevel] = useState(0); // Start with 0 to show no data initially
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const updateLightLevel = useCallback((value) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 100) {
      setLightLevel(numericValue);
      setLastUpdate(new Date());
      setError(null);
    } else {
      console.warn('Invalid light level value received:', value);
      setError('Invalid data received');
    }
  }, []);

  useEffect(() => {
    let client = null;
    let reconnectTimeout = null;

    const connectMQTT = () => {
      try {
        setConnectionStatus('connecting');
        setIsConnecting(true);
        setError(null);
        
        client = mqtt.connect(MQTT_CONFIG.broker, {
          clientId: MQTT_CONFIG.clientId,
          reconnectPeriod: MQTT_CONFIG.reconnectPeriod,
          connectTimeout: MQTT_CONFIG.connectTimeout,
          clean: true,
        });

        client.on('connect', () => {
          console.log('MQTT connected successfully (Light Sensor)');
          setConnectionStatus('connected');
          setIsConnecting(false);
          setError(null);
          
          client.subscribe(MQTT_CONFIG.topic, (err) => {
            if (err) {
              console.error('MQTT subscription error (Light Sensor):', err);
              setError('Failed to subscribe to topic');
            } else {
              console.log(`Subscribed to topic: ${MQTT_CONFIG.topic} (Light Sensor)`);
            }
          });
        });

        client.on('message', (topic, message) => {
          console.log('MQTT message received (Light Sensor):', topic, message.toString());
          
          if (topic === MQTT_CONFIG.topic) {
            try {
              const data = JSON.parse(message.toString());
              
              // Handle different possible data structures for light sensor
              if (data.light_level !== undefined) {
                updateLightLevel(data.light_level);
              } else if (data.light !== undefined) {
                updateLightLevel(data.light);
              } else if (data.lux !== undefined) {
                // Convert lux to percentage (assuming max lux of 1000 for indoor use)
                const percentage = Math.min((data.lux / 1000) * 100, 100);
                updateLightLevel(percentage);
              } else if (data.brightness !== undefined) {
                updateLightLevel(data.brightness);
              } else if (data.Light !== undefined) {
                updateLightLevel(data.Light);
              } else if (data.LightLevel !== undefined) {
                updateLightLevel(data.LightLevel);
              } else {
                console.warn('No light sensor data found in message:', data);
              }
            } catch (e) {
              console.error('Failed to parse MQTT message (Light Sensor):', e);
              setError('Failed to parse sensor data');
            }
          }
        });

        client.on('error', (err) => {
          console.error('MQTT connection error (Light Sensor):', err);
          setConnectionStatus('error');
          setError(`Connection error: ${err.message}`);
        });

        client.on('disconnect', () => {
          console.log('MQTT disconnected (Light Sensor)');
          setConnectionStatus('disconnected');
          setIsConnecting(false);
        });

        client.on('reconnect', () => {
          console.log('MQTT reconnecting... (Light Sensor)');
          setConnectionStatus('reconnecting');
          setIsConnecting(true);
        });

        client.on('close', () => {
          console.log('MQTT connection closed (Light Sensor)');
          setConnectionStatus('disconnected');
          setIsConnecting(false);
        });

      } catch (err) {
        console.error('Failed to initialize MQTT client (Light Sensor):', err);
        setConnectionStatus('error');
        setError(`Initialization error: ${err.message}`);
        
        // Retry connection after delay
        reconnectTimeout = setTimeout(connectMQTT, 5000);
      }
    };

    connectMQTT();

    // Cleanup function
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (client) {
        client.removeAllListeners();
        client.end(true);
      }
    };
  }, [updateLightLevel]);

  const formatLastUpdate = () => {
    if (!lastUpdate) return 'No data received';
    const now = new Date();
    const diffMs = now - lastUpdate;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    return lastUpdate.toLocaleTimeString();
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
      <LightSensorGauge 
        lightLevel={lightLevel} 
        status={connectionStatus}
        lastUpdate={formatLastUpdate()}
      />

      {/* Error Display */}
      {error && (
        <div style={{ 
          marginTop: '0.5rem',
          padding: '0.5rem',
          backgroundColor: '#ffebee',
          border: '1px solid #ffcdd2',
          borderRadius: '4px',
          color: '#c62828',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default LightSensorLive;
