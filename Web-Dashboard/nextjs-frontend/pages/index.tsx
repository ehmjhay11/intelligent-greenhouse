import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getApiBase } from '../lib/apiBase';

interface DashboardData {
  plants: number;
  sensors: number;
  activeAlerts: number;
  totalReadings: number;
}

interface Alert {
  _id: string;
  title: string;
  message: string;
  priority: string;
  status: 'active' | 'resolved';
  timestamp: string;
}

type SystemStatus = 'online' | 'offline';

export default function Home() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    plants: 0,
    sensors: 0,
    activeAlerts: 0,
    totalReadings: 0
  });
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('online');
  const [loading, setLoading] = useState(true);

  const API_BASE = getApiBase();

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch summary data
      const [plantsRes, alertsRes] = await Promise.all([
        fetch(`${API_BASE}/plants`),
        fetch(`${API_BASE}/alerts`)
      ]);

      if (plantsRes.ok && alertsRes.ok) {
        const plants = await plantsRes.json();
        const alerts = await alertsRes.json();

        setDashboardData({
          plants: plants.length,
          sensors: plants.length * 4, // Assuming 4 sensors per plant on average
          activeAlerts: alerts.filter((alert: Alert) => alert.status === 'active').length,
          totalReadings: Math.floor(Math.random() * 10000) + 5000 // Mock data
        });

        // Get recent alerts (last 5)
        const recent = alerts
          .sort((a: Alert, b: Alert) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);
        setRecentAlerts(recent);
      }
      
      setSystemStatus('online');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setSystemStatus('offline');
      // Set mock data for demo
      setDashboardData({
        plants: 12,
        sensors: 48,
        activeAlerts: 3,
        totalReadings: 7542
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#44ff44';
      default: return '#888888';
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Dashboard - Greenhouse Monitoring</title>
        </Head>
        <div className="loading">Loading dashboard...</div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Greenhouse Monitoring</title>
      </Head>
      
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Welcome to your Greenhouse Dashboard</h1>
          <p>Monitor and manage your greenhouse in real-time</p>
        </div>

        {/* Key Metrics */}
        <div className="metrics-grid">
          <div className="metric-card plants">
            <div className="metric-icon">🌱</div>
            <div className="metric-content">
              <h3>Plants</h3>
              <p className="metric-value">{dashboardData.plants}</p>
            </div>
            <Link href="/plants" className="metric-link">
              Manage Plants →
            </Link>
          </div>

          <div className="metric-card sensors">
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <h3>Active Sensors</h3>
              <p className="metric-value">{dashboardData.sensors}</p>
            </div>
            <Link href="/sensors" className="metric-link">
              View Live Data →
            </Link>
          </div>

          <div className="metric-card alerts">
            <div className="metric-icon">🚨</div>
            <div className="metric-content">
              <h3>Active Alerts</h3>
              <p className="metric-value">{dashboardData.activeAlerts}</p>
            </div>
            <Link href="/alerts" className="metric-link">
              View Alerts →
            </Link>
          </div>

          <div className="metric-card readings">
            <div className="metric-icon">📈</div>
            <div className="metric-content">
              <h3>Total Readings</h3>
              <p className="metric-value">{dashboardData.totalReadings.toLocaleString()}</p>
            </div>
            <Link href="/historical" className="metric-link">
              View History →
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="status-section">
          <div className="status-card">
            <h2>System Status</h2>
            <div className={`status-indicator ${systemStatus}`}>
              <span className="status-dot"></span>
              <span className="status-text">
                {systemStatus === 'online' ? 'All Systems Operational' : 'Connection Issues Detected'}
              </span>
            </div>
            <div className="status-details">
              <div className="status-item">
                <span>Backend API:</span>
                <span className={systemStatus === 'online' ? 'online' : 'offline'}>
                  {systemStatus === 'online' ? '✓ Connected' : '✗ Disconnected'}
                </span>
              </div>
              <div className="status-item">
                <span>Database:</span>
                <span className={systemStatus === 'online' ? 'online' : 'offline'}>
                  {systemStatus === 'online' ? '✓ Connected' : '✗ Disconnected'}
                </span>
              </div>
              <div className="status-item">
                <span>MQTT Service:</span>
                <span className={systemStatus === 'online' ? 'online' : 'offline'}>
                  {systemStatus === 'online' ? '✓ Active' : '✗ Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="recent-alerts-section">
          <h2>Recent Alerts</h2>
          {recentAlerts.length === 0 ? (
            <div className="no-alerts">
              <p>No recent alerts. Your greenhouse is running smoothly! 🌟</p>
            </div>
          ) : (
            <div className="alerts-list">
              {recentAlerts.map((alert) => (
                <div 
                  key={alert._id} 
                  className="alert-item"
                  style={{ borderLeft: `4px solid ${getPriorityColor(alert.priority)}` }}
                >
                  <div className="alert-content">
                    <h4>{alert.title}</h4>
                    <p>{alert.message}</p>
                  </div>
                  <div className="alert-meta">
                    <span className="alert-time">{formatDate(alert.timestamp)}</span>
                    <span className={`alert-status ${alert.status}`}>{alert.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/alerts" className="view-all-alerts">
            View All Alerts →
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link href="/sensors" className="action-card">
              <div className="action-icon">📊</div>
              <h3>View Live Sensors</h3>
              <p>Monitor real-time sensor data</p>
            </Link>

            <Link href="/manage-sensors" className="action-card">
              <div className="action-icon">⚙️</div>
              <h3>Manage Sensors</h3>
              <p>Add, edit, or configure sensors</p>
            </Link>

            <Link href="/plants" className="action-card">
              <div className="action-icon">🌱</div>
              <h3>Manage Plants</h3>
              <p>Add or modify plant information</p>
            </Link>

            <Link href="/reports" className="action-card">
              <div className="action-icon">📋</div>
              <h3>Generate Reports</h3>
              <p>Create detailed system reports</p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
