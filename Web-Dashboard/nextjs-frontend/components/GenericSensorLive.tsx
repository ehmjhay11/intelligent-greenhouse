import React, { useState, useEffect, useRef } from 'react';
import { getApiBase } from '../lib/apiBase';

interface Sensor {
  deviceId: string;
  type: string;
  name: string;
  id: string;
}

interface GenericSensorLiveProps {
  sensor: Sensor;
}

type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'disconnected';
type SensorType = 'soil_moisture' | 'temperature' | 'humidity' | 'light';

const GenericSensorLive: React.FC<GenericSensorLiveProps> = ({ sensor }) => {
  const [sensorValue, setSensorValue] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const API_BASE = getApiBase();

  useEffect(() => {
    // Use polling instead of MQTT WebSocket due to broker WebSocket port not being available
    const fetchSensorData = async () => {
      try {
        setConnectionStatus('connecting');
        const response = await fetch(`${API_BASE}/sensors/latest/${sensor.deviceId}/${sensor.type}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setSensorValue(data.data.value || 0);
            setConnectionStatus('connected');
          } else {
            setConnectionStatus('error');
          }
        } else {
          setConnectionStatus('error');
        }
      } catch (error) {
        console.error('❌ Error fetching sensor data:', error);
        setConnectionStatus('error');
      }
    };

    // Initial fetch
    fetchSensorData();
    
    // Poll every 5 seconds
    intervalRef.current = setInterval(fetchSensorData, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sensor, API_BASE]);

  const getIcon = (): string => {
    switch (sensor.type as SensorType) {
      case 'soil_moisture': return '🌱';
      case 'temperature': return '🌡️';
      case 'humidity': return '💧';
      case 'light': return '☀️';
      default: return '📊';
    }
  };

  const getUnit = (): string => {
    switch (sensor.type as SensorType) {
      case 'soil_moisture': return '%';
      case 'temperature': return '°C';
      case 'humidity': return '%';
      case 'light': return 'lux';
      default: return '';
    }
  };

  const getValue = (): string => {
    if (sensor.type === 'temperature') {
      return sensorValue.toFixed(1);
    }
    return Math.round(sensorValue).toString();
  };

  const getValueColorClass = (): string => {
    switch (sensor.type as SensorType) {
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

  const getStatusColorClass = (): string => {
    switch (connectionStatus) {
      case 'connected': return 'status-connected';
      case 'connecting': return 'status-connecting';
      case 'error': return 'status-error';
      default: return 'status-disconnected';
    }
  };

  const typeClass = `type-${sensor.type}`;
  const headingId = `sensor-${sensor.deviceId}-${sensor.id}-name`;

  return (
    <div className={`sensor-card ${typeClass}`} role="region" aria-labelledby={headingId}>
      <div className="sensor-header">
        <span className="sensor-icon">{getIcon()}</span>
        <div className="sensor-info">
          <h3 id={headingId} className="sensor-name">{sensor.name}</h3>
        </div>
      </div>

      <div className="sensor-value-container">
        <div className={`sensor-value ${getValueColorClass()}`}>
          {getValue()}{getUnit()}
        </div>
        
        <div className={`connection-status ${getStatusColorClass()}`} role="status" aria-live="polite">
          {connectionStatus.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default GenericSensorLive;
