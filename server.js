const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { specs, swaggerUi } = require('./config/swagger');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const gameCardRoutes = require('./routes/gameCard');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true // Để gửi cookies
}));

// Cookie parser middleware
app.use(cookieParser());

app.set('trust proxy', 1);
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from images directory
app.use('/images', express.static(path.join(__dirname, 'images')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  console.log('📊 Database:', mongoose.connection.db.databaseName);
  console.log('🌐 Host:', mongoose.connection.host);
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  if (err.message.includes('authentication failed')) {
    console.error('🔑 Kiểm tra username/password trong .env file');
  }
  process.exit(1);
});

// Swagger UI - đổi sang /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'GameCard API Documentation'
}));

// Root route với thông tin hữu ích
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GameCard API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      cards: '/api/cards',
      documentation: '/api-docs'
    },
    availableRoutes: {
      'POST /api/auth/register': 'Đăng ký tài khoản',
      'POST /api/auth/login': 'Đăng nhập',
      'POST /api/auth/logout': 'Đăng xuất',
      'GET /api/cards': 'Lấy danh sách thẻ bài',
      'POST /api/cards': 'Tạo thẻ bài mới',
      'GET /health': 'Kiểm tra trạng thái server'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cards', gameCardRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Kiểm tra trạng thái server
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server đang hoạt động
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Server is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
});
