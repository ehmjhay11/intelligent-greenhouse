import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import SensorData from './SensorData';
import SensorManagement from './SensorManagement';
import PlantManagement from './PlantManagement';

function Home() {
  const navigate = useNavigate();
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="main-title">Welcome to the Automated Greenhouse Control System</h1>
        <p className="subtitle">
          Monitor and control your greenhouse environment with ease.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="sensor-btn" onClick={() => navigate('/sensors')}>
            📊 View Sensor Data
          </button>
          <button className="sensor-btn" onClick={() => navigate('/manage-sensors')}>
            🔧 Manage Sensors
          </button>
          <button className="sensor-btn" onClick={() => navigate('/plants')}>
            🌱 Manage Plants
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
      </Routes>
    </Router>
  );
}

export default App;