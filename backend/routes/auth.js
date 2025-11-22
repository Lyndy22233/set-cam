const express = require('express');
const router = express.Router();
const { auth } = require('../config/firebase');

// Register user
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

module.exports = router;
