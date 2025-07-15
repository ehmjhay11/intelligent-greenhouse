import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import SensorData from './SensorData';

function Home() {
  const navigate = useNavigate();
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="main-title">Welcome to the Automated Greenhouse Control System</h1>
        <p className="subtitle">
          Monitor and control your greenhouse environment with ease.
        </p>
        <button className="sensor-btn" onClick={() => navigate('/sensors')}>
          View Sensor Data
        </button>
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
      </Routes>
    </Router>
  );
}

export default App;