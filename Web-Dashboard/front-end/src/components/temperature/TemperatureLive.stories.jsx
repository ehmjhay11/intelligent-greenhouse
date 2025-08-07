import React from 'react';
import TemperatureLive from './TemperatureLive';
import TemperatureGauge from './temperatureGauge';

export default {
  title: 'Components/TemperatureLive',
  component: TemperatureLive,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A live temperature gauge that connects to MQTT broker and displays real-time sensor data from ESP32 devices.',
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
