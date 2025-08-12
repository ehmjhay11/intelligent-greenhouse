import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoricalData();
  }, [selectedDevice, timeRange]);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3003/api/sensors/historical?device=${selectedDevice}&range=${timeRange}`
      );
      const result = await response.json();
      
      if (result.success) {
        formatChartData(result.data);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
    setLoading(false);
  };

  const formatChartData = (data) => {
    const timestamps = data.map(d => new Date(d.timestamp));
    
    setChartData({
      labels: timestamps,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: data.map(d => d.temperature),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          yAxisID: 'y',
        },
        {
          label: 'Humidity (%)',
          data: data.map(d => d.humidity),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          yAxisID: 'y1',
        },
        {
          label: 'Soil Moisture (%)',
          data: data.map(d => d.soil_moisture),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          yAxisID: 'y1',
        },
        {
          label: 'Light Level',
          data: data.map(d => d.light_level),
          borderColor: 'rgb(255, 205, 86)',
          backgroundColor: 'rgba(255, 205, 86, 0.2)',
          yAxisID: 'y2',
        }
      ]
    });
  };

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
    <div className="historical-dashboard">
      <div className="dashboard-header">
        <h2>📊 Historical Data Dashboard</h2>
        
        <div className="controls">
          <select 
            value={selectedDevice} 
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="device-select"
          >
            <option value="1">Device 1</option>
            <option value="2">Device 2</option>
            <option value="3">Device 3</option>
          </select>
          
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-select"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="chart-container">
        {loading ? (
          <div className="loading">Loading historical data...</div>
        ) : chartData ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="no-data">No data available for selected period</div>
        )}
      </div>
    </div>
  );
};

export default HistoricalDashboard;
