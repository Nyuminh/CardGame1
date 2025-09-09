const User = require('../models/User');
const { generateTokens, getCookieOptions } = require('../utils/jwt');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Create user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.tokenVersion);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        },
        accessToken,
        expiresIn: '15m'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email và include password
    const user = await User.findOne({ email, isActive: true }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Validate password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.tokenVersion);

    // Update last login
    await user.updateLastLogin();

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          lastLogin: user.lastLogin
        },
        accessToken,
        expiresIn: '15m'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    const user = req.user;
    
    // IMPORTANT: Tăng tokenVersion để invalidate tất cả tokens của user này
    user.tokenVersion += 1;
    await user.save();
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout from all devices
// @route   POST /api/auth/logout-all
// @access  Private
const logoutAllDevices = async (req, res, next) => {
  try {
    const user = req.user;

    // Invalidate tất cả tokens
    await user.invalidateAllTokens();
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logged out from all devices'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (với refresh token)
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found'
      });
    }

    const { verifyToken } = require('../utils/jwt');
    const decoded = verifyToken(refreshToken);

    // Check token type
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Check tokenVersion
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Token has been invalidated'
      });
    }

    // IMPORTANT: Tăng tokenVersion để invalidate tất cả tokens cũ
    user.tokenVersion += 1;
    await user.save();

    // Generate new tokens với tokenVersion mới
    const tokens = generateTokens(user._id, user.tokenVersion);

    // Update refresh token cookie
    res.cookie('refreshToken', tokens.refreshToken, getCookieOptions());

    res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        expiresIn: '15m'
      }
    });

  } catch (error) {
    // Clear invalid cookie
    res.clearCookie('refreshToken');
    
    if (error.message === 'TOKEN_EXPIRED') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired, please login again',
        code: 'REFRESH_EXPIRED'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          profile: user.profile,
          gameStats: user.gameStats,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { username, profile } = req.body;

    // Update allowed fields
    if (username) {
      user.username = username;
    }
    
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profile: user.profile,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;

    // Get user với password để validate
    const userWithPassword = await User.findById(user._id).select('+password');

    // Validate current password
    const isMatch = await userWithPassword.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    userWithPassword.password = newPassword;
    await userWithPassword.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  logoutAllDevices,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword
};
