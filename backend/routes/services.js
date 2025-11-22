const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get all services
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('services').get();
    
    const services = [];
    snapshot.forEach(doc => {
      services.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('services').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      service: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service',
      error: error.message
    });
  }
});

// Add or update discount for a service (Admin only)
router.patch('/:id/discount', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { type, value, expiresAt, active } = req.body;
    
    // Validate discount type
    if (!['percentage', 'fixed'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discount type. Must be "percentage" or "fixed"'
      });
    }
    
    // Validate discount value
    if (type === 'percentage' && (value < 0 || value > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount must be between 0 and 100'
      });
    }
    
    if (value < 0) {
      return res.status(400).json({
        success: false,
        message: 'Discount value cannot be negative'
      });
    }
    
    const discount = {
      type,
      value: parseFloat(value),
      active: active !== undefined ? active : true,
      updatedAt: new Date()
    };
    
    if (expiresAt) {
      discount.expiresAt = new Date(expiresAt);
    }
    
    await db.collection('services').doc(req.params.id).update({
      discount
    });
    
    res.status(200).json({
      success: true,
      message: 'Discount updated successfully',
      discount
    });
  } catch (error) {
    console.error('Error updating discount:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update discount',
      error: error.message
    });
  }
});

// Remove discount from a service (Admin only)
router.delete('/:id/discount', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await db.collection('services').doc(req.params.id).update({
      discount: null
    });
    
    res.status(200).json({
      success: true,
      message: 'Discount removed successfully'
    });
  } catch (error) {
    console.error('Error removing discount:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove discount',
      error: error.message
    });
  }
});

module.exports = router;
