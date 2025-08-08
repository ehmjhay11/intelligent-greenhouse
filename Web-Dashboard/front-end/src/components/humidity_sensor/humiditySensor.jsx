import React from 'react';
import './humiditySensor.css';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Default range: 0% to 100% humidity
function getNeedleAngle(humidity, min = 0, max = 100) {
  // Map min-max to 0deg to 180deg (180deg sweep for half circle)
  const percent = (clamp(humidity, min, max) - min) / (max - min);
  return percent * 180;
}

const HumiditySensorGauge = ({ 
  humidity = 50, 
  min = 0, 
  max = 100, 
  status = 'disconnected', 
  lastUpdate = 'No data' 
}) => {
  const clampedHumidity = clamp(humidity, min, max);
  const angle = getNeedleAngle(humidity, min, max);
  
  // Calculate arc parameters for half-circle gauge
  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  const circumference = Math.PI * radius; // Half circle
  const offset = circumference - (angle / 180) * circumference;
  
  // Determine gauge color based on humidity level
  const getGaugeColor = (humidity) => {
    if (humidity < 30) return '#ff6b6b'; // Red - too dry
    if (humidity < 40) return '#ffa726'; // Orange - dry
    if (humidity < 60) return '#66bb6a'; // Green - optimal
    if (humidity < 80) return '#42a5f5'; // Blue - humid
    return '#5c6bc0'; // Purple - very humid
  };

  // Get humidity level description
  const getHumidityLevel = (humidity) => {
    if (humidity < 30) return 'Too Dry';
    if (humidity < 40) return 'Dry';
    if (humidity < 60) return 'Optimal';
    if (humidity < 80) return 'Humid';
    return 'Very Humid';
  };

  // Get status color
  const getStatusColor = () => {
    switch(status.toLowerCase()) {
      case 'connected': return '#28a745';
      case 'connecting': return '#ffc107';
      case 'reconnecting': return '#17a2b8';
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="humidity-sensor-gauge-container">
      {/* Title above gauge */}
      <div className="humidity-sensor-gauge-title">
        💧 Humidity Sensor
      </div>
      
      <svg className="humidity-sensor-gauge-svg" viewBox="0 0 200 120">
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
          stroke={getGaugeColor(clampedHumidity)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="humidity-sensor-gauge-arc"
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
          className="humidity-sensor-gauge-needle"
        />
        
        {/* Center dot */}
        <circle 
          cx={centerX} 
          cy={centerY} 
          r="6" 
          fill="#333" 
        />

        {/* Min label */}
        <text 
          x="20" 
          y="115" 
          className="humidity-sensor-gauge-label"
        >
          {min}%
        </text>
        
        {/* Max label */}
        <text 
          x="180" 
          y="115" 
          className="humidity-sensor-gauge-label"
          textAnchor="end"
        >
          {max}%
        </text>
      </svg>

      {/* Humidity value below gauge */}
      <div className="humidity-sensor-gauge-value">
        {Math.round(clampedHumidity * 10) / 10}%
      </div>

      {/* Humidity level description */}
      <div 
        className="humidity-sensor-gauge-level"
        style={{ color: getGaugeColor(clampedHumidity) }}
      >
        {getHumidityLevel(clampedHumidity)}
      </div>

      {/* Status section */}
      <div className="humidity-sensor-status-section">
        <div
          className="humidity-sensor-status-indicator"
          style={{ color: getStatusColor() }}
        >
          ● {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
        <div className="humidity-sensor-status-text">
          {lastUpdate}
        </div>
      </div>
    </div>
  );
};

export default HumiditySensorGauge;
