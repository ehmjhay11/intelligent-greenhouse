import React from 'react';
import './temperatureGauge.css';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Default range: -10°C to 50°C
function getNeedleAngle(temp, min = -10, max = 50) {
  // Map min-max to 0deg to 180deg (180deg sweep for half circle)
  const percent = (clamp(temp, min, max) - min) / (max - min);
  return percent * 180;
}

const TemperatureGauge = ({ 
  temperature = 20, 
  min = -10, 
  max = 50, 
  status = 'Disconnected', 
  lastUpdate = 'No data' 
}) => {
  const clampedTemp = clamp(temperature, min, max);
  const angle = getNeedleAngle(temperature, min, max);
  
  // Calculate arc parameters for half-circle gauge
  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  const circumference = Math.PI * radius; // Half circle
  const offset = circumference - (angle / 180) * circumference;
  
  // Determine gauge color based on temperature level
  const getGaugeColor = (temp) => {
    if (temp < 10) return '#2196F3'; // Blue - cold
    if (temp < 25) return '#4CAF50'; // Green - moderate
    if (temp < 35) return '#FF9800'; // Orange - warm
    return '#f44336'; // Red - hot
  };

  return (
    <div className="temperature-gauge-container">
      {/* Title above gauge */}
      <div style={{ 
        marginBottom: '0.5rem',
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#495057'
      }}>
        Temperature
      </div>
      
      <svg className="temperature-gauge-svg" viewBox="0 0 200 120">
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
          stroke={getGaugeColor(clampedTemp)}
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
          transform={`rotate(${angle} ${centerX} ${centerY})`}
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

      {/* Temperature value below gauge */}
      <div style={{ 
        marginTop: '0.5rem',
        marginBottom: '0.75rem',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#212529'
      }}>
        {Math.round(clampedTemp * 10) / 10}°C
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

export default TemperatureGauge;
