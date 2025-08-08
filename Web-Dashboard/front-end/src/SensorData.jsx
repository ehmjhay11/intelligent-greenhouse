import React, { useState, useEffect } from 'react';
import './SensorData.css';
import { useNavigate } from 'react-router-dom';
import SoilMoistureLive from './components/soil_moisture/SoilMoistureLive';
import TemperatureLive from './components/temperature/TemperatureLive';
import LightSensorLive from './components/light_sensor/LightSensorLive';
import HumiditySensorLive from './components/humidity_sensor/HumiditySensorLive';

function SensorData() {
  const navigate = useNavigate();
  
  // Simulate realistic MQTT connection status
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  
  useEffect(() => {
    // Simulate connection sequence
    const timer1 = setTimeout(() => setConnectionStatus('reconnecting'), 1000);
    const timer2 = setTimeout(() => setConnectionStatus('partial'), 3000);
    const timer3 = setTimeout(() => setConnectionStatus('connected'), 8000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Function to get system status based on connection state
  const getSystemStatus = () => {
    switch(connectionStatus) {
      case 'connected':
        return { 
          text: 'All sensors connected', 
          color: '#4caf50',
          icon: '●' 
        };
      case 'partial':
        return { 
          text: '2 sensors reconnecting', 
          color: '#ff9800',
          icon: '↻' 
        };
      case 'reconnecting':
        return { 
          text: 'Sensors reconnecting', 
          color: '#ff9800',
          icon: '↻' 
        };
      case 'connecting':
        return { 
          text: 'Connecting to MQTT broker', 
          color: '#2196f3',
          icon: '⟳' 
        };
      default:
        return { 
          text: 'Connection error', 
          color: '#f44336',
          icon: '⚠' 
        };
    }
  };

  const systemStatus = getSystemStatus();

  return (
    <div className="sensor-data-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">🌿 Live Sensor Dashboard</h1>
        <p className="dashboard-subtitle">Real-time monitoring of your greenhouse environment</p>
      </div>
      
      <div className="sensors-grid">
        <div className="sensor-wrapper">
          <SoilMoistureLive />
        </div>
        <div className="sensor-wrapper">
          <TemperatureLive />
        </div>
        <div className="sensor-wrapper">
          <LightSensorLive />
        </div>
        <div className="sensor-wrapper">
          <HumiditySensorLive />
        </div>
      </div>
      
      <div className="dashboard-footer">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <div className="status-indicator">
          <span 
            className="status-dot" 
            style={{ 
              background: systemStatus.color,
              animation: systemStatus.color === '#4caf50' ? 'pulse 2s infinite' : 
                        systemStatus.color === '#ff9800' ? 'spin 1s linear infinite' : 'none'
            }}
          >
            {systemStatus.icon}
          </span>
          {systemStatus.text}
        </div>
      </div>
    </div>
  );
}

export default SensorData;
