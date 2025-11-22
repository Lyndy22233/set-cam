const { admin } = require('../config/firebase');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Check if user has admin claim
    const user = await admin.auth().getUser(req.user.uid);
    if (user.customClaims && user.customClaims.admin) {
      next();
    } else {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied' 
    });
  }
};

module.exports = { authMiddleware, adminMiddleware };
