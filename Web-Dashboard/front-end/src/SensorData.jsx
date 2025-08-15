import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GenericSensorLive from './components/GenericSensorLive';
import './styles/SensorData.css';

const API_BASE = 'http://localhost:3003/api';

function SensorData() {
  const navigate = useNavigate();
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    fetchSensors();
    const interval = setInterval(fetchSensors, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSensors = async () => {
    try {
      const response = await fetch(`${API_BASE}/sensors/sensors`);
      const result = await response.json();
      if (result.success) {
        setSensors(result.data.filter(sensor => sensor.isActive));
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Error fetching sensors:', error);
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const getSystemStatus = () => {
    if (connectionStatus === 'connected' && sensors.length > 0) {
      return { status: 'Operational', color: '#27ae60' };
    } else if (connectionStatus === 'connecting') {
      return { status: 'Connecting...', color: '#f39c12' };
    } else {
      return { status: 'Error', color: '#e74c3c' };
    }
  };

  const systemStatus = getSystemStatus();

  // Normalize labels like "ESP32 Device #X" -> "Device #X"
  const formatDeviceLabel = (name) => {
    if (!name) return '';
    return name.replace(/ESP32\s*Device\s*#?(\d+)/gi, (_, num) => `Device #${num}`);
  };

  if (loading) {
    return (
      <div className="text-center p-12">
        <h2 className="text-xl text-primary-800 mb-4">Loading sensors...</h2>
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  // Group sensors by device (formatting label for display only)
  const deviceGroups = sensors.reduce((acc, sensor) => {
    const deviceKey = `${formatDeviceLabel(sensor.deviceName)} (${sensor.deviceLocation})`;
    if (!acc[deviceKey]) {
      acc[deviceKey] = [];
    }
    acc[deviceKey].push(sensor);
    return acc;
  }, {});

  return (
    <div className="sensor-data-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          📊 Live Sensor Dashboard
        </h1>
        
        <div className="inline-block px-6 py-3 rounded-full text-white font-bold mb-4"
             style={{ backgroundColor: systemStatus.color }}>
          System Status: {systemStatus.status}
        </div>
        
        <p className="dashboard-subtitle">
          Monitoring {sensors.length} active sensors from {Object.keys(deviceGroups).length} devices
        </p>
      </div>

      {sensors.length === 0 ? (
        <div className="text-center p-16 bg-primary-50 rounded-xl border-2 border-dashed border-primary-200 max-w-2xl mx-auto">
          <h3 className="text-primary-600 mb-4 text-xl">No active sensors found</h3>
          <p className="text-primary-500 mb-8 text-base">
            Add some devices in the management panel to see live data here.
          </p>
          <button 
            onClick={() => navigate('/manage-sensors')}
            className="bg-blue-500 hover:bg-blue-600 text-white border-none px-8 py-4 rounded-lg cursor-pointer text-base font-bold transition-colors duration-200"
          >
            🔧 Manage Devices
          </button>
        </div>
      ) : (
        Object.entries(deviceGroups).map(([deviceName, deviceSensors]) => (
          <div key={deviceName} className="mb-12">
            <h2 className="text-primary-700 mb-4 px-4 py-3 bg-primary-100 rounded-lg border-l-4 border-blue-500 text-lg font-medium">
              📡 {deviceName}
            </h2>
            
            <div className="sensors-grid">
              {deviceSensors.map(sensor => (
                <div key={`${sensor.deviceId}-${sensor.id}`} className="sensor-wrapper">
                  <GenericSensorLive sensor={sensor} />
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <div className="dashboard-footer">
        <button 
          onClick={() => navigate('/')}
          className="back-btn"
        >
          ← Back to Home
        </button>
        
        <button 
          onClick={() => navigate('/manage-sensors')}
          className="back-btn bg-blue-500 hover:bg-blue-600"
        >
          🔧 Manage Devices
        </button>
        
        <button 
          onClick={fetchSensors}
          className="back-btn bg-success-600 hover:bg-success-700"
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}

export default SensorData;