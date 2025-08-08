import React from 'react';
import TemperatureLive from './TemperatureLive';
import TemperatureGauge from './temperatureGauge';

export default {
  title: 'Sensors/TemperatureLive',
  component: TemperatureLive,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Temperature Live Component

The **TemperatureLive** component provides real-time temperature monitoring through MQTT connectivity. It displays live temperature readings from ESP32 sensors in a visual gauge format.

## Features

- **Real-time MQTT Integration**: Connects to ESP32 sensors via MQTT broker
- **Temperature Visualization**: -10°C to 50°C scale with color-coded ranges
- **Connection Status Monitoring**: Visual feedback for connection states
- **Auto-reconnection**: Automatically handles connection drops
- **Multiple Data Formats**: Supports various temperature sensor data structures
- **Error Handling**: Graceful error display and recovery

## MQTT Configuration

- **Broker**: ws://192.168.1.6:8080/mqtt
- **Topic**: esp32
- **Data Formats Supported**:
  - \`temperature\`: Direct celsius value
  - \`Temperature\`: Capitalized version
  - \`temp\`: Short form
  - \`Temp\`: Capitalized short form
  - \`celsius\`: Explicit unit naming
  - \`TemperatureLevel\`: Descriptive field name

## Temperature Level Ranges

- **Cold** (-10°C to 10°C): Blue indicator, heating may be needed
- **Cool** (10°C to 20°C): Light blue, acceptable for cool-season crops
- **Optimal** (20°C to 30°C): Green indicator, ideal for most plants
- **Warm** (30°C to 40°C): Orange indicator, ventilation recommended
- **Hot** (40°C to 50°C): Red indicator, cooling required

## Usage in Greenhouse Monitoring

This component is designed for intelligent greenhouse systems where temperature monitoring is crucial for:
- Climate control automation
- Plant stress prevention
- Energy optimization (heating/cooling)
- Growth stage management
- Disease prevention through optimal temperature maintenance
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ 
        padding: '2rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        minHeight: '400px'
      }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    // No controls needed as this component doesn't accept props
  },
};

// Live MQTT Connection Story - with warning for Storybook
export const LiveConnection = () => (
  <div>
    <div style={{ 
      marginBottom: '1rem', 
      padding: '1rem', 
      backgroundColor: '#fff3cd', 
      border: '1px solid #ffeaa7',
      borderRadius: '8px',
      fontSize: '0.875rem',
      color: '#856404'
    }}>
      ⚠️ <strong>Note:</strong> This story attempts to connect to a real MQTT broker. 
      It may show connection errors if the broker is not available. 
      Use the "Mock Demo" story for testing without network dependencies.
    </div>
    <TemperatureLive />
  </div>
);
LiveConnection.storyName = 'Live MQTT Connection';
LiveConnection.parameters = {
  docs: {
    description: {
      story: 'Connects to the real MQTT broker and displays live temperature data. Shows connection status and real-time updates. May show connection errors in Storybook if MQTT broker is not accessible.',
    },
  },
};

// Mock MQTT Component for testing
const MockTemperatureLive = () => {
  const [temperature, setTemperature] = React.useState(22.5);
  const [connectionStatus, setConnectionStatus] = React.useState('connected');
  const [lastUpdate, setLastUpdate] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      // Simulate realistic temperature fluctuations
      setTemperature(prev => {
        const change = (Math.random() - 0.5) * 3; // ±1.5°C fluctuation
        const newValue = Math.max(-10, Math.min(50, prev + change));
        return Math.round(newValue * 10) / 10; // Round to 1 decimal place
      });
      setLastUpdate(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4caf50';
      case 'connecting': 
      case 'reconnecting': return '#ff9800';
      case 'error': return '#f44336';
      default: return '#757575';
    }
  };

  const formatLastUpdate = () => {
    const now = new Date();
    const diffMs = now - lastUpdate;
    const diffSecs = Math.floor(diffMs / 1000);
    return `${diffSecs}s ago`;
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
      <TemperatureGauge 
        temperature={temperature}
        status={connectionStatus}
        lastUpdate={formatLastUpdate()}
      />
      
      {/* Connection Status Indicator */}
      <div style={{ 
        marginTop: '1rem', 
        padding: '0.5rem', 
        fontSize: '0.875rem',
        color: '#666',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}>
        <div 
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
            display: 'inline-block'
          }}
        />
        <span style={{ textTransform: 'capitalize' }}>
          {connectionStatus} (Mock)
        </span>
      </div>

      <div style={{ 
        fontSize: '0.75rem', 
        color: '#888', 
        marginTop: '0.25rem' 
      }}>
        Temperature updates every 2 seconds
      </div>
    </div>
  );
};

export const MockDemo = () => <MockTemperatureLive />;
MockDemo.storyName = 'Mock Live Data (Demo)';
MockDemo.parameters = {
  docs: {
    description: {
      story: 'A mock version that simulates live temperature data updates without requiring an actual MQTT connection. Useful for testing and demonstrations.',
    },
  },
};

// Connection States Demo
const ConnectionStatesDemo = () => {
  const [currentState, setCurrentState] = React.useState(0);
  const states = [
    { status: 'connecting', color: '#ff9800', label: 'Connecting...', temp: 20 },
    { status: 'connected', color: '#4caf50', label: 'Connected', temp: 24.5 },
    { status: 'reconnecting', color: '#ff9800', label: 'Reconnecting...', temp: 24.5 },
    { status: 'error', color: '#f44336', label: 'Connection Error', temp: 24.5 },
    { status: 'disconnected', color: '#757575', label: 'Disconnected', temp: 20 },
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentState(prev => (prev + 1) % states.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [states.length]);

  const currentStateObj = states[currentState];

  return (
    <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
      <TemperatureGauge 
        temperature={currentStateObj.temp}
        status={currentStateObj.label}
        lastUpdate={currentStateObj.status === 'connected' ? '2s ago' : 'No data'}
      />
      
      <div style={{ 
        marginTop: '1rem', 
        padding: '0.5rem', 
        fontSize: '0.875rem',
        color: '#666',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}>
        <div 
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: currentStateObj.color,
            display: 'inline-block'
          }}
        />
        <span>{currentStateObj.label}</span>
      </div>

      <div style={{ 
        fontSize: '0.75rem', 
        color: '#888', 
        marginTop: '0.25rem' 
      }}>
        Connection states cycle every 2.5 seconds
      </div>
    </div>
  );
};

export const ConnectionStates = () => <ConnectionStatesDemo />;
ConnectionStates.storyName = 'Connection States Demo';
ConnectionStates.parameters = {
  docs: {
    description: {
      story: 'Demonstrates different connection states: connecting, connected, reconnecting, error, and disconnected.',
    },
  },
};

// Temperature Ranges Demo
const TemperatureRangesDemo = () => {
  const [currentRange, setCurrentRange] = React.useState(0);
  const ranges = [
    { temp: 5, label: 'Cold (5°C)', color: '#2196F3' },
    { temp: 18, label: 'Moderate (18°C)', color: '#4CAF50' },
    { temp: 30, label: 'Warm (30°C)', color: '#FF9800' },
    { temp: 42, label: 'Hot (42°C)', color: '#f44336' },
    { temp: -5, label: 'Freezing (-5°C)', color: '#2196F3' },
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRange(prev => (prev + 1) % ranges.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [ranges.length]);

  const currentRangeObj = ranges[currentRange];

  return (
    <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
      <TemperatureGauge 
        temperature={currentRangeObj.temp}
        status="Connected"
        lastUpdate="Live demo"
      />
      
      <div style={{ 
        marginTop: '1rem', 
        padding: '0.5rem', 
        fontSize: '0.875rem',
        color: currentRangeObj.color,
        fontWeight: '600'
      }}>
        {currentRangeObj.label}
      </div>

      <div style={{ 
        fontSize: '0.75rem', 
        color: '#888', 
        marginTop: '0.25rem' 
      }}>
        Temperature ranges cycle every 3 seconds
      </div>
    </div>
  );
};

export const TemperatureRanges = () => <TemperatureRangesDemo />;
TemperatureRanges.storyName = 'Temperature Ranges Demo';
TemperatureRanges.parameters = {
  docs: {
    description: {
      story: 'Demonstrates different temperature ranges and their corresponding colors: blue (cold), green (moderate), orange (warm), and red (hot).',
    },
  },
};

// Default live component
export const Default = {
  parameters: {
    docs: {
      description: {
        story: `
### Live Temperature Sensor with MQTT

This is the main live component that connects to the MQTT broker and displays real-time temperature data from ESP32 sensors.

**Connection Details:**
- Broker: \`ws://192.168.1.6:8080/mqtt\`
- Topic: \`esp32\`
- Client ID: Auto-generated unique ID
- Temperature Range: -10°C to 50°C

The component will automatically attempt to connect to the MQTT broker and display live temperature readings. If the sensor is not available, it will show a disconnected state.
        `,
      },
    },
  },
  render: () => <TemperatureLive />,
};

