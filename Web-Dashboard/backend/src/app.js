require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { seedDatabase } = require('./seeders/seedDatabase');
const thresholdMonitoringService = require('./services/ThresholdMonitoringService');
const mqttDataSimulator = require('./services/MQTTDataSimulator');
const mqttSensorService = require('./services/MQTTSensorService');
const sensorRoutes = require('./routes/sensors');
const plantRoutes = require('./routes/plants');
const sensorTypesRouter = require('./routes/sensorTypes');
const plantTypesRouter = require('./routes/plantTypes');
const thresholdBreachesRouter = require('./routes/thresholdBreaches');
const alertRoutes = require('./routes/alerts');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Intelligent Greenhouse API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// API base route
app.get('/api', (req, res) => {
  res.json({
    message: 'Intelligent Greenhouse API v1.0',
    status: 'running',
    endpoints: {
      sensors: '/api/sensors',
      plants: '/api/plants',
      sensorTypes: '/api/sensor-types',
      plantTypes: '/api/plant-types',
      thresholdBreaches: '/api/threshold-breaches',
      alerts: '/api/alerts'
    },
    documentation: 'Available endpoints listed above',
    timestamp: new Date().toISOString()
  });
});

// Use routes
app.use('/api/sensors', sensorRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/sensor-types', sensorTypesRouter);
app.use('/api/plant-types', plantTypesRouter);
app.use('/api/threshold-breaches', thresholdBreachesRouter);
app.use('/api/alerts', alertRoutes);
app.use('/api/threshold-breaches', thresholdBreachesRouter);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /api',
      'GET /api/sensors',
      'GET /api/plants',
      'GET /api/sensor-types',
      'GET /api/plant-types',
      'GET /api/threshold-breaches'
    ]
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to database
    const dbConnection = await connectDB();
    
    if (dbConnection) {
      console.log('🌱 Database connected successfully');
      
      // Seed database with initial data
      try {
        await seedDatabase();
        console.log('🌿 Database seeding completed');
      } catch (seedError) {
        console.log('⚠️  Database seeding failed:', seedError.message);
      }

      // Start threshold monitoring service
      thresholdMonitoringService.start();

      // Start MQTT sensor service to process real ESP32 data
      mqttSensorService.start();

      // Start MQTT data simulator for testing (remove in production)
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          mqttDataSimulator.start();
        }, 5000); // Start after 5 seconds to allow database setup
      }
    } else {
      console.log('⚠️  Starting server without database connection');
    }

    // Start server
    const PORT = process.env.PORT || 3003;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🌐 Base URL: http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();

module.exports = app;