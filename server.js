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

// Dynamic CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173', // Vite default
  'http://localhost:5000', // React default
];

// Add production URLs if available
if (process.env.NODE_ENV === 'production') {
  if (process.env.RENDER_EXTERNAL_URL) {
    allowedOrigins.push(process.env.RENDER_EXTERNAL_URL);
  }
  if (process.env.VERCEL_URL) {
    allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
  }
  if (process.env.NETLIFY_URL) {
    allowedOrigins.push(process.env.NETLIFY_URL);
  }
  if (process.env.HEROKU_APP_NAME) {
    allowedOrigins.push(`https://${process.env.HEROKU_APP_NAME}.herokuapp.com`);
  }
}

// Remove undefined values
const filteredOrigins = allowedOrigins.filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (filteredOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Cookie parser middleware
app.use(cookieParser());

// Trust proxy for production deployments
app.set('trust proxy', 1);

// Handle preflight requests
app.options('*', cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
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
  customSiteTitle: 'GameCard API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    tryItOutEnabled: true,
    requestInterceptor: (request) => {
      // Auto detect current domain for requests
      if (request.url && !request.url.startsWith('http')) {
        request.url = window.location.origin + request.url;
      }
      return request;
    }
  }
}));

// Root route với thông tin hữu ích
app.get('/', (req, res) => {
  const currentUrl = `${req.protocol}://${req.get('host')}`;
  res.json({
    success: true,
    message: 'GameCard API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    api_documentation: `${currentUrl}/api-docs`,
    endpoints: {
      health: `${currentUrl}/health`,
      auth: `${currentUrl}/api/auth`,
      cards: `${currentUrl}/api/cards`,
      documentation: `${currentUrl}/api-docs`
    },
    availableRoutes: {
      'POST /api/auth/register': 'Đăng ký tài khoản',
      'POST /api/auth/login': 'Đăng nhập',
      'POST /api/auth/logout': 'Đăng xuất',
      'GET /api/cards': 'Lấy danh sách thẻ bài',
      'POST /api/cards': 'Tạo thẻ bài mới',
      'GET /health': 'Kiểm tra trạng thái server'
    },
    environment: process.env.NODE_ENV || 'development',
    platform: {
      render: process.env.RENDER_EXTERNAL_URL,
      vercel: process.env.VERCEL_URL,
      netlify: process.env.NETLIFY_URL,
      heroku: process.env.HEROKU_APP_NAME
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cards', gameCardRoutes);

// Debug CORS endpoint
app.get('/debug/cors', (req, res) => {
  res.json({
    success: true,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent'],
    method: req.method,
    headers: {
      'origin': req.headers.origin,
      'referer': req.headers.referer,
      'host': req.headers.host,
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-forwarded-proto': req.headers['x-forwarded-proto']
    },
    allowedOrigins: filteredOrigins,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

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
  const currentUrl = `${req.protocol}://${req.get('host')}`;
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    server_url: currentUrl,
    api_documentation: `${currentUrl}/api-docs`,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
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
  const serverUrl = process.env.NODE_ENV === 'production' 
    ? (process.env.RENDER_EXTERNAL_URL || 
       process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
       process.env.NETLIFY_URL ||
       (process.env.HEROKU_APP_NAME ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com` : `http://localhost:${PORT}`))
    : `http://localhost:${PORT}`;
    
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`� Server URL: ${serverUrl}`);
  console.log(`�📚 API Documentation: ${serverUrl}/api-docs`);
  console.log(`🔗 Health Check: ${serverUrl}/health`);
  console.log(`🐛 Debug CORS: ${serverUrl}/debug/cors`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log('🌐 Platform detection:');
    if (process.env.RENDER_EXTERNAL_URL) console.log('  - Render detected');
    if (process.env.VERCEL_URL) console.log('  - Vercel detected');
    if (process.env.NETLIFY_URL) console.log('  - Netlify detected');
    if (process.env.HEROKU_APP_NAME) console.log('  - Heroku detected');
  }
});
