import React from 'react';
import './SensorData.css';
import { useNavigate } from 'react-router-dom';

function SensorData() {
  const navigate = useNavigate();
  // Placeholder sensor data
  const sensors = [
    { name: 'Temperature', value: '24°C' },
    { name: 'Humidity', value: '60%' },
    { name: 'Soil Moisture', value: '45%' },
    { name: 'Light Intensity', value: '800 lux' }
  ];

  return (
    <div className="sensor-data-container">
      <h2>Sensor Data</h2>
      <table className="sensor-table">
        <thead>
          <tr>
            <th>Sensor</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {sensors.map((sensor, idx) => (
            <tr key={idx}>
              <td>{sensor.name}</td>
              <td>{sensor.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="back-btn" onClick={() => navigate('/')}>
        Back to Home
      </button>
    </div>
  );
}

export default SensorData;
