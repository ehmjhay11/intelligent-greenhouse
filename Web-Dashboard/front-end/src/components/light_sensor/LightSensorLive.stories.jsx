import React from 'react';
import LightSensorLive from './LightSensorLive';

export default {
  title: 'Sensors/LightSensorLive',
  component: LightSensorLive,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Light Sensor Live Component

The **LightSensorLive** component provides real-time light level monitoring through MQTT connectivity. It displays live light readings from ESP32 sensors in a visual gauge format.

## Features

- **Real-time MQTT Integration**: Connects to ESP32 sensors via MQTT broker
- **Light Level Visualization**: 0-100% scale with color-coded ranges
- **Connection Status Monitoring**: Visual feedback for connection states
- **Auto-reconnection**: Automatically handles connection drops
- **Multiple Data Formats**: Supports various light sensor data structures
- **Error Handling**: Graceful error display and recovery

## MQTT Configuration

- **Broker**: ws://192.168.1.6:8080/mqtt
- **Topic**: esp32
- **Data Formats Supported**:
  - \`light_level\`: Direct percentage (0-100)
  - \`light\`: Direct percentage (0-100)
  - \`lux\`: Lux values (converted to percentage, max 1000 lux)
  - \`brightness\`: Direct percentage (0-100)
  - \`Light\` / \`LightLevel\`: Alternative field names

## Light Level Ranges

- **Very Low** (0-15%): Dark environments, nighttime
- **Low** (16-35%): Dim indoor lighting, cloudy days
- **Moderate** (36-55%): Well-lit indoor environments
- **Good** (56-80%): Bright indoor/outdoor shade, optimal for plants
- **Very Bright** (81-100%): Direct sunlight, high-intensity lighting

## Usage in Greenhouse Monitoring

This component is designed for intelligent greenhouse systems where light monitoring is crucial for:
- Plant growth optimization
- Automated lighting control
- Day/night cycle tracking
- Energy-efficient lighting management
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
### Live Light Sensor with MQTT

This is the main live component that connects to the MQTT broker and displays real-time light level data from ESP32 sensors.

**Connection Details:**
- Broker: \`ws://192.168.1.6:8080/mqtt\`
- Topic: \`esp32\`
- Client ID: Auto-generated unique ID

The component will automatically attempt to connect to the MQTT broker and display live light readings. If the sensor is not available, it will show a disconnected state.
        `,
      },
    },
  },
};

// Documentation story showing MQTT data formats
export const MQTTDataFormats = {
  render: () => (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <LightSensorLive />
      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>Supported MQTT Data Formats</h3>
        <p style={{ color: '#666', marginBottom: '1rem' }}>The component automatically handles multiple data format variations:</p>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
            <strong>Direct Percentage Format:</strong>
            <pre style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#495057' }}>
{`{
  "light_level": 75,    // Primary field
  "light": 75,          // Alternative field
  "brightness": 75      // Alternative field
}`}
            </pre>
          </div>
          
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
            <strong>Lux Format (Auto-converted):</strong>
            <pre style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#495057' }}>
{`{
  "lux": 750            // Converted to percentage (750/1000 * 100 = 75%)
}`}
            </pre>
          </div>
          
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
            <strong>Case Variations:</strong>
            <pre style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#495057' }}>
{`{
  "Light": 75,          // Capitalized
  "LightLevel": 75      // Camel case
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

The light sensor component is designed to handle various data formats that might be sent by different ESP32 sensor configurations. This flexibility ensures compatibility with different sensor implementations.

**Auto-conversion Features:**
- Lux values are automatically converted to percentage (assuming max 1000 lux for indoor use)
- Multiple field name variations are supported
- Invalid data is gracefully handled with error messaging
        `,
      },
    },
  },
};

