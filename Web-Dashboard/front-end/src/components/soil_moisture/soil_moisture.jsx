import React from 'react';
import './soil_moisture.css';

const SoilMoistureGauge = ({ moisture = 0, status = 'Disconnected', lastUpdate = 'No data' }) => {
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const value = clamp(moisture, 0, 100);
  
  // Simple arc calculation for half-circle gauge
  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  const circumference = Math.PI * radius; // Half circle
  const offset = circumference - (value / 100) * circumference;
  
  // Calculate needle rotation (0-180 degrees)
  const needleRotation = (value / 100) * 180;
  
  // Determine gauge color based on moisture level
  const getGaugeColor = (moisture) => {
    if (moisture < 30) return '#f44336'; // Red - dry
    if (moisture < 60) return '#ff9800'; // Orange - moderate
    return '#4caf50'; // Green - moist
  };

  return (
    <div className="soil-moisture-gauge-container">
      {/* Nature-themed decorative elements */}
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '15px',
        fontSize: '0.7rem',
        opacity: 0.4,
        animation: 'sway 4s ease-in-out infinite'
      }}>🌿</div>
      {moisture > 60 && (
        <div style={{
          position: 'absolute',
          bottom: '25px',
          left: '20px',
          fontSize: '0.6rem',
          opacity: 0.5,
          animation: 'bloom 3s ease-in-out infinite 1s'
        }}>🌸</div>
      )}
      {moisture < 30 && (
        <div style={{
          position: 'absolute',
          bottom: '30px',
          right: '25px',
          fontSize: '0.7rem',
          opacity: 0.6,
          animation: 'wilt 2s ease-in-out infinite'
        }}>🥀</div>
      )}
      
      {/* Title above gauge */}
      <div className="soil-moisture-gauge-title">
        🌱 Soil Moisture
      </div>
      
      {/* Add nature animations */}
      <style>{`
        @keyframes sway {
          0%, 100% { transform: rotate(-3deg); opacity: 0.4; }
          50% { transform: rotate(3deg); opacity: 0.7; }
        }
        @keyframes bloom {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.5; }
          50% { transform: scale(1.2) rotate(10deg); opacity: 0.8; }
        }
        @keyframes wilt {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(2px) rotate(-10deg); opacity: 0.3; }
        }
      `}</style>
      
      <svg className="soil-moisture-gauge-svg" viewBox="0 0 200 120">
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

      {/* Percentage below gauge */}
      <div className="soil-moisture-gauge-value">
        {Math.round(value)}%
      </div>

      {/* Status section */}
      <div className="soil-moisture-status-section">
        <div
          className="soil-moisture-status-indicator"
          style={{ 
            color: status === 'Connected' || status === 'connected' ? '#28a745' : '#dc3545' 
          }}
        >
          ● {status}
        </div>
        <div className="soil-moisture-status-text">
          Last update: {lastUpdate}
        </div>
      </div>
    </div>
  );
};

export default SoilMoistureGauge;
