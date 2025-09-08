import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getApiBase } from '../lib/apiBase';

interface Device {
  id: string;
  name: string;
  location: string;
  ipAddress?: string;
  createdAt: string;
  sensors: DeviceSensor[];
}

interface DeviceSensor {
  id: string;
  name: string;
  type: string;
  mqttTopic: string;
  isActive: boolean;
}

interface ModalRef {
  requestClose: () => void;
}

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  initialFocusRef?: React.RefObject<HTMLElement>;
}

// Modal Component with focus trap and animations
const Modal = React.forwardRef<ModalRef, ModalProps>(
  ({ title, onClose, children, initialFocusRef }, ref) => {
    const [show, setShow] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const previouslyFocusedRef = useRef<HTMLElement | null>(null);

    React.useImperativeHandle(ref, () => ({
      requestClose: () => handleRequestClose(),
    }));

    const handleRequestClose = useCallback(() => {
      setShow(false);
      setTimeout(() => onClose?.(), 200);
    }, [onClose]);

    useEffect(() => {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
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
      const onKeyDown = (e: KeyboardEvent) => {
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
          const first = focusable[0] as HTMLElement;
          const last = focusable[focusable.length - 1] as HTMLElement;
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
        if (previouslyFocusedRef.current && document.contains(previouslyFocusedRef.current)) {
          previouslyFocusedRef.current.focus();
        }
      };
    }, [initialFocusRef, handleRequestClose]);

    const onOverlayMouseDown = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) handleRequestClose();
    };

    return (
      <div className="modal-overlay" onMouseDown={onOverlayMouseDown}>
        <div
          className={`modal ${show ? 'show' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-device-title"
          ref={modalRef}
          tabIndex={-1}
        >
          <button aria-label="Close" className="modal-close" onClick={handleRequestClose}>×</button>
          <h2 id="add-device-title" className="modal-title">{title}</h2>
          <div className="modal-content">
            {children}
          </div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

export default function ManageSensors() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    location: '',
    ipAddress: ''
  });
  const addNameInputRef = useRef<HTMLInputElement>(null);
  const addModalRef = useRef<ModalRef>(null);
  const apiBase = getApiBase();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch(`${apiBase}/sensors`);
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

  const addDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiBase}/sensors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDevice)
      });
      const result = await response.json();
      
      if (result.success) {
        fetchDevices();
        setNewDevice({ name: '', location: '', ipAddress: '' });
        setIsAdding(false);
        alert('Device added successfully!');
      } else {
        alert(result.message || 'Error adding device');
      }
    } catch (error) {
      console.error('Error adding device:', error);
      alert('Error adding device');
    }
  };

  const deleteDevice = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this device? This will remove all its sensors.')) return;
    
    try {
      const response = await fetch(`${apiBase}/sensors/${id}`, { 
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

  const toggleSensor = async (deviceId: string, sensorId: string) => {
    try {
      const response = await fetch(`${apiBase}/sensors/${deviceId}/sensors/${sensorId}/toggle`, {
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

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'soil_moisture': return '🌱';
      case 'temperature': return '🌡️';
      case 'humidity': return '💧';
      case 'light': return '☀️';
      default: return '📊';
    }
  };

  // Normalize any label like "ESP32 Device #X" -> "Device #X" for UI display
  const formatDeviceLabel = (name: string) => {
    if (!name) return '';
    return name.replace(/ESP32\s*Device\s*#?(\d+)/gi, (_, num) => `Device #${num}`);
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Device Management - Greenhouse Dashboard</title>
        </Head>
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading devices...</div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Device Management - Greenhouse Dashboard</title>
      </Head>

      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '1rem' }}>🔧 Device Management</h1>
        
        <button 
          onClick={() => setIsAdding(true)}
          className="btn btn-success"
          style={{ marginBottom: '1rem' }}
        >
          ➕ Add New Device
        </button>

        {isAdding && (
          <Modal title="Add New Device" onClose={() => setIsAdding(false)} initialFocusRef={addNameInputRef} ref={addModalRef}>
            <form onSubmit={addDevice} className="device-form modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="add-device-name">Device Name</label>
                  <input
                    id="add-device-name"
                    type="text"
                    ref={addNameInputRef}
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                    placeholder="e.g., Device #2"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="add-device-location">Location</label>
                  <input
                    id="add-device-location"
                    type="text"
                    value={newDevice.location}
                    onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                    placeholder="e.g., Greenhouse Section B"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="add-device-ip">IP Address (Optional)</label>
                  <input
                    id="add-device-ip"
                    type="text"
                    value={newDevice.ipAddress}
                    onChange={(e) => setNewDevice({ ...newDevice, ipAddress: e.target.value })}
                    placeholder="e.g., 192.168.1.100"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => addModalRef.current?.requestClose()}>Cancel</button>
                <button type="submit" className="btn btn-success">Save</button>
              </div>
            </form>
          </Modal>
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
          onClick={() => router.push('/')}
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
    </>
  );
}
