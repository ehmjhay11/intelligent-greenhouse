import React, { useState, useEffect } from 'react';
import SoilMoistureGauge from './soil_moisture';

// Test component to verify the gauge works with different values
const SoilMoistureTest = () => {
  const [moisture, setMoisture] = useState(45);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setMoisture(prev => {
          const change = (Math.random() - 0.5) * 20;
          return Math.max(0, Math.min(100, prev + change));
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  const presetValues = [0, 25, 50, 75, 100];

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      <h2>Soil Moisture Gauge Test</h2>
      
      {/* Controls */}
      <div style={{ 
        marginBottom: '2rem', 
        display: 'flex', 
        gap: '1rem', 
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div>
          <label htmlFor="moisture-slider">Moisture: {Math.round(moisture)}%</label>
          <input
            id="moisture-slider"
            type="range"
            min="0"
            max="100"
            value={moisture}
            onChange={(e) => setMoisture(Number(e.target.value))}
            style={{ display: 'block', width: '200px', margin: '0.5rem 0' }}
          />
        </div>
        
        <div>
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isAnimating ? '#f44336' : '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isAnimating ? 'Stop Animation' : 'Start Animation'}
          </button>
        </div>
        
        <div>
          <span>Preset values: </span>
          {presetValues.map(value => (
            <button
              key={value}
              onClick={() => setMoisture(value)}
              style={{
                margin: '0 0.25rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {value}%
            </button>
          ))}
        </div>
      </div>

      {/* Gauge Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Connected State */}
        <div>
          <h3>Connected State</h3>
          <SoilMoistureGauge 
            moisture={moisture} 
            status="Connected" 
            lastUpdate="2s ago" 
          />
        </div>

        {/* Disconnected State */}
        <div>
          <h3>Disconnected State</h3>
          <SoilMoistureGauge 
            moisture={0} 
            status="Disconnected" 
            lastUpdate="No data" 
          />
        </div>

        {/* Error State */}
        <div>
          <h3>Error State</h3>
          <SoilMoistureGauge 
            moisture={moisture} 
            status="Error" 
            lastUpdate="Connection failed" 
          />
        </div>
      </div>

      {/* Status Info */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px' 
      }}>
        <h4>Current Status:</h4>
        <p>Moisture Level: {Math.round(moisture)}%</p>
        <p>Color: {
          moisture < 30 ? '🔴 Red (Dry)' : 
          moisture < 60 ? '🟠 Orange (Moderate)' : 
          '🟢 Green (Moist)'
        }</p>
        <p>Animation: {isAnimating ? '✅ Running' : '⏸️ Stopped'}</p>
      </div>
    </div>
  );
};

export default SoilMoistureTest;
