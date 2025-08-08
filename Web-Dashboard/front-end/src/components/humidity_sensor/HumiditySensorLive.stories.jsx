import React from 'react';
import HumiditySensorLive from './HumiditySensorLive';

export default {
  title: 'Sensors/HumiditySensorLive',
  component: HumiditySensorLive,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Humidity Sensor Live Component

The **HumiditySensorLive** component provides real-time humidity monitoring through MQTT connectivity. It displays live humidity readings from ESP32 sensors in a visual gauge format.

## Features

- **Real-time MQTT Integration**: Connects to ESP32 sensors via MQTT broker
- **Humidity Visualization**: 0-100% scale with color-coded ranges
- **Connection Status Monitoring**: Visual feedback for connection states
- **Auto-reconnection**: Automatically handles connection drops
- **Multiple Data Formats**: Supports various humidity sensor data structures
- **Error Handling**: Graceful error display and recovery

## MQTT Configuration

- **Broker**: ws://192.168.1.6:8080/mqtt
- **Topic**: esp32
- **Data Formats Supported**:
  - \`humidity\`: Direct percentage (0-100)
  - \`Humidity\`: Capitalized version
  - \`humidity_level\`: Alternative field name
  - \`relative_humidity\`: Full field name
  - \`rh\` / \`RH\`: Abbreviations for relative humidity
  - \`hum\`: Short form
  - \`HumidityLevel\`: Camel case version

## Humidity Level Ranges

- **Too Dry** (0-29%): Red indicator, may harm plants
- **Dry** (30-39%): Orange indicator, requires attention
- **Optimal** (40-59%): Green indicator, ideal for plant growth
- **Humid** (60-79%): Blue indicator, acceptable levels
- **Very Humid** (80-100%): Purple indicator, may promote fungal growth

## Usage in Greenhouse Monitoring

This component is designed for intelligent greenhouse systems where humidity monitoring is crucial for:
- Plant health optimization
- Disease prevention (fungal infections)
- Automated misting/dehumidification control
- Environmental balance maintenance
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
};

// Default live component
export const Default = {
  parameters: {
    docs: {
      description: {
        story: `
### Live Humidity Sensor with MQTT

This is the main live component that connects to the MQTT broker and displays real-time humidity data from ESP32 sensors.

**Connection Details:**
- Broker: \`ws://192.168.1.6:8080/mqtt\`
- Topic: \`esp32\`
- Client ID: Auto-generated unique ID

The component will automatically attempt to connect to the MQTT broker and display live humidity readings. If the sensor is not available, it will show a disconnected state.
        `,
      },
    },
  },
};

// Documentation story showing MQTT data formats
export const MQTTDataFormats = {
  render: () => (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <HumiditySensorLive />
      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>Supported MQTT Data Formats</h3>
        <p style={{ color: '#666', marginBottom: '1rem' }}>The component automatically handles multiple data format variations:</p>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
            <strong>Standard Humidity Fields:</strong>
            <pre style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#495057' }}>
{`{
  "humidity": 65.5,         // Primary field
  "Humidity": 65.5,         // Capitalized
  "humidity_level": 65.5    // Alternative naming
}`}
            </pre>
          </div>
          
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
            <strong>Relative Humidity Variations:</strong>
            <pre style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#495057' }}>
{`{
  "relative_humidity": 65.5, // Full name
  "rh": 65.5,                // Lowercase abbreviation
  "RH": 65.5                 // Uppercase abbreviation
}`}
            </pre>
          </div>
          
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
            <strong>Short Forms and Case Variations:</strong>
            <pre style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#495057' }}>
{`{
  "hum": 65.5,              // Short form
  "HumidityLevel": 65.5     // Camel case
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

The humidity sensor component is designed to handle various data formats that might be sent by different ESP32 sensor configurations. This flexibility ensures compatibility with different humidity sensor implementations.

**Supported Field Names:**
- Standard: humidity, Humidity, humidity_level
- Relative Humidity: relative_humidity, rh, RH
- Short Forms: hum, HumidityLevel
- All values should be in percentage (0-100%)
        `,
      },
    },
  },
};

