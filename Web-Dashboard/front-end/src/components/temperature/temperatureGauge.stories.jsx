import React from 'react';
import TemperatureGauge from './temperatureGauge';

export default {
  title: 'Components/TemperatureGauge',
  component: TemperatureGauge,
  argTypes: {
    temperature: {
      control: { type: 'range', min: -10, max: 50 },
      defaultValue: 20,
    },
    min: {
      control: { type: 'number' },
      defaultValue: -10,
    },
    max: {
      control: { type: 'number' },
      defaultValue: 50,
    },
  },
};

const Template = (args) => <TemperatureGauge {...args} />;

export const Default = Template.bind({});
Default.args = {
  temperature: 20,
  min: -10,
  max: 50,
};

export const Cold = Template.bind({});
Cold.args = {
  temperature: -5,
  min: -10,
  max: 50,
};

export const Hot = Template.bind({});
Hot.args = {
  temperature: 45,
  min: -10,
  max: 50,
};
