const jwt = require('jsonwebtoken');

const generateTokens = (userId, tokenVersion = 0) => {
  const payload = {
    userId,
    tokenVersion,
    iat: Math.floor(Date.now() / 1000)
  };

  // Access token ngắn hạn (15 phút)
  const accessToken = jwt.sign(
    { ...payload, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Refresh token (1 ngày)
  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return { accessToken, refreshToken };
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('TOKEN_EXPIRED');
    }
    throw new Error('INVALID_TOKEN');
  }
};

// Cookie options cho refresh token
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  path: '/'
});

module.exports = {
  generateTokens,
  verifyToken,
  getCookieOptions
};
