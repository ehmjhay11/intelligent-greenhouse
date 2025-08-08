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
      {/* Thermal effects based on temperature */}
      {clampedTemp > 30 && (
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          fontSize: '0.7rem',
          opacity: 0.5,
          animation: 'heat-wave 1.5s ease-in-out infinite'
        }}>🔥</div>
      )}
      {clampedTemp < 10 && (
        <div style={{
          position: 'absolute',
          bottom: '25px',
          left: '20px',
          fontSize: '0.8rem',
          opacity: 0.6,
          animation: 'freeze 2s ease-in-out infinite'
        }}>❄️</div>
      )}
      
      {/* Title above gauge */}
      <div className="temperature-gauge-title">
        🌡️ Temperature
      </div>
      
      {/* Add heat wave and freeze animations */}
      <style>{`
        @keyframes heat-wave {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.5; }
          50% { transform: translateY(-2px) scale(1.1); opacity: 0.8; }
        }
        @keyframes freeze {
          0%, 100% { transform: translateX(0px) scale(1); opacity: 0.6; }
          50% { transform: translateX(-1px) scale(1.05); opacity: 0.9; }
        }
      `}</style>
      
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
      <div className="temperature-gauge-value">
        {Math.round(clampedTemp * 10) / 10}°C
      </div>

      {/* Status section */}
      <div className="temperature-status-section">
        <div
          className="temperature-status-indicator"
          style={{ 
            color: status === 'Connected' || status === 'connected' ? '#28a745' : '#dc3545' 
          }}
        >
          ● {status}
        </div>
        <div className="temperature-status-text">
          Last update: {lastUpdate}
        </div>
      </div>
    </div>
  );
};

export default TemperatureGauge;
