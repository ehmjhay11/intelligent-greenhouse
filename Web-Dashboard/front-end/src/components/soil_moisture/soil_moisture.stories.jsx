import React from 'react';
import SoilMoistureGauge from './soil_moisture';

export default {
  title: 'Components/SoilMoistureGauge',
  component: SoilMoistureGauge,
  argTypes: {
    moisture: {
      control: { type: 'range', min: 0, max: 100 },
      defaultValue: 50,
    },
  },
};

const Template = (args) => <SoilMoistureGauge {...args} />;

export const Default = Template.bind({});
Default.args = {
  moisture: 50,
};

export const Dry = Template.bind({});
Dry.args = {
  moisture: 10,
};

export const Wet = Template.bind({});
Wet.args = {
  moisture: 90,
};
