// Quick test script to populate the dashboard with sample data
const { handleSensorData } = require('../routes/sensors');

console.log('🧪 === POPULATING DASHBOARD WITH TEST DATA ===\n');

// Simulate 1 hour of historical data
const generateTestData = async () => {
  console.log('📊 Generating test sensor data...');
  
  const deviceId = 1;
  const now = Date.now();
  const intervalMs = 2 * 60 * 1000; // 2 minutes
  
  // Generate 30 data points over the last hour
  for (let i = 30; i >= 0; i--) {
    const timestamp = new Date(now - (i * intervalMs));
    
    // Generate varied data that might trigger some alerts
    let temperature = 22 + Math.sin(i * 0.2) * 8; // 14-30°C
    let humidity = 65 + Math.cos(i * 0.15) * 20; // 45-85%
    let soil_moisture = 55 + Math.sin(i * 0.1) * 25; // 30-80%
    let light_level = 45 + Math.cos(i * 0.3) * 35; // 10-80
    
    // Add some spikes that will trigger alerts
    if (i === 10) temperature = 38; // High temp alert
    if (i === 15) soil_moisture = 15; // Low soil alert
    if (i === 5) humidity = 95; // High humidity alert
    
    // Round values
    temperature = Math.round(temperature * 10) / 10;
    humidity = Math.round(humidity * 10) / 10;
    soil_moisture = Math.round(Math.max(0, Math.min(100, soil_moisture)));
    light_level = Math.round(Math.max(0, Math.min(100, light_level)));
    
    // Send each sensor reading
    await handleSensorData(deviceId, 'temperature', temperature);
    await handleSensorData(deviceId, 'humidity', humidity);
    await handleSensorData(deviceId, 'soil_moisture', soil_moisture);
    await handleSensorData(deviceId, 'light', light_level);
    
    // Small delay to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log('✅ Test data generation complete!');
  console.log('📊 Check your dashboard for:');
  console.log('   🚨 3-4 alerts in the alerts panel');
  console.log('   📈 30 data points in historical charts');
  console.log('   📱 Real-time sensor readings');
  console.log('\n🌐 Open http://localhost:3000 to view the dashboard');
};

// Run the test data generation
generateTestData().catch(console.error);
