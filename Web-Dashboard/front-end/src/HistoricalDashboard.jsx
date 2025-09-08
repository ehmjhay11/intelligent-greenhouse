import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import API_BASE from './lib/apiBase';
import './styles/DashboardPages.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const HistoricalDashboard = () => {
  const [selectedDevice, setSelectedDevice] = useState('1');
  const [timeRange, setTimeRange] = useState('24h');
  const [chartData, setChartData] = useState(null);
  const [metric, setMetric] = useState('all');
  const [loading, setLoading] = useState(true);

  const formatChartData = useCallback((data) => {
    const timestamps = data.map(d => new Date(d.timestamp));
    const allDatasets = [
      { key: 'temperature', label: 'Temperature (°C)', data: data.map(d => d.temperature), borderColor: 'rgb(239, 68, 68)', backgroundColor: 'rgba(239, 68, 68, 0.15)', yAxisID: 'y' },
      { key: 'humidity', label: 'Humidity (%)', data: data.map(d => d.humidity), borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.15)', yAxisID: 'y1' },
      { key: 'soil_moisture', label: 'Soil Moisture (%)', data: data.map(d => d.soil_moisture), borderColor: 'rgb(34, 197, 94)', backgroundColor: 'rgba(34, 197, 94, 0.15)', yAxisID: 'y1' },
      { key: 'light_level', label: 'Light Level', data: data.map(d => d.light_level), borderColor: 'rgb(245, 158, 11)', backgroundColor: 'rgba(245, 158, 11, 0.15)', yAxisID: 'y2' }
    ];
    const datasets = metric === 'all' ? allDatasets : allDatasets.filter(d => d.key === metric);
    setChartData({ labels: timestamps, datasets });
  }, [metric]);

  const fetchHistoricalData = useCallback(async () => {
    setLoading(true);
    try {
  const response = await fetch(`${API_BASE}/sensors/historical?device=${selectedDevice}&range=${timeRange}`);
      const result = await response.json();
      
      if (result.success) {
        formatChartData(result.data);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
    setLoading(false);
  }, [selectedDevice, timeRange, formatChartData]);

  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: `Device ${selectedDevice} - Environmental Data (${timeRange})`,
      },
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        type: 'time',
        display: true,
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Temperature (°C)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Percentage (%)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      y2: {
        type: 'linear',
        display: false,
        position: 'right',
      }
    },
  };

  return (
    <main className="page-container" role="main">
      <header className="page-header fade-in">
        <h1 className="page-title">Historical Data</h1>
        <p className="page-subtitle">Explore trends with filters and clear charts.</p>
      </header>

      <section className="page-section fade-in">
        <div className="chart-card mb-6" role="region" aria-labelledby="filters-title">
          <div className="chart-body">
            <h2 id="filters-title" className="card-title mb-3">Filters</h2>
            <div className="filters-grid">
              <label className="visually-hidden" htmlFor="device-select">Device</label>
              <select
                id="device-select"
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="form-select"
                aria-label="Select device"
              >
                <option value="1">Device 1</option>
                <option value="2">Device 2</option>
                <option value="3">Device 3</option>
              </select>
              <label className="visually-hidden" htmlFor="range-select">Time Range</label>
              <select
                id="range-select"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="form-select"
                aria-label="Select time range"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <label className="visually-hidden" htmlFor="metric-select">Metric</label>
              <select
                id="metric-select"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                className="form-select"
                aria-label="Select metric"
              >
                <option value="all">All Metrics</option>
                <option value="temperature">Temperature</option>
                <option value="humidity">Humidity</option>
                <option value="soil_moisture">Soil Moisture</option>
                <option value="light_level">Light Level</option>
              </select>
            </div>
          </div>
        </div>

        <div className="chart-card" role="region" aria-labelledby="trends-title">
          <div className="chart-body">
            <h2 id="trends-title" className="card-title mb-2">Environmental Trends</h2>
            <p className="card-subtitle mb-4">Interactive, responsive charts with legends and tooltips.</p>
            <div className="w-full h-[320px] sm:h-[380px] lg:h-[440px]">
              {loading ? (
                <div className="loading">Loading historical data...</div>
              ) : chartData ? (
                <Line data={chartData} options={chartOptions} redraw />
              ) : (
                <div className="no-data">No data available for selected period</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HistoricalDashboard;
