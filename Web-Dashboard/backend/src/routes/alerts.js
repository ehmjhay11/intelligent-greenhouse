const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const Plant = require('../models/Plant');

// Get all active alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find({ acknowledged: false })
      .populate('plant', 'name plantType')
      .sort({ createdAt: -1 });
    
    console.log(`📋 Retrieved ${alerts.length} active alerts`);
    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error('❌ Error fetching alerts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Acknowledge an alert
router.post('/:alertId/acknowledge', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.alertId,
      { acknowledged: true, acknowledgedAt: new Date() },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    console.log(`✅ Alert ${req.params.alertId} acknowledged`);
    res.json({ success: true, data: alert });
  } catch (error) {
    console.error('❌ Error acknowledging alert:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get alert history
router.get('/history', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    const alerts = await Alert.find()
      .populate('plant', 'name plantType')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const total = await Alert.countDocuments();
    
    res.json({ 
      success: true, 
      data: alerts,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });
  } catch (error) {
    console.error('❌ Error fetching alert history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a new alert (internal use)
router.post('/create', async (req, res) => {
  try {
    const { plantId, deviceId, type, severity, title, message, sensorValue, threshold } = req.body;
    
    // Check if similar alert already exists in last 10 minutes
    const recentAlert = await Alert.findOne({
      plant: plantId,
      type: type,
      acknowledged: false,
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) }
    });
    
    if (recentAlert) {
      console.log(`⏭️ Skipping duplicate alert for plant ${plantId}, type ${type}`);
      return res.json({ success: true, data: recentAlert, duplicate: true });
    }
    
    const alert = new Alert({
      plant: plantId,
      deviceId,
      type,
      severity,
      title,
      message,
      sensorValue,
      threshold,
      acknowledged: false
    });
    
    await alert.save();
    await alert.populate('plant', 'name plantType');
    
    console.log(`🚨 New ${severity} alert created: ${title}`);
    res.json({ success: true, data: alert });
  } catch (error) {
    console.error('❌ Error creating alert:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
