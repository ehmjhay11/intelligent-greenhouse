// Direct test for historical data and alerts using HTTP API calls
const axios = require('axios');

const API_BASE = 'http://localhost:3003/api';

async function testHistoricalDataAndAlerts() {
  console.log('🧪 === TESTING HISTORICAL DATA AND ALERTS VIA API ===\n');
  
  try {
    // Test 1: Check if backend is running
    console.log('1️⃣ Testing backend connection...');
    const healthCheck = await axios.get(API_BASE);
    console.log('✅ Backend is running:', healthCheck.data.message);
    
    // Test 2: Get current plants to find one to assign alerts to
    console.log('\n2️⃣ Checking available plants...');
    const plantsResponse = await axios.get(`${API_BASE}/plants`);
    
    if (plantsResponse.data.success && plantsResponse.data.data.length > 0) {
      const plant = plantsResponse.data.data[0];
      console.log(`✅ Found plant: ${plant.name} (ID: ${plant._id})`);
      
      // Test 3: Create test alerts manually
      console.log('\n3️⃣ Creating test alerts...');
      
      const testAlerts = [
        {
          plantId: plant._id,
          deviceId: 1,
          type: 'soil_moisture',
          severity: 'critical',
          title: 'Critical Low Soil Moisture',
          message: `${plant.name} soil moisture is critically low at 0%`,
          sensorValue: 0,
          threshold: { min: 30, max: 90, ideal_min: 50, ideal_max: 70 }
        },
        {
          plantId: plant._id,
          deviceId: 1,
          type: 'humidity',
          severity: 'warning',
          title: 'High Humidity Alert',
          message: `${plant.name} humidity is high at 88%`,
          sensorValue: 88,
          threshold: { min: 40, max: 80, ideal_min: 60, ideal_max: 70 }
        },
        {
          plantId: plant._id,
          deviceId: 1,
          type: 'light',
          severity: 'critical',
          title: 'No Light Detected',
          message: `${plant.name} light level is 0 - plants need light!`,
          sensorValue: 0,
          threshold: { min: 200, max: 1000, ideal_min: 400, ideal_max: 800 }
        }
      ];
      
      for (const alert of testAlerts) {
        try {
          const alertResponse = await axios.post(`${API_BASE}/alerts/create`, alert);
          if (alertResponse.data.success) {
            console.log(`✅ Created alert: ${alert.title}`);
          } else {
            console.log(`ℹ️ Alert may already exist: ${alert.title}`);
          }
        } catch (error) {
          console.log(`⚠️ Alert creation issue: ${alert.title}`);
        }
      }
      
    } else {
      console.log('⚠️ No plants found. Please create a plant first.');
    }
    
    // Test 4: Check alerts
    console.log('\n4️⃣ Checking created alerts...');
    const alertsResponse = await axios.get(`${API_BASE}/alerts`);
    console.log(`📊 Found ${alertsResponse.data.data.length} active alerts`);
    
    // Test 5: Check historical data
    console.log('\n5️⃣ Checking historical data...');
    const historicalResponse = await axios.get(`${API_BASE}/sensors/historical?device=1&range=1h`);
    console.log(`📈 Found ${historicalResponse.data.data.length} historical data points`);
    
    console.log('\n✅ === TEST COMPLETE ===');
    console.log('📊 Now check your dashboard:');
    console.log('   🚨 Alerts tab should show 3 alerts');
    console.log('   📈 Historical tab should show real ESP32 data');
    console.log('   🌐 Live sensors should show current values');
    console.log('\n🌐 Open http://localhost:3000 to view the dashboard');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Backend is not running! Start it with: npm start');
    }
  }
}

// Run the test
testHistoricalDataAndAlerts();
