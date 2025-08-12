const express = require('express');
const ThresholdBreach = require('../models/ThresholdBreach');
const thresholdMonitoringService = require('../services/ThresholdMonitoringService');
const router = express.Router();

// Get all threshold breaches with optional filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      deviceId: req.query.deviceId,
      plantId: req.query.plantId,
      sensorType: req.query.sensorType,
      severity: req.query.severity,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : 100
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );

    const breaches = await thresholdMonitoringService.getBreachHistory(filters);
    
    res.json({
      success: true,
      data: breaches,
      count: breaches.length,
      filters: filters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching threshold breaches',
      error: error.message
    });
  }
});

// Get active threshold breaches
router.get('/active', async (req, res) => {
  try {
    const activeBreaches = await thresholdMonitoringService.getActiveBreaches();
    
    res.json({
      success: true,
      data: activeBreaches,
      count: activeBreaches.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active threshold breaches',
      error: error.message
    });
  }
});

// Get breach statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await ThresholdBreach.aggregate([
      {
        $group: {
          _id: {
            severity: '$severity',
            sensorType: '$sensorType'
          },
          count: { $sum: 1 },
          avgValue: { $avg: '$currentValue' }
        }
      },
      {
        $group: {
          _id: '$_id.severity',
          sensorTypes: {
            $push: {
              sensorType: '$_id.sensorType',
              count: '$count',
              avgValue: '$avgValue'
            }
          },
          totalCount: { $sum: '$count' }
        }
      }
    ]);

    const activeCount = await ThresholdBreach.countDocuments({ isActive: true });
    const totalCount = await ThresholdBreach.countDocuments();

    res.json({
      success: true,
      data: {
        bySeverity: stats,
        summary: {
          total: totalCount,
          active: activeCount,
          resolved: totalCount - activeCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching breach statistics',
      error: error.message
    });
  }
});

// Manually resolve a breach
router.put('/:id/resolve', async (req, res) => {
  try {
    const breach = await ThresholdBreach.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
        resolvedAt: new Date()
      },
      { new: true }
    );

    if (!breach) {
      return res.status(404).json({
        success: false,
        message: 'Threshold breach not found'
      });
    }

    res.json({
      success: true,
      message: 'Threshold breach resolved successfully',
      data: breach
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resolving threshold breach',
      error: error.message
    });
  }
});

// Delete old breach records (cleanup)
router.delete('/cleanup', async (req, res) => {
  try {
    const daysToKeep = req.query.days ? parseInt(req.query.days) : 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await ThresholdBreach.deleteMany({
      createdAt: { $lt: cutoffDate },
      isActive: false
    });

    res.json({
      success: true,
      message: `Cleaned up threshold breach records older than ${daysToKeep} days`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cleaning up threshold breach records',
      error: error.message
    });
  }
});

module.exports = router;
