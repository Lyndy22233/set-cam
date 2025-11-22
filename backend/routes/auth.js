const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebase');
const emailService = require('../services/emailService');

// Complete backend registration (creates user in Firebase Auth + Firestore)
router.post('/register-complete', async (req, res) => {
  try {
    const { email, password, name, phone, otp } = req.body;

    // Basic validation
    if (!email || !password || !name || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, name, and OTP are required'
      });
    }

    // Verify OTP first
    const otpDoc = await db.collection('otps').doc(email).get();

    if (!otpDoc.exists) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired'
      });
    }

    const otpData = otpDoc.data();

    // Check if OTP is expired
    if (new Date(otpData.expiresAt) < new Date()) {
      await db.collection('otps').doc(email).delete();
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check if OTP matches
    if (otpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if purpose is registration
    if (otpData.purpose !== 'registration') {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP purpose'
      });
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: true // Mark as verified since OTP was verified
    });

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      name,
      email,
      phone: phone || '',
      role: 'user',
      createdAt: new Date().toISOString(),
      emailVerified: true
    });

    // Delete OTP record
    await db.collection('otps').doc(email).delete();

    // Create custom token for immediate login
    const customToken = await auth.createCustomToken(userRecord.uid);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      customToken,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message
    });
  }
});

// Register user (legacy endpoint)
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Create user in Firebase Auth (handled on client side)
    // This endpoint is mainly for additional backend operations if needed
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message
    });
  }
});

// Verify token (optional, for additional validation)
router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decodedToken = await auth.verifyIdToken(token);
    
    res.status(200).json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email
      }
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.message
    });
  }
});

// Send OTP for registration or password reset
router.post('/send-otp', async (req, res) => {
  try {
    const { email, purpose } = req.body; // purpose: 'registration' or 'password-reset'

    if (!email || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Email and purpose are required'
      });
    }

    // Generate OTP
    const otp = emailService.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in Firestore
    await db.collection('otps').doc(email).set({
      otp,
      purpose,
      email,
      expiresAt: expiresAt.toISOString(),
      verified: false,
      createdAt: new Date().toISOString()
    });

    // Send OTP email
    const emailResult = await emailService.sendOTP(email, otp, purpose);

    // Log OTP to console for development when email is not configured
    if (emailResult.skipped) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 OTP CODE FOR', email);
      console.log('🔢 CODE:', otp);
      console.log('⏰ EXPIRES:', new Date(Date.now() + 10 * 60 * 1000).toLocaleString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    res.status(200).json({
      success: true,
      emailSent: !emailResult.skipped,
      message: 'OTP sent successfully to your email'
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Get OTP from Firestore
    const otpDoc = await db.collection('otps').doc(email).get();

    if (!otpDoc.exists) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired'
      });
    }

    const otpData = otpDoc.data();

    // Check if OTP is expired
    if (new Date(otpData.expiresAt) < new Date()) {
      await db.collection('otps').doc(email).delete();
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check if OTP matches
    if (otpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Mark OTP as verified
    await db.collection('otps').doc(email).update({
      verified: true,
      verifiedAt: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
});

// Reset password (after OTP verification)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required'
      });
    }

    // Check if OTP was verified
    const otpDoc = await db.collection('otps').doc(email).get();

    if (!otpDoc.exists || !otpDoc.data().verified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify OTP first'
      });
    }

    // Get user by email
    const userRecord = await auth.getUserByEmail(email);

    // Update password
    await auth.updateUser(userRecord.uid, {
      password: newPassword
    });

    // Delete OTP record
    await db.collection('otps').doc(email).delete();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
});

module.exports = router;
