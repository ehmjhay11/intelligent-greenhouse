import React, { useState, useEffect, useRef, useCallback } from 'react';
import API_BASE from './lib/apiBase';
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
  assignedDevices: [],
    thresholds: {
      temperature: { min: 20, max: 30, ideal_min: 22, ideal_max: 26 },
      humidity: { min: 40, max: 80, ideal_min: 60, ideal_max: 70 },
      soil_moisture: { min: 30, max: 90, ideal_min: 50, ideal_max: 70 },
      light: { min: 200, max: 1000, ideal_min: 400, ideal_max: 800 }
    }
  });

  const fetchPlants = useCallback(async () => {
    try {
      console.log('Fetching plants from backend...');
  const response = await fetch(`${API_BASE}/plants`);
      const result = await response.json();
      console.log('Plants response:', result);
      if (result.success && result.data) {
        setPlants(result.data);
        console.log('Plants loaded:', result.data.length, 'plants');
  await syncDevicesWithPlants(result.data);
      } else {
        console.error('Invalid response format:', result);
        setPlants([]);
      }
    } catch (error) {
      console.error('Error fetching plants:', error);
      setPlants([]);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchPlants();
      } catch (err) {
        setError('Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [fetchPlants]);

  const syncDevicesWithPlants = async (currentPlants) => {
    try {
      // Fetch real devices from the SensorManagement API
      console.log('Fetching real devices from API...');
  const response = await fetch(`${API_BASE}/sensors`);
      const result = await response.json();
      
      if (result.success && result.data) {
        console.log('Real devices fetched:', result.data.length, 'devices');
        console.log('Current plants:', currentPlants.map(p => ({ id: p._id, name: p.name, assignedDevice: p.assignedDevice })));
        
        // Add assignedPlant field to devices based on plant assignments
        const devicesWithAssignments = result.data.map(device => {
          const deviceIdStr = String(device.id);
          const assignedPlant = currentPlants.find(plant => Array.isArray(plant.assignedDevices) && plant.assignedDevices.includes(deviceIdStr));
          return { ...device, assignedPlant: assignedPlant ? assignedPlant._id : null };
        });
        
        console.log('Devices with assignments:', devicesWithAssignments);
        setDevices(devicesWithAssignments);
      } else {
        console.warn('No devices found in SensorManagement');
        setDevices([]);
      }
    } catch (error) {
      console.error('Error fetching devices from API:', error);
      setDevices([]);
    }
  };

  // Removed unused fetchDevices (sync is triggered by fetchPlants)

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingPlant
        ? `${API_BASE}/plants/${editingPlant._id}`
        : `${API_BASE}/plants`;
      const method = editingPlant ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          assignedDevices: Array.isArray(formData.assignedDevices) ? formData.assignedDevices.map(String) : [],
        }),
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
  const response = await fetch(`${API_BASE}/plants/${plantId}`, {
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

  // Removed unused handleAssignDevice and handleUnassignDevice (assignment handled inline below)

// ...existing code...
const sendThresholdsToDevice = async (plant) => {
  try {
    console.log('🔄 === SENDING THRESHOLDS TO DEVICE ===');
    console.log('📋 Plant Details:', {
      id: plant._id,
      name: plant.name,
      assignedDevices: plant.assignedDevices,
      thresholds: plant.thresholds
    });
    
    // Check if plant has assigned devices
    if (!plant.assignedDevices || plant.assignedDevices.length === 0) {
      alert('❌ No devices assigned to this plant. Please assign a device first.');
      return;
    }
    
  const requestUrl = `${API_BASE}/plants/${plant._id}/send-thresholds`;
    console.log('📤 Request URL:', requestUrl);
    console.log('📤 Request Method: POST');
    console.log('🕐 Timestamp:', new Date().toISOString());
    
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 Response Status:', response.status, response.statusText);
    
    const responseData = await response.json();
    console.log('📄 Response Data:', responseData);

    if (response.ok && responseData.success) {
      console.log('✅ SUCCESS: Thresholds sent successfully');
      console.log('📡 Devices that received thresholds:', responseData.devices);
      console.log('📺 Check ESP32 Serial Monitor for threshold update confirmation...');
      
      const deviceList = responseData.devices
        .filter(d => d.success)
        .map(d => `Device #${d.deviceId}`)
        .join(', ');
      
      alert(`✅ Thresholds sent successfully!\n\n` +
            `🌱 Plant: ${plant.name}\n` +
            `📡 Devices: ${deviceList}\n\n` +
            `🔍 Check ESP32 Serial Monitor for confirmation.`);
    } else {
      console.error('❌ ERROR: Failed to send thresholds');
      console.error('❌ Error details:', responseData);
      
      let errorMessage = responseData.message || 'Unknown error';
      if (responseData.devices) {
        const failedDevices = responseData.devices
          .filter(d => !d.success)
          .map(d => `Device #${d.deviceId}: ${d.error || 'Failed'}`)
          .join('\n');
        if (failedDevices) {
          errorMessage += '\n\nFailed devices:\n' + failedDevices;
        }
      }
      
      alert(`❌ Failed to send thresholds:\n\n${errorMessage}\n\n` +
            `💡 Tips:\n` +
            `• Check if the device is online\n` +
            `• Verify MQTT broker connection\n` +
            `• Check backend logs for details`);
    }
  } catch (error) {
    console.error('❌ NETWORK ERROR: Error sending thresholds:', error);
    alert(`❌ Network error sending thresholds:\n\n${error.message}\n\n` +
          `💡 Check if the backend server is running.`);
  }
};
// ...existing code...

  const sendTestCommand = async (deviceId) => {
    try {
      console.log('🧪 === SENDING TEST COMMAND ===');
      console.log('📋 Device ID:', deviceId);
      console.log('🕐 Timestamp:', new Date().toISOString());
      
  const requestUrl = `${API_BASE}/plants/test-command`;
      console.log('📤 Request URL:', requestUrl);
      console.log('📤 Request Body:', { deviceId });
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId })
      });

      console.log('📊 Response Status:', response.status, response.statusText);
      const result = await response.json();
      console.log('📄 Response Data:', result);
      
      if (result.success) {
        console.log('✅ SUCCESS: Test command sent successfully');
        console.log('📡 MQTT Topic:', result.topic);
        console.log('📺 Now check ESP32 Serial Monitor for response...');
        alert('🧪 Test command sent successfully! Check ESP32 Serial Monitor for response.');
      } else {
        console.error('❌ ERROR: Failed to send test command');
        console.error('❌ Error details:', result);
        alert('❌ Failed to send test command: ' + result.message);
      }
    } catch (error) {
      console.error('❌ NETWORK ERROR: Error sending test command:', error);
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
    setFormData({
      ...plant,
      assignedDevices: Array.isArray(plant.assignedDevices) ? plant.assignedDevices : [],
    });
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

  // getDeviceForPlant removed (no longer used)

  // Removed unused getUnassignedDevices helper

  // Normalize device labels like "ESP32 Device #X" -> "Device #X" for UI display
  const formatDeviceLabel = (name) => {
    if (!name) return '';
    return name.replace(/ESP32\s*Device\s*#?(\d+)/gi, (_, num) => `Device #${num}`);
  };

  // Modal focus handling for Add New Plant (initial focus only)
  const addNameInputRef = useRef(null);
  const addModalRef = useRef(null);
  useEffect(() => {
    if (isAdding) {
      // focus first input after next tick
      const t = setTimeout(() => {
        addNameInputRef.current?.focus();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [isAdding]);

  // Accessible Modal with focus trap, ESC close, body scroll lock, and animated close
  const Modal = React.forwardRef(({ title, onClose, children, initialFocusRef }, ref) => {
    const [show, setShow] = useState(false);
    const modalRef = useRef(null);
    const previouslyFocusedRef = useRef(null);

    // expose imperative close for children (e.g., Cancel button)
    React.useImperativeHandle(ref, () => ({
      requestClose: () => handleRequestClose(),
    }));

    const handleRequestClose = useCallback(() => {
      setShow(false);
      setTimeout(() => onClose?.(), 200);
    }, [onClose]);

    useEffect(() => {
      previouslyFocusedRef.current = document.activeElement;
      // Lock body scroll
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Trigger enter animation
      const t = setTimeout(() => setShow(true), 0);

      // Focus management
      const focusTimer = setTimeout(() => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        } else {
          modalRef.current?.focus();
        }
      }, 10);

      // Keydown for ESC and Tab trap
      const onKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          handleRequestClose();
        }
        if (e.key === 'Tab') {
          // Focus trap
          const focusable = modalRef.current?.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          );
          if (!focusable || focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };
      document.addEventListener('keydown', onKeyDown);

      return () => {
        clearTimeout(t);
        clearTimeout(focusTimer);
        document.removeEventListener('keydown', onKeyDown);
        document.body.style.overflow = prevOverflow;
        // Return focus
        previouslyFocusedRef.current && previouslyFocusedRef.current.focus?.();
      };
    }, [initialFocusRef, handleRequestClose]);

    const onOverlayMouseDown = (e) => {
      if (e.target === e.currentTarget) handleRequestClose();
    };

    return (
      <div className="modal-overlay" onMouseDown={onOverlayMouseDown}>
        <div
          className={`modal ${show ? 'show' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-plant-title"
          ref={modalRef}
          tabIndex={-1}
        >
          <button aria-label="Close" className="modal-close" onClick={handleRequestClose}>×</button>
          <h2 id="add-plant-title" className="modal-title">{title}</h2>
          <div className="modal-content">
            {children}
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="plant-container">
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
        <h1 className="main-title">🌱 Assign Plant</h1>
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

      {isAdding && (
  <Modal title="Add New Plant" onClose={resetForm} initialFocusRef={addNameInputRef} ref={addModalRef}>
          <form onSubmit={handleSubmit} className="plant-form modal-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="add-plant-name">Plant Name</label>
                <input
                  id="add-plant-name"
                  type="text"
                  ref={addNameInputRef}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="e.g., Cherry Tomatoes"
                />
              </div>

              <div className="form-group">
                <label htmlFor="add-plant-type">Plant Type</label>
                <input
                  id="add-plant-type"
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  required
                  placeholder="e.g., tomato, lettuce, herbs"
                />
              </div>

              <div className="form-group">
                <label htmlFor="add-plant-stage">Growth Stage</label>
                <select
                  id="add-plant-stage"
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
                <label htmlFor="add-plant-description">Description</label>
                <textarea
                  id="add-plant-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the plant variety..."
                  rows="3"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Assign Devices (optional)</label>
              <div className="checkbox-list">
                {devices.map(d => (
                  <label key={d.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={(formData.assignedDevices || []).includes(String(d.id))}
                      onChange={(e) => {
                        const id = String(d.id);
                        setFormData(prev => ({
                          ...prev,
                          assignedDevices: e.target.checked
                            ? Array.from(new Set([...(prev.assignedDevices || []), id]))
                            : (prev.assignedDevices || []).filter(x => x !== id)
                        }));
                      }}
                    />
                    <span>{formatDeviceLabel(d.name)}</span>
                  </label>
                ))}
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
                      <input type="number" className="threshold-input" value={values.min}
                        onChange={(e) => updateThreshold(sensor, 'min', e.target.value)} />
                    </div>
                    <div className="threshold-input-group">
                      <label className="threshold-input-label">Ideal Min</label>
                      <input type="number" className="threshold-input" value={values.ideal_min}
                        onChange={(e) => updateThreshold(sensor, 'ideal_min', e.target.value)} />
                    </div>
                    <div className="threshold-input-group">
                      <label className="threshold-input-label">Ideal Max</label>
                      <input type="number" className="threshold-input" value={values.ideal_max}
                        onChange={(e) => updateThreshold(sensor, 'ideal_max', e.target.value)} />
                    </div>
                    <div className="threshold-input-group">
                      <label className="threshold-input-label">Max</label>
                      <input type="number" className="threshold-input" value={values.max}
                        onChange={(e) => updateThreshold(sensor, 'max', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}

              <div className="threshold-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => addModalRef.current?.requestClose()}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">Create Plant</button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Keep editing inline for now */}
      {editingPlant && !isAdding && (
  <form onSubmit={handleSubmit} className="plant-form">
          <h3>Edit Plant</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="edit-plant-name">Plant Name</label>
              <input
                id="edit-plant-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="e.g., Cherry Tomatoes"
              />
            </div>

            <div className="form-group">
              <label>Assign Devices (optional)</label>
              <div className="checkbox-list">
                {devices.map(d => (
                  <label key={d.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={(formData.assignedDevices || []).includes(String(d.id))}
                      onChange={(e) => {
                        const id = String(d.id);
                        setFormData(prev => ({
                          ...prev,
                          assignedDevices: e.target.checked
                            ? Array.from(new Set([...(prev.assignedDevices || []), id]))
                            : (prev.assignedDevices || []).filter(x => x !== id)
                        }));
                      }}
                    />
                    <span>{formatDeviceLabel(d.name)}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="edit-plant-type">Plant Type</label>
              <input
                id="edit-plant-type"
                type="text"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                required
                placeholder="e.g., tomato, lettuce, herbs"
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-plant-stage">Growth Stage</label>
              <select
                id="edit-plant-stage"
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
              <label htmlFor="edit-plant-description">Description</label>
              <textarea
                id="edit-plant-description"
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
                    <input type="number" className="threshold-input" value={values.min}
                      onChange={(e) => updateThreshold(sensor, 'min', e.target.value)} />
                  </div>
                  <div className="threshold-input-group">
                    <label className="threshold-input-label">Ideal Min</label>
                    <input type="number" className="threshold-input" value={values.ideal_min}
                      onChange={(e) => updateThreshold(sensor, 'ideal_min', e.target.value)} />
                  </div>
                  <div className="threshold-input-group">
                    <label className="threshold-input-label">Ideal Max</label>
                    <input type="number" className="threshold-input" value={values.ideal_max}
                      onChange={(e) => updateThreshold(sensor, 'ideal_max', e.target.value)} />
                  </div>
                  <div className="threshold-input-group">
                    <label className="threshold-input-label">Max</label>
                    <input type="number" className="threshold-input" value={values.max}
                      onChange={(e) => updateThreshold(sensor, 'max', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <div className="threshold-actions">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn btn-success">Update Plant</button>
            </div>
          </div>
        </form>
      )}

      <div className="plant-grid">
        {plants.map(plant => {
          return (
            <div key={plant._id} className="plant-card">
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
                {Array.isArray(plant.assignedDevices) && plant.assignedDevices.length > 0 && (
                  <span className="plant-stat">Devices: {(plant.assignedDevices || []).map(id => {
                    const dev = devices.find(d => String(d.id) === String(id));
                    return formatDeviceLabel(dev?.name || `Device ${id}`);
                  }).join(', ')}</span>
                )}
              </div>

              <ul className="thresholds-display">
                <li className="threshold-item">
                  <strong>🌡️ Temperature:</strong> {plant.thresholds.temperature.min}-{plant.thresholds.temperature.max}°C
                  <span className="threshold-ideal">(Ideal: {plant.thresholds.temperature.ideal_min}-{plant.thresholds.temperature.ideal_max}°C)</span>
                </li>
                <li className="threshold-item">
                  <strong>💧 Humidity:</strong> {plant.thresholds.humidity.min}-{plant.thresholds.humidity.max}%
                  <span className="threshold-ideal">(Ideal: {plant.thresholds.humidity.ideal_min}-{plant.thresholds.humidity.ideal_max}%)</span>
                </li>
                <li className="threshold-item">
                  <strong>🌱 Soil:</strong> {plant.thresholds.soil_moisture.min}-{plant.thresholds.soil_moisture.max}%
                  <span className="threshold-ideal">(Ideal: {plant.thresholds.soil_moisture.ideal_min}-{plant.thresholds.soil_moisture.ideal_max}%)</span>
                </li>
                <li className="threshold-item">
                  <strong>☀️ Light:</strong> {plant.thresholds.light.min}-{plant.thresholds.light.max}
                  <span className="threshold-ideal">(Ideal: {plant.thresholds.light.ideal_min}-{plant.thresholds.light.ideal_max})</span>
                </li>
              </ul>

              <div className="card-actions">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => startEdit(plant)}
                >
                  Edit
                </button>
        {Array.isArray(plant.assignedDevices) && plant.assignedDevices.length > 0 && (
                  <>
                    <button 
                      className="btn btn-warning btn-sm"
          onClick={() => sendThresholdsToDevice(plant)}
                    >
                      📡 Send to Device
                    </button>
                    <button 
                      className="btn btn-info btn-sm"
          onClick={() => plant.assignedDevices.forEach(id => sendTestCommand(id))}
                      title="Send test command to ESP32 for debugging"
                    >
                      🧪 Test Command
                    </button>
                  </>
                )}
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(plant._id)}
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
      const assignedPlant = plants.find(plant => Array.isArray(plant.assignedDevices) && plant.assignedDevices.includes(String(device.id)));
          
          return (
            <div key={device.id} className="device-assignment-card">
              <h4 className="device-name">
                📟 {formatDeviceLabel(device.name)}
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
                onChange={async (e) => {
                  const selectedPlantId = e.target.value;
                  const id = String(device.id);
                  if (selectedPlantId) {
                    // Add device to plant's assignedDevices
                    const plant = plants.find(p => p._id === selectedPlantId);
                    const updated = Array.from(new Set([...(plant?.assignedDevices || []), id]));
                    await fetch(`${API_BASE}/plants/${selectedPlantId}/set-devices`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ deviceIds: updated })
                    });
                    await fetchPlants();
                  } else {
                    // remove device from whoever currently has it
                    const plantWithDevice = plants.find(p => Array.isArray(p.assignedDevices) && p.assignedDevices.includes(id));
                    if (plantWithDevice) {
                      const updated = plantWithDevice.assignedDevices.filter(d => d !== id);
                      await fetch(`${API_BASE}/plants/${plantWithDevice._id}/set-devices`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ deviceIds: updated })
                      });
                      await fetchPlants();
                    }
                  }
                }}
              >
                <option value="">Select a plant...</option>
                {plants.map(plant => (
                  <option key={plant._id} value={plant._id}>
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
      <p>No devices found. Make sure your devices are connected and publishing data.</p>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default PlantManagement;
