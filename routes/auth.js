const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  logout,
  logoutAllDevices,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth routes
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             username: "gameuser2024"
 *             email: "user@gamecard.com"
 *             password: "Password123"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       429:
 *         description: Quá nhiều yêu cầu
 */
// Public routes
// Root auth route for testing
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Auth API endpoints',
    availableEndpoints: {
      'POST /register': 'Đăng ký tài khoản',
      'POST /login': 'Đăng nhập',
      'POST /refresh': 'Làm mới token',
      'POST /logout': 'Đăng xuất (cần auth)',
      'POST /logout-all': 'Đăng xuất tất cả thiết bị (cần auth)',
      'GET /profile': 'Xem thông tin cá nhân (cần auth)',
      'PUT /profile': 'Cập nhật thông tin (cần auth)',
      'PUT /change-password': 'Đổi mật khẩu (cần auth)'
    }
  });
});

router.post('/register', authLimiter, validate(registerSchema), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "user@gamecard.com"
 *             password: "Password123"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         headers:
 *           Set-Cookie:
 *             description: Refresh token được set trong httpOnly cookie
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Email hoặc mật khẩu không đúng
 *       429:
 *         description: Quá nhiều lần đăng nhập thất bại
 */
router.post('/login', loginLimiter, validate(loginSchema), login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     description: Lấy access token mới bằng refresh token từ cookie
 *     responses:
 *       200:
 *         description: Token được refresh thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     expiresIn:
 *                       type: string
 *                       example: "15m"
 *       401:
 *         description: Refresh token không hợp lệ hoặc hết hạn
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *       401:
 *         description: Token không hợp lệ
 */
router.post('/logout', authMiddleware, logout);

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: Đăng xuất tất cả thiết bị
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất tất cả thiết bị thành công
 *       401:
 *         description: Token không hợp lệ
 */
router.post('/logout-all', authMiddleware, logoutAllDevices);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Xem thông tin cá nhân
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
 *       401:
 *         description: Token không hợp lệ
 */
router.get('/profile', authMiddleware, getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Cập nhật thông tin cá nhân
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "newusername"
 *               profile:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                     example: "John"
 *                   lastName:
 *                     type: string
 *                     example: "Doe"
 *                   bio:
 *                     type: string
 *                     example: "GameCard player"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       401:
 *         description: Token không hợp lệ
 */
router.put('/profile', authMiddleware, updateProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Đổi mật khẩu
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "Password123"
 *               newPassword:
 *                 type: string
 *                 example: "NewPassword456"
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       400:
 *         description: Mật khẩu hiện tại không đúng
 *       401:
 *         description: Token không hợp lệ
 */
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
