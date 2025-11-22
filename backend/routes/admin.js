const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');
const auditService = require('../services/auditService');

// Get all appointments (Admin only)
router.get('/appointments', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = db.collection('appointments');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.get();
    
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

// Approve appointment
router.patch('/appointments/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { emissionTestResult } = req.body;
    const appointmentRef = db.collection('appointments').doc(req.params.id);
    
    const doc = await appointmentRef.get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const appointmentData = doc.data();

    await appointmentRef.update({
      status: 'approved',
      emissionTestResult: emissionTestResult || null,
      approvedBy: req.user.uid,
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create notification
    const message = notificationService.templates.appointmentApproved(
      appointmentData.serviceName,
      appointmentData.appointmentDate,
      appointmentData.appointmentTime
    );
    await notificationService.createNotification(
      appointmentData.userId,
      'approved',
      message,
      req.params.id
    );

    // Send email
    await emailService.sendApprovalEmail(appointmentData.userEmail, {
      ...appointmentData,
      userName: appointmentData.userEmail.split('@')[0]
    });

    // Audit log
    await auditService.log(
      req.user.uid,
      req.user.email,
      'approved_appointment',
      'appointment',
      req.params.id,
      { serviceName: appointmentData.serviceName }
    );
    
    res.status(200).json({
      success: true,
      message: 'Appointment approved successfully'
    });
  } catch (error) {
    console.error('Error approving appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve appointment',
      error: error.message
    });
  }
});

// Reject appointment
router.patch('/appointments/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const appointmentRef = db.collection('appointments').doc(req.params.id);
    
    const doc = await appointmentRef.get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const appointmentData = doc.data();

    await appointmentRef.update({
      status: 'rejected',
      rejectionReason: reason,
      rejectedBy: req.user.uid,
      rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create notification
    const message = notificationService.templates.appointmentRejected(
      appointmentData.serviceName,
      reason
    );
    await notificationService.createNotification(
      appointmentData.userId,
      'rejected',
      message,
      req.params.id
    );

    // Send email
    await emailService.sendRejectionEmail(appointmentData.userEmail, {
      ...appointmentData,
      userName: appointmentData.userEmail.split('@')[0]
    }, reason);

    // Audit log
    await auditService.log(
      req.user.uid,
      req.user.email,
      'rejected_appointment',
      'appointment',
      req.params.id,
      { reason, serviceName: appointmentData.serviceName }
    );
    
    res.status(200).json({
      success: true,
      message: 'Appointment rejected'
    });
  } catch (error) {
    console.error('Error rejecting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject appointment',
      error: error.message
    });
  }
});

// Update emission test result
router.patch('/appointments/:id/result', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { emissionTestResult } = req.body;
    const appointmentRef = db.collection('appointments').doc(req.params.id);
    
    const doc = await appointmentRef.get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    await appointmentRef.update({
      emissionTestResult,
      status: 'completed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({
      success: true,
      message: 'Test result updated successfully'
    });
  } catch (error) {
    console.error('Error updating test result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update test result',
      error: error.message
    });
  }
});

// Get dashboard statistics
router.get('/dashboard/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const appointmentsSnapshot = await db.collection('appointments').get();
    
    let pending = 0, approved = 0, rejected = 0, completed = 0;
    
    appointmentsSnapshot.forEach(doc => {
      const status = doc.data().status;
      if (status === 'pending' || status === 'pending_verification') pending++;
      if (status === 'approved') approved++;
      if (status === 'rejected') rejected++;
      if (status === 'completed') completed++;
    });

    res.status(200).json({
      success: true,
      stats: {
        total: appointmentsSnapshot.size,
        pending,
        approved,
        rejected,
        completed
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

module.exports = router;
