import React from 'react';
import LightSensorGauge from './lightSensor';

export default {
  title: 'Sensors/LightSensor',
  component: LightSensorGauge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    lightLevel: {
      control: {
        type: 'range',
        min: 0,
        max: 100,
        step: 1,
      },
      description: 'Light level percentage (0-100%)',
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
  },
};

// Default story showing moderate light level
export const Default = {
  args: {
    lightLevel: 50,
    status: 'connected',
    lastUpdate: 'Just now',
  },
};

// Very low light (dark environment)
export const VeryLowLight = {
  args: {
    lightLevel: 5,
    status: 'connected',
    lastUpdate: '2s ago',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows very low light conditions, typically in dark environments or night time.',
      },
    },
  },
};

// Low light (dim environment)
export const LowLight = {
  args: {
    lightLevel: 20,
    status: 'connected',
    lastUpdate: '5s ago',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows low light conditions, such as indoor lighting or cloudy day.',
      },
    },
  },
};

// Moderate light (typical indoor)
export const ModerateLight = {
  args: {
    lightLevel: 45,
    status: 'connected',
    lastUpdate: '1s ago',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows moderate light levels, typical for well-lit indoor environments.',
      },
    },
  },
};

// Good light (bright indoor/outdoor shade)
export const GoodLight = {
  args: {
    lightLevel: 75,
    status: 'connected',
    lastUpdate: '3s ago',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows good light levels, suitable for most plant growth.',
      },
    },
  },
};

// Very bright light (direct sunlight)
export const VeryBrightLight = {
  args: {
    lightLevel: 95,
    status: 'connected',
    lastUpdate: 'Just now',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows very bright light conditions, such as direct sunlight or high-intensity artificial lighting.',
      },
    },
  },
};

// Maximum light level
export const MaximumLight = {
  args: {
    lightLevel: 100,
    status: 'connected',
    lastUpdate: 'Live',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows maximum light level reading.',
      },
    },
  },
};

// Minimum light level
export const MinimumLight = {
  args: {
    lightLevel: 0,
    status: 'connected',
    lastUpdate: '10s ago',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows minimum light level (complete darkness).',
      },
    },
  },
};

// Connection status variations
export const Disconnected = {
  args: {
    lightLevel: 0,
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
    lightLevel: 0,
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
    lightLevel: 35,
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
    lightLevel: 0,
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

// Interactive playground
export const Interactive = {
  args: {
    lightLevel: 50,
    status: 'connected',
    lastUpdate: 'Interactive mode',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test different light levels and statuses.',
      },
    },
  },
};

// Light level ranges demonstration
export const LightLevelRanges = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', padding: '1rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#666' }}>Very Low (0-15%)</h3>
        <LightSensorGauge lightLevel={10} status="connected" lastUpdate="Now" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#666' }}>Low (16-35%)</h3>
        <LightSensorGauge lightLevel={25} status="connected" lastUpdate="Now" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#666' }}>Moderate (36-55%)</h3>
        <LightSensorGauge lightLevel={45} status="connected" lastUpdate="Now" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#666' }}>Good (56-80%)</h3>
        <LightSensorGauge lightLevel={68} status="connected" lastUpdate="Now" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#666' }}>Very Bright (81-100%)</h3>
        <LightSensorGauge lightLevel={90} status="connected" lastUpdate="Now" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates all light level ranges with their corresponding colors and descriptions.',
      },
    },
  },
};
