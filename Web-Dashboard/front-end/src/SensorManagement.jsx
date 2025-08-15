import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3003/api';

function SensorManagement() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    location: '',
    ipAddress: ''
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch(`${API_BASE}/sensors`);
      const result = await response.json();
      if (result.success) {
        setDevices(result.data);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDevice = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/sensors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDevice)
      });
      const result = await response.json();
      
      if (result.success) {
        fetchDevices();
        setNewDevice({ name: '', location: '', ipAddress: '' });
        setShowAddForm(false);
  alert('Device added successfully!');
      } else {
        alert(result.message || 'Error adding device');
      }
    } catch (error) {
      console.error('Error adding device:', error);
      alert('Error adding device');
    }
  };

  const deleteDevice = async (id) => {
  if (!window.confirm('Are you sure you want to delete this device? This will remove all its sensors.')) return;
    
    try {
      const response = await fetch(`${API_BASE}/sensors/${id}`, { 
        method: 'DELETE' 
      });
      const result = await response.json();
      
      if (result.success) {
        fetchDevices();
  alert('Device deleted successfully!');
      } else {
        alert(result.message || 'Error deleting device');
      }
    } catch (error) {
      console.error('Error deleting device:', error);
      alert('Error deleting device');
    }
  };

  const toggleSensor = async (deviceId, sensorId) => {
    try {
      const response = await fetch(`${API_BASE}/sensors/${deviceId}/sensors/${sensorId}/toggle`, {
        method: 'PUT'
      });
      const result = await response.json();
      
      if (result.success) {
        fetchDevices();
        alert(result.message);
      } else {
        alert(result.message || 'Error toggling sensor');
      }
    } catch (error) {
      console.error('Error toggling sensor:', error);
      alert('Error toggling sensor');
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'soil_moisture': return '🌱';
      case 'temperature': return '🌡️';
      case 'humidity': return '💧';
      case 'light': return '☀️';
      default: return '📊';
    }
  };

  // Normalize any label like "ESP32 Device #X" -> "Device #X" for UI display
  const formatDeviceLabel = (name) => {
    if (!name) return '';
    return name.replace(/ESP32\s*Device\s*#?(\d+)/gi, (_, num) => `Device #${num}`);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading devices...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
  <h1 style={{ color: '#2c3e50', marginBottom: '1rem' }}>🔧 Device Management</h1>
      
      <button 
        onClick={() => setShowAddForm(!showAddForm)}
        style={{
          backgroundColor: showAddForm ? '#e74c3c' : '#27ae60',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '1rem'
        }}
      >
  {showAddForm ? '❌ Cancel' : '➕ Add New Device'}
      </button>

      {showAddForm && (
        <form 
          onSubmit={addDevice} 
          style={{ 
            marginBottom: '2rem', 
            padding: '1.5rem', 
            border: '2px solid #3498db',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
          }}
        >
          <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Add New Device</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Device Name:
            </label>
            <input
              type="text"
              value={newDevice.name}
              onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
              placeholder="e.g., Device #2"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Location:
            </label>
            <input
              type="text"
              value={newDevice.location}
              onChange={(e) => setNewDevice({...newDevice, location: e.target.value})}
              placeholder="e.g., Greenhouse Section B"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              IP Address (Optional):
            </label>
            <input
              type="text"
              value={newDevice.ipAddress}
              onChange={(e) => setNewDevice({...newDevice, ipAddress: e.target.value})}
              placeholder="e.g., 192.168.1.100"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
          
          <button 
            type="submit"
            style={{
              backgroundColor: '#27ae60',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ➕ Add Device
          </button>
        </form>
      )}

      <div>
        <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
          📡 Devices ({devices.length})
        </h3>
        
        {devices.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
            No devices found. Add your first device above!
          </p>
        ) : (
          devices.map(device => (
            <div 
              key={device.id} 
              style={{ 
                border: '2px solid #e9ecef',
                borderRadius: '12px',
                marginBottom: '2rem',
                backgroundColor: 'white',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              {/* Device Header */}
              <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid #e9ecef',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px 12px 0 0'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>
                    📡 {formatDeviceLabel(device.name)}
                  </h4>
                  <p style={{ margin: '0', color: '#6c757d', fontSize: '0.9rem' }}>
                    📍 {device.location}
                    {device.ipAddress && ` | 🌐 ${device.ipAddress}`}
                  </p>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#adb5bd', fontSize: '0.8rem' }}>
                    Added: {new Date(device.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <button 
                  onClick={() => deleteDevice(device.id)}
                  style={{ 
                    backgroundColor: '#dc3545', 
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Delete Device
                </button>
              </div>

              {/* Sensors */}
              <div style={{ padding: '1.5rem' }}>
                <h5 style={{ color: '#495057', marginBottom: '1rem' }}>
                  Sensors ({device.sensors.filter(s => s.isActive).length}/{device.sensors.length} active)
                </h5>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1rem'
                }}>
                  {device.sensors.map(sensor => (
                    <div 
                      key={sensor.id}
                      style={{
                        padding: '1rem',
                        border: `2px solid ${sensor.isActive ? '#28a745' : '#dc3545'}`,
                        borderRadius: '8px',
                        backgroundColor: sensor.isActive ? '#f8fff9' : '#fff5f5'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h6 style={{ margin: '0 0 0.5rem 0', color: '#343a40' }}>
                            {getTypeIcon(sensor.type)} {sensor.name}
                          </h6>
                          <p style={{ margin: '0', fontSize: '0.8rem', color: '#6c757d' }}>
                            📡 {sensor.mqttTopic}
                          </p>
                          <p style={{ margin: '0', fontSize: '0.8rem', color: '#6c757d' }}>
                            📍 Pin: {sensor.pin}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => toggleSensor(device.id, sensor.id)}
                          style={{
                            backgroundColor: sensor.isActive ? '#ffc107' : '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          {sensor.isActive ? '⏸️ Disable' : '▶️ Enable'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button 
        onClick={() => navigate('/')}
        style={{
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '2rem'
        }}
      >
        ← Back to Home
      </button>
    </div>
  );
}

export default SensorManagement;