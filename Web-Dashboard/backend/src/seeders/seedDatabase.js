const SensorType = require('../models/SensorType');
const PlantType = require('../models/PlantType');
const ThresholdBreach = require('../models/ThresholdBreach');

const seedSensorTypes = async () => {
  const sensorTypes = [
    {
      name: 'Soil Moisture Sensor',
      type: 'soil_moisture',
      description: 'Measures soil moisture content',
      unit: '%',
      defaultPin: 'A0',
      category: 'soil'
    },
    {
      name: 'Temperature Sensor',
      type: 'temperature',
      description: 'Measures ambient temperature',
      unit: '°C',
      defaultPin: 'D4',
      category: 'environmental'
    },
    {
      name: 'Humidity Sensor',
      type: 'humidity',
      description: 'Measures relative humidity',
      unit: '%',
      defaultPin: 'D5',
      category: 'environmental'
    },
    {
      name: 'Light Sensor',
      type: 'light',
      description: 'Measures light intensity',
      unit: 'lux',
      defaultPin: 'A1',
      category: 'light'
    }
  ];

  for (const sensorType of sensorTypes) {
    await SensorType.findOneAndUpdate(
      { type: sensorType.type },
      sensorType,
      { upsert: true, new: true }
    );
  }
  console.log('✅ Sensor types seeded successfully');
};

const seedPlantTypes = async () => {
  const plantTypes = [
    {
      name: 'Cherry Tomatoes',
      type: 'tomato',
      description: 'Sweet cherry tomato variety perfect for containers',
      category: 'vegetable',
      growthStages: ['seedling', 'growing', 'flowering', 'fruiting', 'harvest'],
      defaultThresholds: {
        temperature: { min: 18, max: 30, ideal_min: 20, ideal_max: 25 },
        humidity: { min: 60, max: 80, ideal_min: 65, ideal_max: 75 },
        soil_moisture: { min: 40, max: 80, ideal_min: 60, ideal_max: 70 },
        light: { min: 300, max: 800, ideal_min: 400, ideal_max: 600 }
      },
      estimatedGrowthDays: 80,
      difficulty: 'medium'
    },
    {
      name: 'Butter Lettuce',
      type: 'lettuce',
      description: 'Tender butter lettuce with soft leaves',
      category: 'vegetable',
      growthStages: ['seedling', 'growing', 'harvest'],
      defaultThresholds: {
        temperature: { min: 15, max: 25, ideal_min: 18, ideal_max: 22 },
        humidity: { min: 50, max: 70, ideal_min: 55, ideal_max: 65 },
        soil_moisture: { min: 50, max: 85, ideal_min: 65, ideal_max: 75 },
        light: { min: 200, max: 500, ideal_min: 250, ideal_max: 400 }
      },
      estimatedGrowthDays: 45,
      difficulty: 'easy'
    },
    {
      name: 'Sweet Basil',
      type: 'basil',
      description: 'Aromatic sweet basil for cooking',
      category: 'herb',
      growthStages: ['seedling', 'growing', 'flowering', 'harvest'],
      defaultThresholds: {
        temperature: { min: 20, max: 35, ideal_min: 22, ideal_max: 28 },
        humidity: { min: 40, max: 65, ideal_min: 45, ideal_max: 60 },
        soil_moisture: { min: 35, max: 70, ideal_min: 45, ideal_max: 60 },
        light: { min: 400, max: 1000, ideal_min: 500, ideal_max: 800 }
      },
      estimatedGrowthDays: 60,
      difficulty: 'easy'
    }
  ];

  for (const plantType of plantTypes) {
    await PlantType.findOneAndUpdate(
      { type: plantType.type },
      plantType,
      { upsert: true, new: true }
    );
  }
  console.log('✅ Plant types seeded successfully');
};

const seedDatabase = async () => {
  try {
    // Check if mongoose is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  MongoDB not connected, skipping database seeding');
      return;
    }

    await seedSensorTypes();
    await seedPlantTypes();
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

module.exports = { seedDatabase, seedSensorTypes, seedPlantTypes };
