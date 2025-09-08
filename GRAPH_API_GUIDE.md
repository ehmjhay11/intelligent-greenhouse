# Graph API Guide for Intelligent Greenhouse

## Overview
Your backend now supports two endpoints for creating accurate graphs with different time intervals:

1. **Enhanced Historical Endpoint** - `/api/sensors/historical` (improved with custom intervals)
2. **New Graph Endpoint** - `/api/sensors/graph` (optimized for graphing with metadata)

## 🎯 Graph Endpoint (Recommended for Charts)

### URL: `GET /api/sensors/graph`

### Parameters:
- `device` (required) - Device ID (e.g., 1, 2, 3)
- `range` - Time range options:
  - `15m` - Last 15 minutes (1-minute intervals)
  - `30m` - Last 30 minutes (2-minute intervals) 
  - `1h` - Last 1 hour (2-minute intervals)
  - `6h` - Last 6 hours (5-minute intervals)
  - `12h` - Last 12 hours (10-minute intervals)
  - `24h` - Last 24 hours (15-minute intervals)
  - `3d` - Last 3 days (30-minute intervals)
  - `7d` - Last 7 days (1-hour intervals)
- `interval` (optional) - Custom interval in minutes (overrides auto-selection)
- `sensor_types` (optional) - Comma-separated list: `temperature,humidity,soil_moisture,light`

### Examples:

#### 1. Get 2-minute interval data for last 30 minutes (all sensors):
```bash
curl "http://localhost:3003/api/sensors/graph?device=1&range=30m&interval=2"
```

#### 2. Get 1-minute interval data for last 15 minutes (temperature and light only):
```bash
curl "http://localhost:3003/api/sensors/graph?device=1&range=15m&interval=1&sensor_types=temperature,light"
```

#### 3. Get 5-minute interval data for last 6 hours:
```bash
curl "http://localhost:3003/api/sensors/graph?device=1&range=6h&interval=5"
```

#### 4. Auto-optimized intervals (recommended):
```bash
curl "http://localhost:3003/api/sensors/graph?device=1&range=1h"
```

### Response Format:
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2025-08-12T12:00:00.000Z",
      "temperature": 30.2,
      "humidity": 91.4,
      "soil_moisture": 0,
      "light_level": 0
    },
    {
      "timestamp": "2025-08-12T12:02:00.000Z", 
      "temperature": 30.3,
      "humidity": 91.2,
      "soil_moisture": 0,
      "light_level": 5
    }
  ],
  "metadata": {
    "device_id": "1",
    "range": "30m",
    "interval_minutes": 2,
    "start_time": "2025-08-12T11:30:00.000Z",
    "end_time": "2025-08-12T12:00:00.000Z",
    "total_points": 15,
    "expected_points": 15,
    "data_completeness": "100.0%",
    "sensor_types": ["temperature", "humidity", "soil_moisture", "light"]
  }
}
```

## 📊 Recommended Intervals for Different Use Cases:

### Real-time Monitoring (Live Dashboard):
- **Range**: `15m` or `30m`
- **Interval**: `1` or `2` minutes
- **Update frequency**: Every 30 seconds

### Recent Trends (Last few hours):
- **Range**: `1h` to `6h`
- **Interval**: `2` to `5` minutes
- **Update frequency**: Every 1-2 minutes

### Daily Analysis:
- **Range**: `24h`
- **Interval**: `15` to `30` minutes
- **Update frequency**: Every 5 minutes

### Historical Analysis:
- **Range**: `3d` to `7d`
- **Interval**: `30` to `60` minutes
- **Update frequency**: Every 10-15 minutes

## 🎨 Frontend Implementation Example (React + Chart.js):

```javascript
// Fetch graph data with 2-minute intervals
const fetchGraphData = async (deviceId, range = '1h', interval = 2) => {
  try {
    const response = await fetch(
      `http://localhost:3003/api/sensors/graph?device=${deviceId}&range=${range}&interval=${interval}`
    );
    const data = await response.json();
    
    if (data.success) {
      // Convert to Chart.js format
      const chartData = {
        labels: data.data.map(point => new Date(point.timestamp).toLocaleTimeString()),
        datasets: [
          {
            label: 'Temperature (°C)',
            data: data.data.map(point => point.temperature),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
          },
          {
            label: 'Humidity (%)',
            data: data.data.map(point => point.humidity),
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
          },
          {
            label: 'Light Level',
            data: data.data.map(point => point.light_level),
            borderColor: 'rgb(255, 205, 86)',
            backgroundColor: 'rgba(255, 205, 86, 0.2)',
          }
        ]
      };
      
      console.log(`Graph shows ${data.metadata.total_points} points with ${data.metadata.data_completeness} completeness`);
      return chartData;
    }
  } catch (error) {
    console.error('Error fetching graph data:', error);
  }
};

// Usage
const chartData = await fetchGraphData(1, '30m', 2); // Device 1, 30 minutes, 2-minute intervals
```

## 🚀 PowerShell Testing Examples:

```powershell
# Test 2-minute intervals for 30 minutes
$response = Invoke-RestMethod -Uri "http://localhost:3003/api/sensors/graph?device=1&range=30m&interval=2" -Method GET
$response | ConvertTo-Json -Depth 10

# Test with specific sensor types only
$response = Invoke-RestMethod -Uri "http://localhost:3003/api/sensors/graph?device=1&range=1h&sensor_types=temperature,light" -Method GET
$response.data | Format-Table timestamp, temperature, light_level

# Check data completeness
$response = Invoke-RestMethod -Uri "http://localhost:3003/api/sensors/graph?device=1&range=24h" -Method GET
Write-Host "Data completeness: $($response.metadata.data_completeness)"
Write-Host "Total points: $($response.metadata.total_points)"
```

## ✅ What This Solves:

1. **Multiple Data Points**: Instead of one aggregated point, you get precise time-series data
2. **Light Data Included**: All sensor types including light are properly included
3. **Flexible Intervals**: Choose any interval from 1 minute to 1 hour
4. **Data Quality Metrics**: Know how complete your data is
5. **Optimized Performance**: Automatic interval selection for different time ranges
6. **Selective Sensors**: Graph only the sensors you need

The graph will now show **accurate time-series data with multiple points** instead of just one spot, and **light data will be properly included** in all responses! 🎉