// Connection states demonstration
export const ConnectionStates = {
  render: () => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <LightSensorLive />
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

// Troubleshooting guide
export const TroubleshootingGuide = {
  render: () => (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <LightSensorLive />
      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>Troubleshooting Guide</h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#666', marginBottom: '0.5rem' }}>Common Issues & Solutions:</h4>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
              <strong style={{ color: '#856404' }}>Issue: Shows "Disconnected" status</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', color: '#6c757d' }}>
                <li>Check if MQTT broker is running on 192.168.1.6:8080</li>
                <li>Verify network connectivity to the broker</li>
                <li>Ensure WebSocket support is enabled on the broker</li>
                <li>Check browser console for connection errors</li>
              </ul>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#d1ecf1', borderRadius: '4px', border: '1px solid #bee5eb' }}>
              <strong style={{ color: '#0c5460' }}>Issue: No light data received</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', color: '#6c757d' }}>
                <li>Verify ESP32 sensor is publishing to 'esp32' topic</li>
                <li>Check that light sensor data includes supported field names</li>
                <li>Ensure JSON format is valid</li>
                <li>Verify sensor calibration and wiring</li>
              </ul>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#f8d7da', borderRadius: '4px', border: '1px solid #f5c6cb' }}>
              <strong style={{ color: '#721c24' }}>Issue: Invalid data errors</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', color: '#6c757d' }}>
                <li>Check that light values are numeric and within 0-100 range</li>
                <li>Verify data format matches supported structures</li>
                <li>Ensure sensor is not sending corrupted data</li>
                <li>Check for proper JSON formatting</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div>
          <h4 style={{ color: '#666', marginBottom: '0.5rem' }}>Configuration Checklist:</h4>
          <div style={{ padding: '1rem', backgroundColor: '#d4edda', borderRadius: '4px', border: '1px solid #c3e6cb' }}>
            <ul style={{ margin: 0, color: '#155724' }}>
              <li>✓ MQTT broker accessible at ws://192.168.1.6:8080/mqtt</li>
              <li>✓ ESP32 publishing to 'esp32' topic</li>
              <li>✓ Light sensor data in supported format</li>
              <li>✓ Network connectivity between components</li>
              <li>✓ WebSocket connections allowed by firewall</li>
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
### Troubleshooting & Configuration

Comprehensive guide for resolving common issues with the live light sensor component. This includes network connectivity, data format, and sensor configuration problems.

**Quick Diagnostics:**
1. Check browser console for MQTT connection logs
2. Verify MQTT broker status and WebSocket support
3. Test ESP32 sensor data format and publishing
4. Validate network connectivity between all components
        `,
      },
    },
  },
};

// Performance notes
export const PerformanceNotes = {
  render: () => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <LightSensorLive />
      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>Performance & Optimization</h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <h4 style={{ color: '#666', marginBottom: '0.5rem' }}>Connection Optimization:</h4>
            <ul style={{ margin: 0, color: '#6c757d' }}>
              <li>Unique client IDs prevent connection conflicts</li>
              <li>Clean session mode for reliable connections</li>
              <li>Configurable reconnection periods</li>
              <li>Proper cleanup on component unmount</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: '#666', marginBottom: '0.5rem' }}>Data Processing:</h4>
            <ul style={{ margin: 0, color: '#6c757d' }}>
              <li>Efficient JSON parsing with error handling</li>
              <li>Multiple data format support without performance penalty</li>
              <li>Debounced updates for smooth gauge animations</li>
              <li>Minimal re-renders with React optimization</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: '#666', marginBottom: '0.5rem' }}>Memory Management:</h4>
            <ul style={{ margin: 0, color: '#6c757d' }}>
              <li>Automatic event listener cleanup</li>
              <li>Proper MQTT client disconnection</li>
              <li>No memory leaks on component unmount</li>
              <li>Efficient state management</li>
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
### Performance Considerations

The light sensor component is optimized for real-time performance while maintaining reliability and efficient resource usage.

**Key Optimizations:**
- Minimal re-renders through proper React hooks usage
- Efficient MQTT connection management
- Clean resource cleanup to prevent memory leaks
- Smooth animations without performance impact
        `,
      },
    },
  },
};
