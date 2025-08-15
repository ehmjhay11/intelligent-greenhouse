import './styles/App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import SensorData from './SensorData';
import SensorManagement from './SensorManagement';
import PlantManagement from './PlantManagement';
import AlertsPanel from './AlertsPanel';
import HistoricalDashboard from './HistoricalDashboard';

function Home() {
  const navigate = useNavigate();
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="main-title">Welcome to the Automated Greenhouse Control System</h1>
        <p className="subtitle">
          Monitor and control your greenhouse environment with ease.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button className="sensor-btn" onClick={() => navigate('/sensors')}>
            📊 View Sensor Data
          </button>
          <button className="sensor-btn" onClick={() => navigate('/manage-sensors')}>
            🔧 Manage Sensors
          </button>
          <button className="sensor-btn" onClick={() => navigate('/plants')}>
            🌱 Manage Plants
          </button>
          <button className="sensor-btn" onClick={() => navigate('/alerts')}>
            🚨 View Alerts
          </button>
          <button className="sensor-btn" onClick={() => navigate('/historical')}>
            📈 Historical Data
          </button>
        </div>
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
      </Routes>
    </Router>
  );
}

export default App;