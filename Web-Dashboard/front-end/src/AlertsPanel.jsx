import React, { useState, useEffect } from 'react';
import './styles/AlertsPanel.css';

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:3003/api/alerts');
      const result = await response.json();
      if (result.success) {
        setAlerts(result.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      await fetch(`http://localhost:3003/api/alerts/${alertId}/acknowledge`, {
        method: 'POST',
      });
      fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const getAlertIcon = (type) => {
    const icons = {
      'temperature': '🌡️',
      'humidity': '💧',
      'soil_moisture': '🌱',
      'light': '☀️',
      'offline': '📡'
    };
    return icons[type] || '⚠️';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': '#dc3545',
      'warning': '#ffc107',
      'info': '#17a2b8'
    };
    return colors[severity] || '#6c757d';
  };

  return (
    <div className="alerts-panel">
      <div className="alerts-header">
        <h3>🚨 Active Alerts</h3>
        <span className="alert-count">{alerts.length}</span>
      </div>

      {loading ? (
        <div className="loading">Loading alerts...</div>
      ) : (
        <div className="alerts-list">
          {alerts.length === 0 ? (
            <div className="no-alerts">
              ✅ All systems normal - no active alerts
            </div>
          ) : (
            alerts.map(alert => (
              <div 
                key={alert._id} 
                className={`alert-item ${alert.severity}`}
                style={{ borderLeftColor: getSeverityColor(alert.severity) }}
              >
                <div className="alert-content">
                  <div className="alert-header">
                    <span className="alert-icon">{getAlertIcon(alert.type)}</span>
                    <span className="alert-title">{alert.title}</span>
                    <span className="alert-time">
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-details">
                    Plant: {alert.plantName} | Device: {alert.deviceId}
                  </div>
                </div>
                <button 
                  className="acknowledge-btn"
                  onClick={() => acknowledgeAlert(alert._id)}
                >
                  ✓
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
