# Node.js Authentication API

A secure authentication API built with Node.js, Express, and JWT tokens.

## Features

- User registration
- User login/logout
- JWT token authentication
- Password hashing with bcrypt
- Input validation
- Rate limiting
- Security headers
- Swagger UI documentation

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/gamecard
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
```

3. Start the server:
```bash
npm run dev
```

4. Open Swagger UI for API testing:
```
http://localhost:3000/api-docs
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `PUT /api/auth/change-password` - Change password (protected)

### Documentation
- `GET /api-docs` - Swagger UI documentation
- `GET /health` - Health check

## Testing with Swagger UI

1. Open http://localhost:3000/api-docs
2. Register a new user
3. Copy the JWT token from response
4. Click "Authorize" and paste the token
5. Test protected endpoints
