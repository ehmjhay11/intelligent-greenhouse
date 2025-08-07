import React from 'react';
import './lightSensor.css';

const LightSensorGauge = ({ 
  lightLevel = 0, 
  status = 'Disconnected', 
  lastUpdate = 'No data' 
}) => {
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const value = clamp(lightLevel, 0, 100);
  
  // Calculate arc parameters for half-circle gauge
  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  const circumference = Math.PI * radius; // Half circle
  const offset = circumference - (value / 100) * circumference;
  
  // Calculate needle rotation (0-180 degrees)
  const needleRotation = (value / 100) * 180;
  
  // Determine gauge color based on light level
  const getGaugeColor = (light) => {
    if (light < 20) return '#4A148C'; // Dark purple - very low light
    if (light < 40) return '#7B1FA2'; // Purple - low light
    if (light < 60) return '#FFC107'; // Amber - moderate light
    if (light < 80) return '#FF9800'; // Orange - good light
    return '#FF5722'; // Red-orange - very bright light
  };

  // Get light level description
  const getLightDescription = (light) => {
    if (light < 20) return 'Very Low';
    if (light < 40) return 'Low';
    if (light < 60) return 'Moderate';
    if (light < 80) return 'Good';
    return 'Very Bright';
  };

  return (
    <div className="light-sensor-gauge-container">
      {/* Title above gauge */}
      <div style={{ 
        marginBottom: '0.5rem',
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#495057'
      }}>
        Light Sensor
      </div>
      
      <svg className="light-sensor-gauge-svg" viewBox="0 0 200 120">
        {/* Gauge background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        {/* Gauge value arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={getGaugeColor(value)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease'
          }}
        />
        
        {/* Needle */}
        <line
          x1={centerX}
          y1={centerY}
          x2={centerX - 70}
          y2={centerY}
          stroke="#333"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${needleRotation} ${centerX} ${centerY})`}
          style={{
            transition: 'transform 0.5s ease'
          }}
        />
        
        {/* Center dot */}
        <circle 
          cx={centerX} 
          cy={centerY} 
          r="6" 
          fill="#333" 
        />
      </svg>

      {/* Light level value below gauge */}
      <div style={{ 
        marginTop: '0.5rem',
        marginBottom: '0.25rem',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#212529'
      }}>
        {Math.round(value)}%
      </div>

      {/* Light level description */}
      <div style={{ 
        marginBottom: '0.75rem',
        fontSize: '0.9rem',
        fontWeight: '500',
        color: getGaugeColor(value)
      }}>
        {getLightDescription(value)}
      </div>

      {/* Status section */}
      <div className="status-section">
        <div
          className="status-indicator"
          style={{ 
            color: status === 'Connected' || status === 'connected' ? '#28a745' : '#dc3545' 
          }}
        >
          ● {status}
        </div>
        <div className="status-text">
          Last update: {lastUpdate}
        </div>
      </div>
    </div>
  );
};

export default LightSensorGauge;
