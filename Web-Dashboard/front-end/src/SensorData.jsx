import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GenericSensorLive from './components/GenericSensorLive';
import './styles/SensorData.css';
import './styles/DashboardPages.css';
import API_BASE from './lib/apiBase';

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
  <main className="page-container" role="main">
      <header className="page-header fade-in">
        <h1 className="page-title">Live Sensor Data</h1>
    <div className="mt-2 mb-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold" style={{ backgroundColor: systemStatus.color }} role="status" aria-live="polite">
          <span aria-hidden>📡</span>
          <span>System Status: {systemStatus.status}</span>
        </div>
    <p className="page-subtitle">Monitoring {sensors.length} active sensors from {Object.keys(deviceGroups).length} devices</p>
      </header>

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
          <section key={deviceName} className="page-section mb-8 fade-in" aria-label={deviceName}>
            <h2 className="card-title mb-3 flex items-center gap-2 text-primary-800">
              <span aria-hidden>📡</span>
              <span>{deviceName}</span>
            </h2>
            <div className="sensors-grid">
              {deviceSensors.map(sensor => (
                <div key={`${sensor.deviceId}-${sensor.id}`} className="sensor-wrapper">
                  <GenericSensorLive sensor={sensor} />
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}

export default SensorData;