import React, { useState, useEffect } from 'react';
import API_BASE from './lib/apiBase';
import './styles/AlertsPanel.css';
import './styles/DashboardPages.css';

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
      const response = await fetch(`${API_BASE}/alerts`);
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
      await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
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

  const formatTime = (d) => new Date(d).toLocaleString();

  return (
    <main className="page-container" role="main">
      <header className="page-header fade-in">
        <h1 className="page-title">Alerts</h1>
        <p className="page-subtitle">Active notifications with severity and timestamps.</p>
      </header>

      {loading ? (
        <div className="loading">Loading alerts...</div>
      ) : (
        <section className="page-section">
          {alerts.length === 0 ? (
            <div className="card card-body text-center">✅ All systems normal - no active alerts</div>
          ) : (
            <ul className="alerts-list">
              {alerts.map((alert) => (
                <li key={alert._id} className="alert-card fade-in" style={{ borderLeft: `4px solid ${getSeverityColor(alert.severity)}` }}>
                  <div className="card-body">
                    <div>
                      <h3 className="card-title flex items-center gap-2">
                        <span aria-hidden>{getAlertIcon(alert.type)}</span>
                        <span>{alert.title}</span>
                      </h3>
                      <p className="card-subtitle">{alert.message}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span
                        className={`badge ${
                          alert.severity === 'critical'
                            ? 'badge-danger'
                            : alert.severity === 'warning'
                            ? 'badge-warning'
                            : alert.severity === 'info'
                            ? 'badge-info'
                            : 'badge-success'
                        }`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="alert-meta">{formatTime(alert.createdAt)}</span>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => acknowledgeAlert(alert._id)}
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
};

export default AlertsPanel;
