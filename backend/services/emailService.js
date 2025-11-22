const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email templates
const templates = {
  bookingConfirmation: (appointment) => ({
    subject: 'Appointment Booking Confirmation - SET CAM',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #DC143C; color: white; padding: 20px; text-align: center;">
          <h1>Appointment Confirmed!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <p>Hello <strong>${appointment.userName}</strong>,</p>
          <p>Your smoke emission test appointment has been successfully booked.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #DC143C;">Appointment Details:</h3>
            <p><strong>Service:</strong> ${appointment.serviceName}</p>
            <p><strong>Date:</strong> ${appointment.appointmentDate}</p>
            <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
            <p><strong>Vehicle:</strong> ${appointment.vehicleInfo.make} ${appointment.vehicleInfo.model} (${appointment.vehicleInfo.plateNumber})</p>
            <p><strong>Amount:</strong> ₱${appointment.paymentDetails.amount}</p>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Upload your payment receipt (if not done yet)</li>
            <li>Wait for admin approval</li>
            <li>Visit our center on your scheduled date</li>
          </ol>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    `
  }),

  appointmentApproved: (appointment) => ({
    subject: 'Appointment Approved - SET CAM',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10B981; color: white; padding: 20px; text-align: center;">
          <h1>✓ Appointment Approved!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <p>Good news, <strong>${appointment.userName}</strong>!</p>
          <p>Your payment has been verified and your appointment has been approved.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #10B981;">Appointment Schedule:</h3>
            <p><strong>Date:</strong> ${appointment.appointmentDate}</p>
            <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
            <p><strong>Service:</strong> ${appointment.serviceName}</p>
          </div>
          
          <p><strong>What to bring:</strong></p>
          <ul>
            <li>Vehicle Registration (OR/CR)</li>
            <li>Valid ID</li>
            <li>Payment receipt</li>
          </ul>
          
          <p>We look forward to serving you!</p>
        </div>
      </div>
    `
  }),

  appointmentRejected: (appointment, reason) => ({
    subject: 'Appointment Payment Issue - SET CAM',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #EF4444; color: white; padding: 20px; text-align: center;">
          <h1>Payment Verification Issue</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <p>Hello <strong>${appointment.userName}</strong>,</p>
          <p>Unfortunately, we were unable to verify your payment for the following appointment:</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Service:</strong> ${appointment.serviceName}</p>
            <p><strong>Date:</strong> ${appointment.appointmentDate}</p>
            <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
          </div>
          
          <div style="background: #FEE2E2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #991B1B;"><strong>Reason:</strong> ${reason}</p>
          </div>
          
          <p><strong>What to do next:</strong></p>
          <p>Please upload a clear and valid payment receipt, or contact us for assistance.</p>
        </div>
      </div>
    `
  }),

  testCompleted: (appointment, result) => ({
    subject: 'Emission Test Results Available - SET CAM',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #6B21A8; color: white; padding: 20px; text-align: center;">
          <h1>Test Results Ready</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <p>Hello <strong>${appointment.userName}</strong>,</p>
          <p>Your vehicle emission test has been completed.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Test Results:</h3>
            <p><strong>Vehicle:</strong> ${appointment.vehicleInfo.plateNumber}</p>
            <p><strong>CO2 Level:</strong> ${result.co2Level} ppm</p>
            <p><strong>Smoke Opacity:</strong> ${result.smokeOpacity}%</p>
            <p><strong>Result:</strong> <span style="color: ${result.isPassed ? '#10B981' : '#EF4444'}; font-weight: bold;">
              ${result.isPassed ? 'PASSED' : 'FAILED'}
            </span></p>
            ${result.remarks ? `<p><strong>Remarks:</strong> ${result.remarks}</p>` : ''}
          </div>
          
          <p>You can view and print your certificate by logging into your account.</p>
        </div>
      </div>
    `
  }),

  appointmentReminder: (appointment) => ({
    subject: 'Appointment Reminder - Tomorrow - SET CAM',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #F59E0B; color: white; padding: 20px; text-align: center;">
          <h1>⏰ Appointment Reminder</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <p>Hello <strong>${appointment.userName}</strong>,</p>
          <p>This is a reminder that you have an appointment scheduled for <strong>tomorrow</strong>.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Your Appointment:</h3>
            <p><strong>Date:</strong> ${appointment.appointmentDate}</p>
            <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
            <p><strong>Service:</strong> ${appointment.serviceName}</p>
            <p><strong>Vehicle:</strong> ${appointment.vehicleInfo.plateNumber}</p>
          </div>
          
          <p>See you tomorrow!</p>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email not configured. Would send:', template.subject);
      return { success: true, message: 'Email service not configured' };
    }

    await transporter.sendMail({
      from: `"SET CAM" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html
    });

    console.log('Email sent successfully to:', to);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// OTP Email Template
const otpTemplate = (otp, purpose) => ({
  subject: `Your OTP Code - SET CAM`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #DC143C; color: white; padding: 20px; text-align: center;">
        <h1>Verification Code</h1>
      </div>
      <div style="padding: 20px; background: #f9f9f9;">
        <p>Hello,</p>
        <p>Your OTP code for ${purpose === 'registration' ? 'account registration' : 'password reset'} is:</p>
        
        <div style="background: white; padding: 30px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #DC143C; font-size: 48px; letter-spacing: 10px; margin: 0;">${otp}</h1>
        </div>
        
        <p><strong>This code will expire in 10 minutes.</strong></p>
        <p>If you didn't request this code, please ignore this email.</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    </div>
  `
});

// Exported functions
const emailService = {
  generateOTP,
  
  sendOTP: async (userEmail, otp, purpose) => {
    const template = otpTemplate(otp, purpose);
    return await sendEmail(userEmail, template);
  },

  sendBookingConfirmation: async (userEmail, appointment) => {
    const template = templates.bookingConfirmation(appointment);
    return await sendEmail(userEmail, template);
  },

  sendApprovalEmail: async (userEmail, appointment) => {
    const template = templates.appointmentApproved(appointment);
    return await sendEmail(userEmail, template);
  },

  sendRejectionEmail: async (userEmail, appointment, reason) => {
    const template = templates.appointmentRejected(appointment, reason);
    return await sendEmail(userEmail, template);
  },

  sendTestCompletedEmail: async (userEmail, appointment, result) => {
    const template = templates.testCompleted(appointment, result);
    return await sendEmail(userEmail, template);
  },

  sendReminderEmail: async (userEmail, appointment) => {
    const template = templates.appointmentReminder(appointment);
    return await sendEmail(userEmail, template);
  }
};

module.exports = emailService;
