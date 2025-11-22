const nodemailer = require('nodemailer');
const axios = require('axios');

// Check if Brevo API key is configured
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@set-cam.com';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'SET CAM';

if (BREVO_API_KEY) {
  console.log('✓ Brevo API configured for email sending');
} else {
  console.log('⚠️ Brevo API not configured - OTP codes will be logged to console');
}

// Fallback: SMTP transporter (only if Brevo API not available)
let transporter = null;
if (!BREVO_API_KEY && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000
  });
  console.log('✓ Email transporter configured with SMTP (fallback)');
}

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

// Send email via Brevo API
const sendViaBrevoAPI = async (to, template) => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: BREVO_SENDER_NAME,
          email: BREVO_SENDER_EMAIL
        },
        to: [{ email: to }],
        subject: template.subject,
        htmlContent: template.html
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✓ Email sent via Brevo API to:', to);
    return { success: true, emailSent: true, messageId: response.data.messageId };
  } catch (error) {
    console.error('✗ Brevo API error:', error.response?.data || error.message);
    throw error;
  }
};

// Send email via SMTP (fallback)
const sendViaSMTP = async (to, template) => {
  try {
    const sendMailPromise = transporter.sendMail({
      from: `"${BREVO_SENDER_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email send timeout')), 6000);
    });

    await Promise.race([sendMailPromise, timeoutPromise]);

    console.log('✓ Email sent via SMTP to:', to);
    return { success: true, emailSent: true };
  } catch (error) {
    console.error('✗ SMTP error:', error.message);
    throw error;
  }
};

// Main send email function
const sendEmail = async (to, template) => {
  // Try Brevo API first
  if (BREVO_API_KEY) {
    try {
      return await sendViaBrevoAPI(to, template);
    } catch (error) {
      console.error('Brevo API failed');
      if (transporter) {
        try {
          return await sendViaSMTP(to, template);
        } catch (smtpError) {
          return { success: true, error: smtpError.message, skipped: true, emailSent: false };
        }
      }
      return { success: true, error: error.message, skipped: true, emailSent: false };
    }
  }

  // Try SMTP if Brevo not configured
  if (transporter) {
    try {
      return await sendViaSMTP(to, template);
    } catch (error) {
      return { success: true, error: error.message, skipped: true, emailSent: false };
    }
  }

  // No email service configured
  console.log('⚠️ No email service configured');
  console.log('📧 To:', to);
  console.log('📝 Subject:', template.subject);
  return { success: true, message: 'No email service configured', skipped: true, emailSent: false };
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
