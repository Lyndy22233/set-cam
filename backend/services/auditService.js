const { db, admin } = require('../config/firebase');

const auditService = {
  async log(adminId, adminEmail, action, targetType, targetId, details = {}) {
    try {
      const auditLog = {
        adminId,
        adminEmail,
        action, // 'approved_appointment', 'rejected_appointment', 'entered_results', 'created_service', etc.
        targetType, // 'appointment', 'service', 'user'
        targetId,
        details,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('auditLogs').add(auditLog);
      console.log('Audit log created:', action);
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  }
};

module.exports = auditService;
