const { getCookieOptions } = require('../utils/jwt');
const authService = require('../services/authService');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.registerService({ username, email, password });
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
    const result = await authService.loginService({ email, password });
    if (result.error) {
      return res.status(401).json({
        success: false,
        message: result.error
      });
    }
    const { user, accessToken, refreshToken } = result;
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
    await authService.logoutService(user);
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
    await authService.logoutAllDevicesService(user);
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
    const { refreshToken: refreshTokenValue } = req.cookies;
    const result = await authService.refreshTokenService(refreshTokenValue);
    if (result.error) {
      return res.status(401).json({
        success: false,
        message: result.error
      });
    }
    const { tokens } = result;
    res.cookie('refreshToken', tokens.refreshToken, getCookieOptions());
    res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        expiresIn: '15m'
      }
    });
  } catch (error) {
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
    const user = authService.getProfileService(req.user);
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
    const user = await authService.updateProfileService(req.user, req.body);
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
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePasswordService(req.user, { currentPassword, newPassword });
    if (result && result.error) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
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
