import React from 'react';
import HumiditySensorGauge from './humiditySensor';

export default {
  title: 'Sensors/HumiditySensor',
  component: HumiditySensorGauge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    humidity: {
      control: {
        type: 'range',
        min: 0,
        max: 100,
        step: 1,
      },
      description: 'Humidity percentage (0-100%)',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '50' },
      },
    },
    status: {
      control: {
        type: 'select',
        options: ['connected', 'disconnected', 'connecting', 'reconnecting', 'error'],
      },
      description: 'Connection status of the sensor',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'connected' },
      },
    },
    lastUpdate: {
      control: 'text',
      description: 'Last update timestamp or status message',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Just now' },
      },
    },
    min: {
      control: {
        type: 'number',
        min: 0,
        max: 50,
      },
      description: 'Minimum humidity value for the gauge',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' },
      },
    },
    max: {
      control: {
        type: 'number',
        min: 50,
        max: 100,
      },
      description: 'Maximum humidity value for the gauge',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '100' },
      },
    },
  },
};

// Default story showing optimal humidity level
export const Default = {
  args: {
    humidity: 50,
    status: 'connected',
    lastUpdate: 'Just now',
  },
};

// Too dry humidity (very low)
export const TooDry = {
  args: {
    humidity: 15,
    status: 'connected',
    lastUpdate: '2s ago',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows very low humidity conditions that may be harmful to plants.',
      },
    },
  },
};

// Dry humidity
export const Dry = {
  args: {
    humidity: 35,
    status: 'connected',
    lastUpdate: '5s ago',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows dry humidity conditions that may require attention.',
      },
    },
  },
};

// Optimal humidity (ideal for most plants)
export const Optimal = {
  args: {
    humidity: 55,
    status: 'connected',
    lastUpdate: '1s ago',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows optimal humidity levels for plant growth.',
      },
    },
  },
};

// Humid conditions
export const Humid = {
  args: {
    humidity: 70,
    status: 'connected',
    lastUpdate: '3s ago',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows humid conditions that are still acceptable for most plants.',
      },
    },
  },
};

// Very humid conditions
export const VeryHumid = {
  args: {
    humidity: 90,
    status: 'connected',
    lastUpdate: 'Just now',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows very humid conditions that may promote fungal growth.',
      },
    },
  },
};

// Maximum humidity level
export const MaximumHumidity = {
  args: {
    humidity: 100,
    status: 'connected',
    lastUpdate: 'Live',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows maximum humidity level reading.',
      },
    },
  },
};

// Minimum humidity level
export const MinimumHumidity = {
  args: {
    humidity: 0,
    status: 'connected',
    lastUpdate: '10s ago',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows minimum humidity level (completely dry air).',
      },
    },
  },
};

// Connection status variations
export const Disconnected = {
  args: {
    humidity: 0,
    status: 'disconnected',
    lastUpdate: 'Connection lost',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the gauge when sensor is disconnected.',
      },
    },
  },
};

export const Connecting = {
  args: {
    humidity: 0,
    status: 'connecting',
    lastUpdate: 'Connecting...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the gauge while connecting to the sensor.',
      },
    },
  },
};

export const Reconnecting = {
  args: {
    humidity: 45,
    status: 'reconnecting',
    lastUpdate: 'Reconnecting...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the gauge while reconnecting to the sensor.',
      },
    },
  },
};

export const ErrorState = {
  args: {
    humidity: 0,
    status: 'error',
    lastUpdate: 'Sensor error',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the gauge when there is a sensor error.',
      },
    },
  },
};

// Custom range demonstration
export const CustomRange = {
  args: {
    humidity: 65,
    min: 20,
    max: 80,
    status: 'connected',
    lastUpdate: 'Custom range',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the gauge with a custom humidity range (20-80%).',
      },
    },
  },
};

// Interactive playground
export const Interactive = {
  args: {
    humidity: 50,
    status: 'connected',
    lastUpdate: 'Interactive mode',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test different humidity levels and statuses.',
      },
    },
  },
};

// Humidity level ranges demonstration
export const HumidityLevelRanges = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', padding: '1rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#666' }}>Too Dry (0-29%)</h3>
        <HumiditySensorGauge humidity={20} status="connected" lastUpdate="Now" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#666' }}>Dry (30-39%)</h3>
        <HumiditySensorGauge humidity={35} status="connected" lastUpdate="Now" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#666' }}>Optimal (40-59%)</h3>
        <HumiditySensorGauge humidity={50} status="connected" lastUpdate="Now" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#666' }}>Humid (60-79%)</h3>
        <HumiditySensorGauge humidity={70} status="connected" lastUpdate="Now" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#666' }}>Very Humid (80-100%)</h3>
        <HumiditySensorGauge humidity={85} status="connected" lastUpdate="Now" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates all humidity level ranges with their corresponding colors and descriptions.',
      },
    },
  },
};
