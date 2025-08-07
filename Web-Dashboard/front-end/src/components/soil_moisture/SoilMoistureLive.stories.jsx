import React from 'react';
import SoilMoistureLive from './SoilMoistureLive';
import SoilMoistureGauge from './soil_moisture';

export default {
  title: 'Components/SoilMoistureLive',
  component: SoilMoistureLive,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A live soil moisture gauge that connects to MQTT broker and displays real-time sensor data from ESP32 devices.',
      },
    },
  },
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