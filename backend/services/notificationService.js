const { db, admin } = require('../config/firebase');

const notificationService = {
  // Create a notification
  async createNotification(userId, type, message, appointmentId = null) {
    try {
      const notificationData = {
        userId,
        type, // 'approved', 'rejected', 'completed', 'reminder'
        message,
        appointmentId,
        read: false,
        deleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('notifications').add(notificationData);
      console.log('Notification created for user:', userId);
      return { success: true };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Notification templates
  templates: {
    appointmentApproved: (serviceName, date, time) => 
      `Your appointment for ${serviceName} on ${date} at ${time} has been approved!`,
    
    appointmentRejected: (serviceName, reason) => 
      `Your appointment for ${serviceName} was rejected. Reason: ${reason}`,
    
    testCompleted: (vehiclePlate, isPassed) => 
      `Test results for vehicle ${vehiclePlate} are ready. Status: ${isPassed ? 'PASSED' : 'FAILED'}`,
    
    appointmentReminder: (serviceName, date, time) => 
      `Reminder: You have an appointment tomorrow for ${serviceName} at ${time}`
  }
};

module.exports = notificationService;
