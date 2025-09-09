const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    try {
      // Verify the token
      const decoded = verifyToken(token);
      
      // Check token type
      if (decoded.type !== 'access') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token type'
        });
      }
      
      // Find the user
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user not found'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      // Check tokenVersion để có thể invalidate tất cả tokens
      if (decoded.tokenVersion !== user.tokenVersion) {
        return res.status(401).json({
          success: false,
          message: 'Token has been invalidated',
          code: 'TOKEN_INVALIDATED'
        });
      }

      // Add user to request object
      req.user = user;
      req.token = token;
      
      next();
    } catch (jwtError) {
      if (jwtError.message === 'TOKEN_EXPIRED') {
        return res.status(401).json({
          success: false,
          message: 'Access token expired',
          code: 'TOKEN_EXPIRED'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

module.exports = authMiddleware;
