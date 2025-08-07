import React from 'react';
import SoilMoistureGauge from './soil_moisture';

export default {
  title: 'Components/SoilMoistureGauge',
  component: SoilMoistureGauge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A responsive soil moisture gauge that displays moisture levels from 0-100% with color-coded indicators and status information.',
      },
    },
  },
  argTypes: {
    moisture: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Moisture percentage value (0-100)',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 0 },
      },
    },
    status: {
      control: { type: 'select' },
      options: ['Connected', 'Disconnected', 'Error', 'Connecting'],
      description: 'Connection status',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Disconnected' },
      },
    },
    lastUpdate: {
      control: { type: 'text' },
      description: 'Last update timestamp or message',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'No data' },
      },
    },
  },
};

const Template = (args) => <SoilMoistureGauge {...args} />;

export const Default = Template.bind({});
Default.args = {
  moisture: 50,
  status: 'Connected',
  lastUpdate: '2s ago',
};
Default.parameters = {
  docs: {
    description: {
      story: 'Default soil moisture gauge showing moderate moisture level (50%) with connected status.',
    },
  },
};

export const Dry = Template.bind({});
Dry.args = {
  moisture: 15,
  status: 'Connected',
  lastUpdate: '5s ago',
};
Dry.parameters = {
  docs: {
    description: {
      story: 'Low moisture level (15%) - displays red color indicating dry soil that needs watering.',
    },
  },
};

export const Moderate = Template.bind({});
Moderate.args = {
  moisture: 45,
  status: 'Connected',
  lastUpdate: '1m ago',
};
Moderate.parameters = {
  docs: {
    description: {
      story: 'Moderate moisture level (45%) - displays orange color indicating adequate moisture.',
    },
  },
};

export const Wet = Template.bind({});
Wet.args = {
  moisture: 85,
  status: 'Connected',
  lastUpdate: '10s ago',
};
Wet.parameters = {
  docs: {
    description: {
      story: 'High moisture level (85%) - displays green color indicating well-watered soil.',
    },
  },
};

export const Critical = Template.bind({});
Critical.args = {
  moisture: 5,
  status: 'Connected',
  lastUpdate: 'Just now',
};
Critical.parameters = {
  docs: {
    description: {
      story: 'Critical low moisture level (5%) - requires immediate attention.',
    },
  },
};

export const Optimal = Template.bind({});
Optimal.args = {
  moisture: 75,
  status: 'Connected',
  lastUpdate: '30s ago',
};
Optimal.parameters = {
  docs: {
    description: {
      story: 'Optimal moisture level (75%) - ideal for most plants.',
    },
  },
};

export const Disconnected = Template.bind({});
Disconnected.args = {
  moisture: 0,
  status: 'Disconnected',
  lastUpdate: 'No data',
};
Disconnected.parameters = {
  docs: {
    description: {
      story: 'Disconnected state - no sensor data available.',
    },
  },
};

export const Error = Template.bind({});
Error.args = {
  moisture: 42,
  status: 'Error',
  lastUpdate: 'Connection failed',
};
Error.parameters = {
  docs: {
    description: {
      story: 'Error state - sensor connection has failed.',
    },
  },
};

// Interactive playground story
export const Playground = Template.bind({});
Playground.args = {
  moisture: 50,
  status: 'Connected',
  lastUpdate: 'Live',
};
Playground.parameters = {
  docs: {
    description: {
      story: 'Interactive playground - adjust the moisture slider to see real-time changes.',
    },
  },
};
