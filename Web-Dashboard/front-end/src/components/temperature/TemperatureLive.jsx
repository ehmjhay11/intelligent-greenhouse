import React, { useEffect, useState, useCallback } from 'react';
import TemperatureGauge from './temperatureGauge';
import mqtt from 'mqtt';

// Configuration - with proper fallbacks for browser environment
const MQTT_CONFIG = {
  broker: (typeof process !== 'undefined' && process.env?.REACT_APP_MQTT_BROKER) || 'ws://10.146.132.213:8080/mqtt',
  topic: (typeof process !== 'undefined' && process.env?.REACT_APP_MQTT_TOPIC) || 'esp32',
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  clientId: `temperature_${Math.random().toString(16).substr(2, 8)}`,
};

const TemperatureLive = () => {
  const [temperature, setTemperature] = useState(20); // Start with reasonable default
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const updateTemperature = useCallback((value) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= -50 && numericValue <= 100) {
      setTemperature(numericValue);
      setLastUpdate(new Date());
      setError(null);
    } else {
      console.warn('Invalid temperature value received:', value);
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
          console.log('MQTT connected successfully (Temperature)');
          setConnectionStatus('connected');
          setIsConnecting(false);
          setError(null);
          
          client.subscribe(MQTT_CONFIG.topic, (err) => {
            if (err) {
              console.error('MQTT subscription error (Temperature):', err);
              setError('Failed to subscribe to topic');
            } else {
              console.log(`Subscribed to topic: ${MQTT_CONFIG.topic} (Temperature)`);
            }
          });
        });

        client.on('message', (topic, message) => {
          console.log('MQTT message received (Temperature):', topic, message.toString());
          
          if (topic === MQTT_CONFIG.topic) {
            try {
              const data = JSON.parse(message.toString());
              
              // Handle different possible data structures for temperature
              if (data.temperature !== undefined) {
                updateTemperature(data.temperature);
              } else if (data.temp !== undefined) {
                updateTemperature(data.temp);
              } else if (data.Temperature !== undefined) {
                updateTemperature(data.Temperature);
              } else if (data.Temp !== undefined) {
                updateTemperature(data.Temp);
              } else {
                console.warn('No temperature data found in message:', data);
              }
            } catch (e) {
              console.error('Failed to parse MQTT message (Temperature):', e);
              setError('Failed to parse sensor data');
            }
          }
        });

        client.on('error', (err) => {
          console.error('MQTT connection error (Temperature):', err);
          setConnectionStatus('error');
          setError(`Connection error: ${err.message}`);
        });

        client.on('disconnect', () => {
          console.log('MQTT disconnected (Temperature)');
          setConnectionStatus('disconnected');
          setIsConnecting(false);
        });

        client.on('reconnect', () => {
          console.log('MQTT reconnecting... (Temperature)');
          setConnectionStatus('reconnecting');
          setIsConnecting(true);
        });

        client.on('close', () => {
          console.log('MQTT connection closed (Temperature)');
          setConnectionStatus('disconnected');
          setIsConnecting(false);
        });

      } catch (err) {
        console.error('Failed to initialize MQTT client (Temperature):', err);
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
  }, [updateTemperature]);

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
      <TemperatureGauge 
        temperature={temperature} 
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

      {/* Add CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default TemperatureLive;
