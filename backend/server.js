const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Request timeout middleware (15 seconds)
app.use((req, res, next) => {
  req.setTimeout(15000);
  res.setTimeout(15000);
  next();
});

// Routes
const appointmentRoutes = require('./routes/appointments');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const serviceRoutes = require('./routes/services');
const settingsRoutes = require('./routes/settings');

app.use('/api/appointments', appointmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Health check with Firebase test
app.get('/api/health/full', async (req, res) => {
  const health = {
    server: 'OK',
    firebase: 'Unknown',
    smtp: 'Not configured',
    timestamp: new Date().toISOString()
  };

  try {
    const { db } = require('./config/firebase');
    // Try to access Firestore
    await db.collection('_health_check').limit(1).get();
    health.firebase = 'Connected';
  } catch (error) {
    health.firebase = 'Error: ' + error.message;
  }

  // Check SMTP configuration
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    health.smtp = {
      configured: true,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER
    };
  }

  res.status(200).json(health);
});

// Test SMTP endpoint
app.post('/api/test-smtp', async (req, res) => {
  try {
    const nodemailer = require('nodemailer');
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(400).json({
        success: false,
        message: 'SMTP not configured'
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });

    // Verify connection
    await transporter.verify();
    
    res.status(200).json({
      success: true,
      message: 'SMTP connection successful',
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'SMTP connection failed',
      error: error.message,
      code: error.code
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