// Documentation story showing MQTT data formats
export const MQTTDataFormats = {
  render: () => (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <TemperatureLive />
      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>Supported MQTT Data Formats</h3>
        <p style={{ color: '#666', marginBottom: '1rem' }}>The component automatically handles multiple data format variations:</p>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
            <strong>Standard Temperature Fields:</strong>
            <pre style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#495057' }}>
{`{
  "temperature": 23.5,        // Primary field (Celsius)
  "Temperature": 23.5,        // Capitalized version
  "temp": 23.5                // Short form
}`}
            </pre>
          </div>
          
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
            <strong>Alternative Field Names:</strong>
            <pre style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#495057' }}>
{`{
  "Temp": 23.5,               // Capitalized short form
  "celsius": 23.5,            // Explicit unit naming
  "TemperatureLevel": 23.5    // Descriptive field name
}`}
            </pre>
          </div>
        </div>
        
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
          <strong style={{ color: '#856404' }}>Note:</strong> All temperature values should be in Celsius. The component expects values between -10°C and 50°C for optimal display.
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: `
### MQTT Data Format Support

The temperature sensor component is designed to handle various data formats that might be sent by different ESP32 sensor configurations. This flexibility ensures compatibility with different temperature sensor implementations.

**Supported Field Names:**
- Standard: temperature, Temperature, temp, Temp
- Explicit: celsius, TemperatureLevel
- All values should be in Celsius (-10°C to 50°C range)
        `,
      },
    },
  },
};

