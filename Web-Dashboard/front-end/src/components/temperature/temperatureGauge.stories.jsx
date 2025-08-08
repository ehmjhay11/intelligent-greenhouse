import React from 'react';
import TemperatureGauge from './temperatureGauge';

export default {
  title: 'Sensors/Temperature',
  component: TemperatureGauge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Temperature Gauge Component

A responsive temperature gauge that displays temperature readings with color-coded indicators and status information. This component provides visual feedback for temperature monitoring in intelligent greenhouse systems.

## Features

- **Visual Gauge**: Half-circle SVG gauge with smooth animations
- **Color-coded Levels**: Intuitive color mapping for different temperature ranges
- **Status Indicators**: Connection status with visual feedback
- **Responsive Design**: Adapts to different screen sizes
- **Configurable Range**: Customizable min/max temperature values
- **Precision Display**: Shows temperature with decimal precision

## Temperature Level Ranges

- **Cold** (-10°C to 10°C): Blue - Heating may be needed
- **Cool** (10°C to 20°C): Light blue - Acceptable for cool-season crops
- **Optimal** (20°C to 30°C): Green - Ideal for most plants
- **Warm** (30°C to 40°C): Orange - Ventilation recommended
- **Hot** (40°C to 50°C): Red - Cooling required

## Usage

Perfect for greenhouse climate control systems, agricultural monitoring, and environmental management where precise temperature tracking is essential for plant health and growth optimization.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    temperature: {
      control: { type: 'range', min: -10, max: 50, step: 0.1 },
      description: 'Temperature value in Celsius',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 20 },
      },
    },
    min: {
      control: { type: 'number' },
      description: 'Minimum temperature range',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: -10 },
      },
    },
    max: {
      control: { type: 'number' },
      description: 'Maximum temperature range',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 50 },
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

const Template = (args) => <TemperatureGauge {...args} />;

export const Default = Template.bind({});
Default.args = {
  temperature: 22.5,
  min: -10,
  max: 50,
  status: 'Connected',
  lastUpdate: '2s ago',
};
Default.parameters = {
  docs: {
    description: {
      story: 'Default temperature gauge showing moderate temperature (22.5°C) with connected status.',
    },
  },
};

export const Cold = Template.bind({});
Cold.args = {
  temperature: 5,
  min: -10,
  max: 50,
  status: 'Connected',
  lastUpdate: '5s ago',
};
Cold.parameters = {
  docs: {
    description: {
      story: 'Cold temperature (5°C) - displays blue color indicating low temperature.',
    },
  },
};

export const Moderate = Template.bind({});
Moderate.args = {
  temperature: 18,
  min: -10,
  max: 50,
  status: 'Connected',
  lastUpdate: '1m ago',
};
Moderate.parameters = {
  docs: {
    description: {
      story: 'Moderate temperature (18°C) - displays green color indicating comfortable temperature.',
    },
  },
};

export const Warm = Template.bind({});
Warm.args = {
  temperature: 30,
  min: -10,
  max: 50,
  status: 'Connected',
  lastUpdate: '10s ago',
};
Warm.parameters = {
  docs: {
    description: {
      story: 'Warm temperature (30°C) - displays orange color indicating elevated temperature.',
    },
  },
};

export const Hot = Template.bind({});
Hot.args = {
  temperature: 42,
  min: -10,
  max: 50,
  status: 'Connected',
  lastUpdate: 'Just now',
};
Hot.parameters = {
  docs: {
    description: {
      story: 'Hot temperature (42°C) - displays red color indicating high temperature.',
    },
  },
};

export const Freezing = Template.bind({});
Freezing.args = {
  temperature: -8,
  min: -10,
  max: 50,
  status: 'Connected',
  lastUpdate: '30s ago',
};
Freezing.parameters = {
  docs: {
    description: {
      story: 'Freezing temperature (-8°C) - displays blue color indicating very cold conditions.',
    },
  },
};

export const Disconnected = Template.bind({});
Disconnected.args = {
  temperature: 0,
  min: -10,
  max: 50,
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
  temperature: 25,
  min: -10,
  max: 50,
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
  temperature: 22,
  min: -10,
  max: 50,
  status: 'Connected',
  lastUpdate: 'Live',
};
Playground.parameters = {
  docs: {
    description: {
      story: 'Interactive playground - adjust the temperature slider to see real-time changes.',
    },
  },
};
