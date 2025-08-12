// Quick script to assign Device 1 to a plant so alerts will work
const axios = require('axios');

const API_BASE = 'http://localhost:3003/api';

async function assignDeviceToPlant() {
  try {
    console.log('🔄 Assigning Device 1 to a plant for alert generation...');
    
    // Get the first available plant
    const plantsResponse = await axios.get(`${API_BASE}/plants`);
    
    if (plantsResponse.data.success && plantsResponse.data.data.length > 0) {
      const plant = plantsResponse.data.data[0];
      console.log(`✅ Found plant: ${plant.name}`);
      
      // Assign Device 1 to this plant
      const assignmentData = {
        assignedPlant: plant._id
      };
      
      const assignResponse = await axios.put(`${API_BASE}/sensors/1/assignment`, assignmentData);
      
      if (assignResponse.data.success) {
        console.log(`✅ Device 1 assigned to ${plant.name}`);
        console.log('🚨 Alerts should now be generated automatically for:');
        console.log('   - 0% soil moisture (CRITICAL)');
        console.log('   - 88% humidity (WARNING)'); 
        console.log('   - 0 light level (CRITICAL)');
        console.log('\n📊 Check your dashboard at http://localhost:3000');
        console.log('   🚨 Click "View Alerts" to see active alerts');
        console.log('   📈 Click "Historical Data" to see ESP32 sensor trends');
      } else {
        console.log('❌ Failed to assign device:', assignResponse.data.message);
      }
      
    } else {
      console.log('❌ No plants available. Please create a plant first in the Plant Management page.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Backend is not running! Please start it first.');
    }
  }
}

assignDeviceToPlant();
