import React, { useState, useEffect } from 'react';
import './styles/PlantManagement.css';

const PlantManagement = () => {
  const [plants, setPlants] = useState([]);
  const [devices, setDevices] = useState([]);
  const [editingPlant, setEditingPlant] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    stage: 'seedling',
    thresholds: {
      temperature: { min: 20, max: 30, ideal_min: 22, ideal_max: 26 },
      humidity: { min: 40, max: 80, ideal_min: 60, ideal_max: 70 },
      soil_moisture: { min: 30, max: 90, ideal_min: 50, ideal_max: 70 },
      light: { min: 200, max: 1000, ideal_min: 400, ideal_max: 800 }
    }
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // fetchPlants will automatically sync devices
        await fetchPlants();
      } catch (err) {
        setError('Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const fetchPlants = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/plants');
      const result = await response.json();
      if (result.success && result.data) {
        setPlants(result.data);
        // Sync devices with the latest plant data
        await syncDevicesWithPlants(result.data);
      } else {
        console.error('Invalid response format:', result);
        setPlants([]);
      }
    } catch (error) {
      console.error('Error fetching plants:', error);
      setPlants([]);
    }
  };

  const syncDevicesWithPlants = async (currentPlants) => {
    try {
      const response = await fetch('http://localhost:5001/api/sensors');
      const result = await response.json();
      if (result.success && result.data) {
        // Add assignedPlant field to devices based on plant assignments
        const devicesWithAssignments = result.data.map(device => {
          // Find if any plant is assigned to this device
          const assignedPlant = currentPlants.find(plant => plant.assignedDevice === device.id);
          return {
            ...device,
            assignedPlant: assignedPlant ? assignedPlant.id : null
          };
        });
        setDevices(devicesWithAssignments);
      } else {
        console.error('Invalid response format:', result);
        setDevices([]);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      setDevices([]);
    }
  };

  const fetchDevices = async () => {
    return syncDevicesWithPlants(plants);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingPlant 
        ? `http://localhost:5001/api/plants/${editingPlant.id}`
        : 'http://localhost:5001/api/plants';
      
      const method = editingPlant ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchPlants();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving plant:', error);
    }
  };

  const handleDelete = async (plantId) => {
    if (window.confirm('Are you sure you want to delete this plant?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/plants/${plantId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchPlants();
        }
      } catch (error) {
        console.error('Error deleting plant:', error);
      }
    }
  };

  const handleAssignDevice = async (plantId, deviceId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/plants/${plantId}/assign-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId }),
      });

      if (response.ok) {
        // Refresh both plants and devices to show updated assignments
        await fetchPlants();
      } else {
        const errorData = await response.json();
        console.error('Error assigning device:', errorData);
        alert(`Failed to assign device: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error assigning device:', error);
      alert('Failed to assign device. Please try again.');
    }
  };

  const handleUnassignDevice = async (plantId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/plants/${plantId}/assign-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId: null }),
      });

      if (response.ok) {
        // Refresh both plants and devices to show updated assignments
        await fetchPlants();
      } else {
        const errorData = await response.json();
        console.error('Error unassigning device:', errorData);
        alert(`Failed to unassign device: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error unassigning device:', error);
      alert('Failed to unassign device. Please try again.');
    }
  };

  const sendThresholdsToDevice = async (plant) => {
    try {
      const response = await fetch(`http://localhost:5001/api/plants/${plant.id}/send-thresholds`, {
        method: 'POST',
      });

      if (response.ok) {
        alert(`Thresholds sent to ${plant.name}'s device successfully!`);
      } else {
        alert('Failed to send thresholds to device');
      }
    } catch (error) {
      console.error('Error sending thresholds:', error);
      alert('Error sending thresholds to device');
    }
  };

  const sendTestCommand = async (deviceId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/plants/test-command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId })
      });

      const result = await response.json();
      if (result.success) {
        alert('🧪 Test command sent successfully! Check ESP32 Serial Monitor for response.');
      } else {
        alert('❌ Failed to send test command: ' + result.message);
      }
    } catch (error) {
      console.error('Error sending test command:', error);
      alert('❌ Error sending test command');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      description: '',
      stage: 'seedling',
      thresholds: {
        temperature: { min: 20, max: 30, ideal_min: 22, ideal_max: 26 },
        humidity: { min: 40, max: 80, ideal_min: 60, ideal_max: 70 },
        soil_moisture: { min: 30, max: 90, ideal_min: 50, ideal_max: 70 },
        light: { min: 200, max: 1000, ideal_min: 400, ideal_max: 800 }
      }
    });
    setEditingPlant(null);
    setIsAdding(false);
  };

  const startEdit = (plant) => {
    setEditingPlant(plant);
    setFormData(plant);
  };

  const updateThreshold = (sensor, field, value) => {
    setFormData(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [sensor]: {
          ...prev.thresholds[sensor],
          [field]: parseFloat(value) || 0
        }
      }
    }));
  };

  const getPlantTypeIcon = (type) => {
    const icons = {
      'tomato': '🍅',
      'lettuce': '🥬',
      'herbs': '🌿',
      'peppers': '🌶️',
      'cucumber': '🥒',
      'basil': '🌿',
      'spinach': '🥬',
      'default': '🌱'
    };
    return icons[type.toLowerCase()] || icons.default;
  };

  const getStageColor = (stage) => {
    const colors = {
      'seedling': '#28a745',
      'growing': '#ffc107',
      'flowering': '#e83e8c',
      'fruiting': '#fd7e14',
      'harvesting': '#20c997'
    };
    return colors[stage] || '#6c757d';
  };

  const getDeviceForPlant = (plantId) => {
    return devices.find(device => device.assignedPlant === plantId);
  };

  const getUnassignedDevices = () => {
    return devices.filter(device => !device.assignedPlant);
  };

  return (
    <div className="container">
      {loading && (
        <div className="loading-state">
          <p>Loading plant management system...</p>
        </div>
      )}
      
      {error && (
        <div className="error-state">
          <p>Error: {error}</p>
          <button 
            className="btn btn-primary"
            onClick={async () => {
              setError(null);
              setLoading(true);
              try {
                await fetchPlants();
              } finally {
                setLoading(false);
              }
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="section-header">
        <h2>🌱 Plant Management</h2>
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => setIsAdding(true)}
          >
            + Add New Plant
          </button>
          <button 
            className="btn btn-secondary"
            onClick={async () => {
              setLoading(true);
              try {
                await fetchPlants();
              } finally {
                setLoading(false);
              }
            }}
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {(isAdding || editingPlant) && (
        <form onSubmit={handleSubmit} className="plant-form">
          <h3>{editingPlant ? 'Edit Plant' : 'Add New Plant'}</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Plant Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="e.g., Cherry Tomatoes"
              />
            </div>

            <div className="form-group">
              <label>Plant Type</label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                required
                placeholder="e.g., tomato, lettuce, herbs"
              />
            </div>

            <div className="form-group">
              <label>Growth Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value }))}
              >
                <option value="seedling">🌱 Seedling</option>
                <option value="growing">🌿 Growing</option>
                <option value="flowering">🌸 Flowering</option>
                <option value="fruiting">🍇 Fruiting</option>
                <option value="harvesting">🌾 Harvesting</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the plant variety..."
                rows="3"
              />
            </div>
          </div>

          <div className="threshold-editor">
            <h4>Environmental Thresholds</h4>
            
            {Object.entries(formData.thresholds).map(([sensor, values]) => (
              <div key={sensor} className="threshold-group">
                <h5>
                  {sensor === 'temperature' && '🌡️'}
                  {sensor === 'humidity' && '💧'}
                  {sensor === 'soil_moisture' && '🌱'}
                  {sensor === 'light' && '☀️'}
                  {sensor.replace('_', ' ')}
                </h5>
                <div className="threshold-inputs">
                  <div className="threshold-input-group">
                    <label className="threshold-input-label">Min</label>
                    <input
                      type="number"
                      className="threshold-input"
                      value={values.min}
                      onChange={(e) => updateThreshold(sensor, 'min', e.target.value)}
                    />
                  </div>
                  <div className="threshold-input-group">
                    <label className="threshold-input-label">Ideal Min</label>
                    <input
                      type="number"
                      className="threshold-input"
                      value={values.ideal_min}
                      onChange={(e) => updateThreshold(sensor, 'ideal_min', e.target.value)}
                    />
                  </div>
                  <div className="threshold-input-group">
                    <label className="threshold-input-label">Ideal Max</label>
                    <input
                      type="number"
                      className="threshold-input"
                      value={values.ideal_max}
                      onChange={(e) => updateThreshold(sensor, 'ideal_max', e.target.value)}
                    />
                  </div>
                  <div className="threshold-input-group">
                    <label className="threshold-input-label">Max</label>
                    <input
                      type="number"
                      className="threshold-input"
                      value={values.max}
                      onChange={(e) => updateThreshold(sensor, 'max', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <div className="threshold-actions">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success">
                {editingPlant ? 'Update Plant' : 'Create Plant'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="plant-grid">
        {plants.map(plant => {
          const assignedDevice = getDeviceForPlant(plant.id);
          
          return (
            <div key={plant.id} className="plant-card">
              <div className="plant-header">
                <h3 className="plant-name">
                  <span className="plant-type-icons">
                    {getPlantTypeIcon(plant.type)} {plant.name}
                  </span>
                </h3>
                <span 
                  className="plant-stage"
                  style={{ backgroundColor: getStageColor(plant.stage) + '20', 
                          borderColor: getStageColor(plant.stage) }}
                >
                  {plant.stage}
                </span>
              </div>

              <p className="plant-description">{plant.description}</p>

              <div className="plant-stats">
                <span className="plant-stat">Type: {plant.type}</span>
                {assignedDevice && (
                  <span className="plant-stat">Device: {assignedDevice.name}</span>
                )}
              </div>

              <div className="thresholds-display">
                <strong>🌡️ Temperature:</strong> {plant.thresholds.temperature.min}-{plant.thresholds.temperature.max}°C 
                (Ideal: {plant.thresholds.temperature.ideal_min}-{plant.thresholds.temperature.ideal_max}°C)<br/>
                <strong>💧 Humidity:</strong> {plant.thresholds.humidity.min}-{plant.thresholds.humidity.max}% 
                (Ideal: {plant.thresholds.humidity.ideal_min}-{plant.thresholds.humidity.ideal_max}%)<br/>
                <strong>🌱 Soil:</strong> {plant.thresholds.soil_moisture.min}-{plant.thresholds.soil_moisture.max}% 
                (Ideal: {plant.thresholds.soil_moisture.ideal_min}-{plant.thresholds.soil_moisture.ideal_max}%)<br/>
                <strong>☀️ Light:</strong> {plant.thresholds.light.min}-{plant.thresholds.light.max} 
                (Ideal: {plant.thresholds.light.ideal_min}-{plant.thresholds.light.ideal_max})
              </div>

              <div className="card-actions">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => startEdit(plant)}
                >
                  Edit
                </button>
                {assignedDevice && (
                  <>
                    <button 
                      className="btn btn-warning btn-sm"
                      onClick={() => sendThresholdsToDevice(plant)}
                    >
                      📡 Send to Device
                    </button>
                    <button 
                      className="btn btn-info btn-sm"
                      onClick={() => sendTestCommand(assignedDevice.id)}
                      title="Send test command to ESP32 for debugging"
                    >
                      🧪 Test Command
                    </button>
                  </>
                )}
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(plant.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <h3>📡 Device Assignment</h3>
      <div className="assignment-grid">
        {devices.map(device => {
          const assignedPlant = plants.find(plant => plant.id === device.assignedPlant);
          
          return (
            <div key={device.id} className="device-assignment-card">
              <h4 className="device-name">
                📟 {device.name}
              </h4>
              <p className="device-location">📍 {device.location}</p>

              <div className={`assignment-status ${assignedPlant ? 'assignment-active' : 'assignment-inactive'}`}>
                {assignedPlant ? (
                  <>
                    ✅ Assigned to: <strong>{assignedPlant.name}</strong>
                  </>
                ) : (
                  <>
                    ⚠️ Not assigned to any plant
                  </>
                )}
              </div>

              <select
                className="assignment-select"
                value={device.assignedPlant || ''}
                onChange={(e) => {
                  const selectedPlantId = e.target.value;
                  if (selectedPlantId) {
                    handleAssignDevice(selectedPlantId, device.id);
                  } else {
                    // Handle unassigning - we need to find which plant has this device and unassign it
                    const plantWithThisDevice = plants.find(plant => plant.assignedDevice === device.id);
                    if (plantWithThisDevice) {
                      handleUnassignDevice(plantWithThisDevice.id);
                    }
                  }
                }}
              >
                <option value="">Select a plant...</option>
                {plants.map(plant => (
                  <option key={plant.id} value={plant.id}>
                    {getPlantTypeIcon(plant.type)} {plant.name}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {devices.length === 0 && !loading && (
        <div className="empty-state">
          <p>No devices found. Make sure your ESP32 devices are connected and publishing data.</p>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default PlantManagement;
