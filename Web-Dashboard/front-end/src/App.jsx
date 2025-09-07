import './styles/App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import SensorData from './SensorData';
import SensorManagement from './SensorManagement';
import PlantManagement from './PlantManagement';
import AlertsPanel from './AlertsPanel';
import HistoricalDashboard from './HistoricalDashboard';
import Reports from './Reports';

function Home() {
  const navigate = useNavigate();
  return (
    <div className="app-container">
      <header className="app-header" role="banner">
        <h1 className="main-title">Welcome to the Automated Greenhouse Control System</h1>
        <p className="subtitle">Monitor and control your greenhouse environment with ease.</p>
        <nav aria-label="Primary" className="app-actions">
          <button className="sensor-btn" onClick={() => navigate('/sensors')}>
            <span aria-hidden>📊</span>
            <span>View Sensor Data</span>
          </button>
          <button className="sensor-btn" onClick={() => navigate('/manage-sensors')}>
            <span aria-hidden>🔧</span>
            <span>Manage Sensors</span>
          </button>
          <button className="sensor-btn" onClick={() => navigate('/plants')}>
            <span aria-hidden>🌱</span>
            <span>Manage Plants</span>
          </button>
          <button className="sensor-btn" onClick={() => navigate('/alerts')}>
            <span aria-hidden>🚨</span>
            <span>View Alerts</span>
          </button>
          <button className="sensor-btn" onClick={() => navigate('/historical')}>
            <span aria-hidden>📈</span>
            <span>Historical Data</span>
          </button>
          <button className="sensor-btn" onClick={() => navigate('/reports')}>
            <span aria-hidden>📝</span>
            <span>Reports</span>
          </button>
        </nav>
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sensors" element={<SensorData />} />
        <Route path="/manage-sensors" element={<SensorManagement />} />
        <Route path="/plants" element={<PlantManagement />} />
        <Route path="/alerts" element={<AlertsPanel />} />
        <Route path="/historical" element={<HistoricalDashboard />} />
  <Route path="/reports" element={<Reports />} />
      </Routes>
    </Router>
  );
}

export default App;