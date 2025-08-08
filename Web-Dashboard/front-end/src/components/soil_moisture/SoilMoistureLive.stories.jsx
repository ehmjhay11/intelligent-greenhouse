import React from 'react';
import SoilMoistureLive from './SoilMoistureLive';
import SoilMoistureGauge from './soil_moisture';

export default {
  title: 'Sensors/SoilMoistureLive',
  component: SoilMoistureLive,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Soil Moisture Live Component

The **SoilMoistureLive** component provides real-time soil moisture monitoring through MQTT connectivity. It displays live moisture readings from ESP32 sensors in a visual gauge format.

## Features

- **Real-time MQTT Integration**: Connects to ESP32 sensors via MQTT broker
- **Soil Moisture Visualization**: 0-100% scale with color-coded ranges
- **Connection Status Monitoring**: Visual feedback for connection states
- **Auto-reconnection**: Automatically handles connection drops
- **Multiple Data Formats**: Supports various soil moisture sensor data structures
- **Error Handling**: Graceful error display and recovery

## MQTT Configuration

- **Broker**: ws://192.168.1.6:8080/mqtt
- **Topic**: esp32
- **Data Formats Supported**:
  - \`soil_moisture\`: Direct percentage (0-100)
  - \`soilMoisture\`: Camel case version
  - \`moisture\`: Short form
  - \`Moisture\`: Capitalized version
  - \`moisture_level\`: Alternative field name
  - \`SoilMoisture\`: Pascal case
  - \`MoistureLevel\`: Descriptive field name

## Soil Moisture Level Ranges

- **Critical** (0-20%): Red indicator, immediate watering needed
- **Low** (21-40%): Orange indicator, watering recommended
- **Optimal** (41-70%): Green indicator, ideal moisture levels
- **High** (71-85%): Blue indicator, good moisture, monitor drainage
- **Saturated** (86-100%): Purple indicator, potential overwatering

## Usage in Greenhouse Monitoring

This component is designed for intelligent greenhouse systems where soil moisture monitoring is crucial for:
- Automated irrigation control
- Plant stress prevention
- Water conservation optimization
- Root health maintenance
- Disease prevention (overwatering issues)
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
    <SoilMoistureLive />
  </div>
);
LiveConnection.storyName = 'Live MQTT Connection';
LiveConnection.parameters = {
  docs: {
    description: {
      story: 'Connects to the real MQTT broker and displays live soil moisture data. Shows connection status and real-time updates. May show connection errors in Storybook if MQTT broker is not accessible.',
    },
  },
};

// Mock MQTT Component for testing
const MockSoilMoistureLive = () => {
  const [moisture, setMoisture] = React.useState(45);
  const [connectionStatus, setConnectionStatus] = React.useState('connected');
  const [lastUpdate, setLastUpdate] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      // Simulate realistic moisture fluctuations
      setMoisture(prev => {
        const change = (Math.random() - 0.5) * 10;
        const newValue = Math.max(0, Math.min(100, prev + change));
        return Math.round(newValue);
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
      <SoilMoistureGauge moisture={moisture} />
      
      {/* Connection Status */}
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
        Last update: {formatLastUpdate()}
      </div>
    </div>
  );
};

export const MockDemo = () => <MockSoilMoistureLive />;
MockDemo.storyName = 'Mock Live Data (Demo)';
MockDemo.parameters = {
  docs: {
    description: {
      story: 'A mock version that simulates live data updates without requiring an actual MQTT connection. Useful for testing and demonstrations.',
    },
  },
};

// Connection States Demo
const ConnectionStatesDemo = () => {
  const [currentState, setCurrentState] = React.useState(0);
  const states = [
    { status: 'connecting', color: '#ff9800', label: 'Connecting...' },
    { status: 'connected', color: '#4caf50', label: 'Connected' },
    { status: 'reconnecting', color: '#ff9800', label: 'Reconnecting...' },
    { status: 'error', color: '#f44336', label: 'Connection Error' },
    { status: 'disconnected', color: '#757575', label: 'Disconnected' },
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentState(prev => (prev + 1) % states.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [states.length]);

  const currentStateObj = states[currentState];

  return (
    <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
      <SoilMoistureGauge moisture={currentStateObj.status === 'connected' ? 67 : 0} />
      
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
        Connection states cycle every 2 seconds
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

// Default live component
export const Default = {
  parameters: {
    docs: {
      description: {
        story: `
### Live Soil Moisture Sensor with MQTT

This is the main live component that connects to the MQTT broker and displays real-time soil moisture data from ESP32 sensors.

**Connection Details:**
- Broker: \`ws://192.168.1.6:8080/mqtt\`
- Topic: \`esp32\`
- Client ID: Auto-generated unique ID

The component will automatically attempt to connect to the MQTT broker and display live soil moisture readings. If the sensor is not available, it will show a disconnected state.
        `,
      },
    },
  },
  render: () => <SoilMoistureLive />,
};

