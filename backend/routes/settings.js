const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get working hours settings
router.get('/working-hours', async (req, res) => {
  try {
    const doc = await db.collection('settings').doc('workingHours').get();
    
    if (!doc.exists) {
      // Return default working hours
      return res.status(200).json({
        success: true,
        workingHours: {
          monday: { enabled: true, start: '08:00', end: '17:00' },
          tuesday: { enabled: true, start: '08:00', end: '17:00' },
          wednesday: { enabled: true, start: '08:00', end: '17:00' },
          thursday: { enabled: true, start: '08:00', end: '17:00' },
          friday: { enabled: true, start: '08:00', end: '17:00' },
          saturday: { enabled: true, start: '08:00', end: '12:00' },
          sunday: { enabled: false, start: '00:00', end: '00:00' }
        }
      });
    }

    res.status(200).json({
      success: true,
      workingHours: doc.data()
    });
  } catch (error) {
    console.error('Error fetching working hours:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch working hours',
      error: error.message
    });
  }
});

// Update working hours (Admin only)
router.put('/working-hours', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { workingHours } = req.body;
    
    await db.collection('settings').doc('workingHours').set(workingHours);
    
    res.status(200).json({
      success: true,
      message: 'Working hours updated successfully',
      workingHours
    });
  } catch (error) {
    console.error('Error updating working hours:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update working hours',
      error: error.message
    });
  }
});

// Get available time slots for a specific date and service
router.get('/available-slots', async (req, res) => {
  try {
    const { date, serviceId } = req.query;
    
    if (!date || !serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Date and serviceId are required'
      });
    }

    // Get service details
    const serviceDoc = await db.collection('services').doc(serviceId).get();
    if (!serviceDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    const service = serviceDoc.data();
    const durationMinutes = parseInt(service.duration) || 60;
    
    // Get working hours
    const workingHoursDoc = await db.collection('settings').doc('workingHours').get();
    const workingHours = workingHoursDoc.exists ? workingHoursDoc.data() : {
      monday: { enabled: true, start: '08:00', end: '17:00' },
      tuesday: { enabled: true, start: '08:00', end: '17:00' },
      wednesday: { enabled: true, start: '08:00', end: '17:00' },
      thursday: { enabled: true, start: '08:00', end: '17:00' },
      friday: { enabled: true, start: '08:00', end: '17:00' },
      saturday: { enabled: true, start: '08:00', end: '12:00' },
      sunday: { enabled: false, start: '00:00', end: '00:00' }
    };
    
    // Get day of week
    const dateObj = new Date(date);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dateObj.getDay()];
    
    const daySchedule = workingHours[dayName];
    
    if (!daySchedule || !daySchedule.enabled) {
      return res.status(200).json({
        success: true,
        availableSlots: []
      });
    }
    
    // Generate time slots
    const slots = [];
    const [startHour, startMinute] = daySchedule.start.split(':').map(Number);
    const [endHour, endMinute] = daySchedule.end.split(':').map(Number);
    
    let currentTime = startHour * 60 + startMinute; // Convert to minutes
    const endTime = endHour * 60 + endMinute;
    
    while (currentTime + durationMinutes <= endTime) {
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      slots.push(timeString);
      currentTime += durationMinutes;
    }
    
    // Get booked appointments for this date
    const appointmentsSnapshot = await db.collection('appointments')
      .where('appointmentDate', '==', date)
      .where('status', 'in', ['pending', 'approved'])
      .get();
    
    const bookedSlots = [];
    appointmentsSnapshot.forEach(doc => {
      const appointment = doc.data();
      bookedSlots.push(appointment.appointmentTime);
    });
    
    // Filter out booked slots
    const availableSlots = slots.filter(slot => !bookedSlots.includes(slot));
    
    res.status(200).json({
      success: true,
      availableSlots,
      bookedSlots
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available slots',
      error: error.message
    });
  }
});

module.exports = router;
