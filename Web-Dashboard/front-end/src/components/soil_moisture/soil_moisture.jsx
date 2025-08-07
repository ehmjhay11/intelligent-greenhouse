  import React from 'react';

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function getNeedleAngle(moisture) {
    // Map 0-100 to -120deg to +120deg (240deg sweep)
    return ((clamp(moisture, 0, 100) / 100) * 240) - 120;
  }

  const SoilMoistureGauge = ({ moisture }) => {
    const angle = getNeedleAngle(moisture);

    // Needle endpoint calculation
    const r = 70;
    const cx = 100, cy = 100;
    const rad = (angle - 90) * (Math.PI / 180);
    const x = cx + r * Math.cos(rad);
    const y = cy + r * Math.sin(rad);

    return (
      <div style={{ width: 220, textAlign: 'center' }}>
        <svg width="200" height="120">
          {/* Gauge background arc */}
          <path
            d="M30,100 A70,70 0 0,1 170,100"
            fill="none"
            stroke="#eee"
            strokeWidth="18"
          />
          {/* Gauge colored arc */}
          <path
            d="M30,100 A70,70 0 0,1 170,100"
            fill="none"
            stroke="#4caf50"
            strokeWidth="12"
          />
          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#222"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Center circle */}
          <circle cx={cx} cy={cy} r="8" fill="#222" />
          {/* Value label */}
          <text x={cx} y={cy + 40} textAnchor="middle" fontSize="22" fill="#333">
            {clamp(moisture, 0, 100)}%
          </text>
          {/* Label */}
          <text x={cx} y={cy + 65} textAnchor="middle" fontSize="16" fill="#666">
            Soil Moisture
          </text>
        </svg>
      </div>
    );
  };

  export default SoilMoistureGauge;