// Documentation story showing MQTT data formats
export const MQTTDataFormats = {
  render: () => (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <SoilMoistureLive />
      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>Supported MQTT Data Formats</h3>
        <p style={{ color: '#666', marginBottom: '1rem' }}>The component automatically handles multiple data format variations:</p>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
            <strong>Standard Moisture Fields:</strong>
            <pre style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#495057' }}>
{`{
  "soil_moisture": 65.5,      // Primary field
  "soilMoisture": 65.5,       // Camel case
  "moisture": 65.5            // Short form
}`}
            </pre>
          </div>
          
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
            <strong>Alternative Field Names:</strong>
            <pre style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#495057' }}>
{`{
  "Moisture": 65.5,           // Capitalized
  "moisture_level": 65.5,     // Descriptive naming
  "SoilMoisture": 65.5        // Pascal case
}`}
            </pre>
          </div>
          
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
            <strong>Descriptive Field Names:</strong>
            <pre style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#495057' }}>
{`{
  "MoistureLevel": 65.5       // Camel case descriptive
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: `
### MQTT Data Format Support

The soil moisture sensor component is designed to handle various data formats that might be sent by different ESP32 sensor configurations. This flexibility ensures compatibility with different soil moisture sensor implementations.

**Supported Field Names:**
- Standard: soil_moisture, soilMoisture, moisture
- Capitalized: Moisture, SoilMoisture
- Descriptive: moisture_level, MoistureLevel
- All values should be in percentage (0-100%)
        `,
      },
    },
  },
};

// Irrigation application guide
export const IrrigationApplication = {
  render: () => (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <SoilMoistureLive />
      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>Irrigation Application Guide</h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#666', marginBottom: '0.5rem' }}>Soil Moisture Ranges for Plants:</h4>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#ffebee', borderRadius: '4px', border: '1px solid #ffcdd2' }}>
              <strong style={{ color: '#c62828' }}>Critical (0-20%)</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', color: '#6c757d' }}>
                <li>Severe plant stress, wilting imminent</li>
                <li>Root damage possible if prolonged</li>
                <li>Immediate irrigation required</li>
                <li><strong>Action:</strong> Water immediately, check irrigation system</li>
              </ul>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#fff3e0', borderRadius: '4px', border: '1px solid #ffcc02' }}>
              <strong style={{ color: '#f57c00' }}>Low (21-40%)</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', color: '#6c757d' }}>
                <li>Plant stress beginning to show</li>
                <li>Reduced growth and yield potential</li>
                <li>Watering recommended soon</li>
                <li><strong>Action:</strong> Schedule irrigation within 24 hours</li>
              </ul>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '4px', border: '1px solid #c8e6c9' }}>
              <strong style={{ color: '#2e7d32' }}>Optimal (41-70%)</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', color: '#6c757d' }}>
                <li>Ideal range for most crops and plants</li>
                <li>Good root health and nutrient uptake</li>
                <li>Optimal growth conditions</li>
                <li><strong>Action:</strong> Maintain current irrigation schedule</li>
              </ul>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '4px', border: '1px solid #bbdefb' }}>
              <strong style={{ color: '#1565c0' }}>High (71-85%)</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', color: '#6c757d' }}>
                <li>Good moisture levels, well hydrated</li>
                <li>Monitor for drainage issues</li>
                <li>Suitable for water-loving plants</li>
                <li><strong>Action:</strong> Reduce irrigation frequency slightly</li>
              </ul>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#f3e5f5', borderRadius: '4px', border: '1px solid #ce93d8' }}>
              <strong style={{ color: '#7b1fa2' }}>Saturated (86-100%)</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', color: '#6c757d' }}>
                <li>Potential overwatering issues</li>
                <li>Risk of root rot and fungal diseases</li>
                <li>Poor oxygen availability to roots</li>
                <li><strong>Action:</strong> Stop irrigation, improve drainage</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div>
          <h4 style={{ color: '#666', marginBottom: '0.5rem' }}>Automated Irrigation Integration:</h4>
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
            <ul style={{ margin: 0, color: '#495057' }}>
              <li>💧 <strong>Irrigation Trigger:</strong> Activate when moisture &lt; 40%</li>
              <li>⏰ <strong>Timing Control:</strong> Avoid watering during peak heat hours</li>
              <li>🌱 <strong>Plant-Specific:</strong> Adjust thresholds for different crop types</li>
              <li>⚠️ <strong>Alerts:</strong> Notify when moisture is critical (&lt; 20%)</li>
              <li>📊 <strong>Data Logging:</strong> Track irrigation efficiency and water usage</li>
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
### Irrigation Application

Comprehensive guide for using soil moisture data in automated irrigation systems and plant care. Understanding soil moisture levels is crucial for maintaining optimal growing conditions and preventing both drought stress and overwatering.

**Key Monitoring Points:**
- Critical threshold alerts for immediate action
- Optimal range maintenance for healthy plant growth
- Overwatering prevention and drainage monitoring
- Irrigation scheduling optimization
        `,
      },
    },
  },
};