const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { authMiddleware } = require('../middleware/auth');

// Create a new appointment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { 
      serviceId, 
      serviceName, 
      vehicleInfo, 
      appointmentDate, 
      appointmentTime,
      paymentDetails,
      notes 
    } = req.body;

    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    const appointmentData = {
      userId: req.user.uid,
      userEmail: req.user.email,
      userName: userData?.displayName || req.user.displayName || 'User',
      serviceId,
      serviceName,
      vehicleInfo,
      appointmentDate,
      appointmentTime,
      paymentDetails,
      notes: notes || '',
      status: 'pending',
      receiptBase64: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('appointments').add(appointmentData);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointmentId: docRef.id
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message
    });
  }
});

// Get user's appointments
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection('appointments')
      .where('userId', '==', req.user.uid)
      .get();

    const appointments = [];
    snapshot.forEach(doc => {
      appointments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort in memory to avoid index requirement
    appointments.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA; // Descending order
    });

    res.status(200).json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
});

// Get single appointment by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const doc = await db.collection('appointments').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const appointmentData = doc.data();

    // Check if user owns this appointment or is admin
    if (appointmentData.userId !== req.user.uid && !req.user.admin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      appointment: {
        id: doc.id,
        ...appointmentData
      }
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment',
      error: error.message
    });
  }
});

// Upload receipt for appointment
router.patch('/:id/receipt', authMiddleware, async (req, res) => {
  try {
    const { receiptBase64 } = req.body;
    const appointmentRef = db.collection('appointments').doc(req.params.id);
    
    const doc = await appointmentRef.get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Verify ownership
    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await appointmentRef.update({
      receiptBase64,
      status: 'pending_verification',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({
      success: true,
      message: 'Receipt uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload receipt',
      error: error.message
    });
  }
});

module.exports = router;