// Climate control application guide
export const ClimateControlApplication = {
  render: () => (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <TemperatureLive />
      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>Climate Control Application Guide</h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#666', marginBottom: '0.5rem' }}>Temperature Ranges for Plant Growth:</h4>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '4px', border: '1px solid #bbdefb' }}>
              <strong style={{ color: '#0d47a1' }}>Cold (-10°C to 10°C)</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', color: '#6c757d' }}>
                <li>Too cold for most greenhouse plants</li>
                <li>Risk of frost damage and stunted growth</li>
                <li>Heating system activation required</li>
                <li><strong>Action:</strong> Activate heating, check insulation</li>
              </ul>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '4px', border: '1px solid #a5d6a7' }}>
              <strong style={{ color: '#1b5e20' }}>Cool (10°C to 20°C)</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', color: '#6c757d' }}>
                <li>Suitable for cool-season crops (lettuce, spinach)</li>
                <li>Slower growth but acceptable for some plants</li>
                <li>Consider supplemental heating for warm-season crops</li>
                <li><strong>Action:</strong> Monitor plant types, gradual heating</li>
              </ul>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '4px', border: '1px solid #c8e6c9' }}>
              <strong style={{ color: '#2e7d32' }}>Optimal (20°C to 30°C)</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', color: '#6c757d' }}>
                <li>Ideal range for most greenhouse plants</li>
                <li>Optimal photosynthesis and growth rates</li>
                <li>Good enzyme activity and nutrient uptake</li>
                <li><strong>Action:</strong> Maintain current climate settings</li>
              </ul>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#fff3e0', borderRadius: '4px', border: '1px solid #ffcc02' }}>
              <strong style={{ color: '#f57c00' }}>Warm (30°C to 40°C)</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', color: '#6c757d' }}>
                <li>Above optimal for most plants</li>
                <li>Increased transpiration and water demand</li>
                <li>Risk of heat stress and reduced growth</li>
                <li><strong>Action:</strong> Increase ventilation, provide shade</li>
              </ul>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#ffebee', borderRadius: '4px', border: '1px solid #ffcdd2' }}>
              <strong style={{ color: '#c62828' }}>Hot (40°C to 50°C)</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', color: '#6c757d' }}>
                <li>Dangerous heat levels for plants</li>
                <li>Severe stress, wilting, and potential death</li>
                <li>Immediate cooling action required</li>
                <li><strong>Action:</strong> Emergency cooling, increase ventilation</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div>
          <h4 style={{ color: '#666', marginBottom: '0.5rem' }}>Automated Climate Control Integration:</h4>
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
            <ul style={{ margin: 0, color: '#495057' }}>
              <li>🔥 <strong>Heating Control:</strong> Activate when temperature &lt; 18°C</li>
              <li>❄️ <strong>Cooling/Ventilation:</strong> Activate when temperature &gt; 28°C</li>
              <li>🌡️ <strong>VPD Calculation:</strong> Combine with humidity for optimal conditions</li>
              <li>⚠️ <strong>Alerts:</strong> Notify when temperature is outside 15-35°C range</li>
              <li>⏰ <strong>Scheduling:</strong> Different setpoints for day/night cycles</li>
              <li>📊 <strong>Energy Management:</strong> Optimize heating/cooling efficiency</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: `
### Climate Control Application

Comprehensive guide for using temperature data in automated greenhouse climate control systems. Understanding temperature ranges is crucial for maintaining optimal growing conditions and managing energy efficiency.

**Key Monitoring Points:**
- Heating/cooling system automation
- Plant stress prevention
- Energy optimization strategies
- Day/night temperature differential management
- Vapor Pressure Deficit (VPD) calculations when combined with humidity
        `,
      },
    },
  },
};