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
      {/* Light-themed decorative elements */}
      {lightLevel > 70 && (
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          fontSize: '0.7rem',
          opacity: 0.6,
          animation: 'sparkle 2s ease-in-out infinite'
        }}>✨</div>
      )}
      {lightLevel > 50 && (
        <div style={{
          position: 'absolute',
          bottom: '25px',
          left: '20px',
          fontSize: '0.6rem',
          opacity: 0.5,
          animation: 'twinkle 3s ease-in-out infinite 0.5s'
        }}>⭐</div>
      )}
      {lightLevel < 20 && (
        <div style={{
          position: 'absolute',
          bottom: '30px',
          right: '25px',
          fontSize: '0.8rem',
          opacity: 0.7,
          animation: 'dim 4s ease-in-out infinite'
        }}>🌙</div>
      )}
      
      {/* Title above gauge */}
      <div className="light-sensor-gauge-title">
        ☀️ Light Sensor
      </div>
      
      {/* Add light-themed animations */}
      <style>{`
        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.6; }
          50% { transform: scale(1.3) rotate(180deg); opacity: 1; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes dim {
          0%, 100% { opacity: 0.7; transform: translateY(0px); }
          50% { opacity: 0.3; transform: translateY(-2px); }
        }
      `}</style>
      
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
      <div className="light-sensor-gauge-value">
        {Math.round(value)}%
      </div>

      {/* Light level description */}
      <div className="light-sensor-gauge-description" style={{ color: getGaugeColor(value) }}>
        {getLightDescription(value)}
      </div>

      {/* Status section */}
      <div className="light-sensor-status-section">
        <div
          className="light-sensor-status-indicator"
          style={{ 
            color: status === 'Connected' || status === 'connected' ? '#28a745' : '#dc3545' 
          }}
        >
          ● {status}
        </div>
        <div className="light-sensor-status-text">
          Last update: {lastUpdate}
        </div>
      </div>
    </div>
  );
};

export default LightSensorGauge;
