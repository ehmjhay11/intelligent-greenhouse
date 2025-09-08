import { useState, useEffect } from 'react';
import Head from 'next/head';
import { getApiBase } from '../lib/apiBase';

interface Alert {
  _id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  timestamp: string;
  plant_id?: string;
  sensor_id?: string;
}

type FilterStatus = 'all' | 'active' | 'acknowledged' | 'resolved';

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const API_BASE = getApiBase();

  useEffect(() => {
    fetchAlerts();
    // Set up polling for real-time updates
    const interval = setInterval(fetchAlerts, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${API_BASE}/alerts`);
      if (!response.ok) throw new Error('Failed to fetch alerts');
      const data = await response.json();
      setAlerts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAlertStatus = async (alertId: string, newStatus: Alert['status']) => {
    try {
      const response = await fetch(`${API_BASE}/alerts/${alertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update alert');

      const updatedAlert = await response.json();
      setAlerts(alerts.map(alert => 
        alert._id === alertId ? updatedAlert : alert
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return '#dc2626'; // red-600
      case 'high': return '#ea580c'; // orange-600
      case 'medium': return '#d97706'; // amber-600
      case 'low': return '#65a30d'; // lime-600
      default: return '#6b7280'; // gray-500
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return '#dc2626'; // red-600
      case 'acknowledged': return '#d97706'; // amber-600
      case 'resolved': return '#16a34a'; // green-600
      default: return '#6b7280'; // gray-500
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredAlerts = alerts.filter(alert => 
    filterStatus === 'all' ? true : alert.status === filterStatus
  );

  const getAlertCount = (status: FilterStatus): number => {
    if (status === 'all') return alerts.length;
    return alerts.filter(alert => alert.status === status).length;
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Alerts - Greenhouse Dashboard</title>
        </Head>
        <div className="loading">Loading alerts...</div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Alerts - Greenhouse Dashboard</title>
      </Head>

      <div className="alerts-container">
        <div className="alerts-header">
          <h1>System Alerts</h1>
          <p>Monitor and manage greenhouse alerts</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={filterStatus === 'all' ? 'active' : ''}
            onClick={() => setFilterStatus('all')}
          >
            All ({getAlertCount('all')})
          </button>
          <button 
            className={filterStatus === 'active' ? 'active' : ''}
            onClick={() => setFilterStatus('active')}
          >
            Active ({getAlertCount('active')})
          </button>
          <button 
            className={filterStatus === 'acknowledged' ? 'active' : ''}
            onClick={() => setFilterStatus('acknowledged')}
          >
            Acknowledged ({getAlertCount('acknowledged')})
          </button>
          <button 
            className={filterStatus === 'resolved' ? 'active' : ''}
            onClick={() => setFilterStatus('resolved')}
          >
            Resolved ({getAlertCount('resolved')})
          </button>
        </div>

        {/* Alerts List */}
        <div className="alerts-list">
          {filteredAlerts.length === 0 ? (
            <div className="no-alerts">
              <h3>No alerts found</h3>
              <p>
                {filterStatus === 'all' 
                  ? 'Your greenhouse system is running smoothly! 🌟'
                  : `No ${filterStatus} alerts at the moment.`
                }
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div key={alert._id} className="alert-card">
                <div className="alert-content">
                  <div className="alert-header">
                    <h3 className="alert-title">{alert.title}</h3>
                    <div className="alert-badges">
                      <span 
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(alert.severity) }}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(alert.status) }}
                      >
                        {alert.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="alert-message">{alert.message}</p>
                  
                  <div className="alert-meta">
                    <span className="alert-timestamp">
                      📅 {formatTimestamp(alert.timestamp)}
                    </span>
                  </div>
                </div>

                <div className="alert-actions">
                  {alert.status === 'active' && (
                    <button 
                      className="acknowledge-button"
                      onClick={() => updateAlertStatus(alert._id, 'acknowledged')}
                    >
                      Acknowledge
                    </button>
                  )}
                  
                  {(alert.status === 'active' || alert.status === 'acknowledged') && (
                    <button 
                      className="resolve-button"
                      onClick={() => updateAlertStatus(alert._id, 'resolved')}
                    >
                      Resolve
                    </button>
                  )}
                  
                  {alert.status === 'resolved' && (
                    <button 
                      className="reopen-button"
                      onClick={() => updateAlertStatus(alert._id, 'active')}
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
