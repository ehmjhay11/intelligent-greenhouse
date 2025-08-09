import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GenericSensorLive from './components/GenericSensorLive';

const API_BASE = 'http://localhost:5001/api';

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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Loading sensors...</h2>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '1rem auto'
        }}></div>
      </div>
    );
  }

  // Group sensors by device
  const deviceGroups = sensors.reduce((acc, sensor) => {
    const deviceKey = `${sensor.deviceName} (${sensor.deviceLocation})`;
    if (!acc[deviceKey]) {
      acc[deviceKey] = [];
    }
    acc[deviceKey].push(sensor);
    return acc;
  }, {});

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '1rem', fontSize: '2.5rem' }}>
          📊 Live Sensor Dashboard
        </h1>
        
        <div style={{
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          borderRadius: '25px',
          backgroundColor: systemStatus.color,
          color: 'white',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          System Status: {systemStatus.status}
        </div>
        
        <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
          Monitoring {sensors.length} active sensors from {Object.keys(deviceGroups).length} ESP32 devices
        </p>
      </div>

      {sensors.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '2px dashed #dee2e6'
        }}>
          <h3 style={{ color: '#6c757d', marginBottom: '1rem' }}>No active sensors found</h3>
          <p style={{ color: '#adb5bd', marginBottom: '2rem' }}>
            Add some ESP32 devices in the management panel to see live data here.
          </p>
          <button 
            onClick={() => navigate('/manage-sensors')}
            style={{
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            🔧 Manage ESP32 Devices
          </button>
        </div>
      ) : (
        Object.entries(deviceGroups).map(([deviceName, deviceSensors]) => (
          <div key={deviceName} style={{ marginBottom: '3rem' }}>
            <h2 style={{ 
              color: '#495057', 
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#e9ecef',
              borderRadius: '8px',
              borderLeft: '4px solid #007bff'
            }}>
              📡 {deviceName}
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {deviceSensors.map(sensor => (
                <GenericSensorLive key={`${sensor.deviceId}-${sensor.id}`} sensor={sensor} />
              ))}
            </div>
          </div>
        ))
      )}

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            backgroundColor: '#34495e',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            marginRight: '1rem',
            fontSize: '1rem'
          }}
        >
          ← Back to Home
        </button>
        
        <button 
          onClick={() => navigate('/manage-sensors')}
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          🔧 Manage ESP32 Devices
        </button>
        
        <button 
          onClick={fetchSensors}
          style={{
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            marginLeft: '1rem',
            fontSize: '1rem'
          }}
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}

export default SensorData;