// Connection states demonstration
export const ConnectionStates = {
  render: () => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <HumiditySensorLive />
      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>Connection States</h3>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#4caf50' }}></div>
            <strong>Connected:</strong> <span style={{ color: '#666' }}>Successfully connected to MQTT broker, receiving data</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff9800' }}></div>
            <strong>Connecting:</strong> <span style={{ color: '#666' }}>Attempting to establish connection</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2196f3' }}></div>
            <strong>Reconnecting:</strong> <span style={{ color: '#666' }}>Attempting to reconnect after connection loss</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#9e9e9e' }}></div>
            <strong>Disconnected:</strong> <span style={{ color: '#666' }}>Not connected to broker</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f44336' }}></div>
            <strong>Error:</strong> <span style={{ color: '#666' }}>Connection or data error occurred</span>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: `
### Connection State Management

The component provides comprehensive connection state feedback with automatic recovery mechanisms:

**Features:**
- Visual status indicators with color coding
- Automatic reconnection on connection loss
- Error state handling with user-friendly messages
- Connection timeout management
- Clean disconnection on component unmount
        `,
      },
    },
  },
};

// Greenhouse application guide
export const GreenhouseApplication = {
  render: () => (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <HumiditySensorLive />
      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>Greenhouse Application Guide</h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#666', marginBottom: '0.5rem' }}>Optimal Humidity Ranges for Plants:</h4>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#ffebee', borderRadius: '4px', border: '1px solid #ffcdd2' }}>
              <strong style={{ color: '#c62828' }}>Too Dry (0-29%)</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', color: '#6c757d' }}>
                <li>Stress on plants, wilting leaves</li>
                <li>Increased water uptake demand</li>
                <li>Susceptible to spider mites</li>
                <li><strong>Action:</strong> Increase misting, check irrigation</li>
              </ul>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#fff3e0', borderRadius: '4px', border: '1px solid #ffcc02' }}>
              <strong style={{ color: '#f57c00' }}>Dry (30-39%)</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', color: '#6c757d' }}>
                <li>Below optimal but manageable</li>
                <li>Monitor plant stress indicators</li>
                <li><strong>Action:</strong> Consider increasing humidity</li>
              </ul>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '4px', border: '1px solid #c8e6c9' }}>
              <strong style={{ color: '#2e7d32' }}>Optimal (40-59%)</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', color: '#6c757d' }}>
                <li>Ideal range for most greenhouse plants</li>
                <li>Good transpiration and photosynthesis</li>
                <li>Minimal disease risk</li>
                <li><strong>Action:</strong> Maintain current conditions</li>
              </ul>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '4px', border: '1px solid #bbdefb' }}>
              <strong style={{ color: '#1565c0' }}>Humid (60-79%)</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', color: '#6c757d' }}>
                <li>Still acceptable for most plants</li>
                <li>Monitor for early signs of fungal issues</li>
                <li><strong>Action:</strong> Ensure good air circulation</li>
              </ul>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#f3e5f5', borderRadius: '4px', border: '1px solid #ce93d8' }}>
              <strong style={{ color: '#7b1fa2' }}>Very Humid (80-100%)</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', color: '#6c757d' }}>
                <li>High risk of fungal diseases</li>
                <li>Poor air circulation</li>
                <li>Potential for rot and mold</li>
                <li><strong>Action:</strong> Increase ventilation, reduce misting</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div>
          <h4 style={{ color: '#666', marginBottom: '0.5rem' }}>Automated Control Integration:</h4>
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
            <ul style={{ margin: 0, color: '#495057' }}>
              <li>🌊 <strong>Misting Systems:</strong> Activate when humidity {'<'} 40%</li>
              <li>💨 <strong>Ventilation:</strong> Increase when humidity {'>'} 70%</li>
              <li>🌡️ <strong>Heating:</strong> Coordinate with temperature for optimal VPD</li>
              <li>⚠️ <strong>Alerts:</strong> Notify when humidity is outside 30-80% range</li>
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
### Greenhouse Application

Comprehensive guide for using humidity data in greenhouse automation and plant care. Understanding humidity levels is crucial for maintaining optimal growing conditions.

**Key Monitoring Points:**
- Vapor Pressure Deficit (VPD) calculations
- Disease prevention through humidity control
- Water stress management
- Environmental automation triggers
        `,
      },
    },
  },
};
