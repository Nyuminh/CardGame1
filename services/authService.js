// Xử lý nghiệp vụ cho Auth
const userRepository = require('../repositories/userRepository');
const { generateTokens, getCookieOptions, verifyToken } = require('../utils/jwt');

const registerService = async ({ username, email, password }) => {
  const user = await userRepository.createUser({ username, email, password });
  const { accessToken, refreshToken } = generateTokens(user._id, user.tokenVersion);
  return { user, accessToken, refreshToken };
};

const loginService = async ({ email, password }) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) return { error: 'Invalid email or password' };
  const isMatch = await user.comparePassword(password);
  if (!isMatch) return { error: 'Invalid email or password' };
  await user.updateLastLogin();
  const { accessToken, refreshToken } = generateTokens(user._id, user.tokenVersion);
  return { user, accessToken, refreshToken };
};

const logoutService = async (user) => {
  user.tokenVersion += 1;
  await userRepository.updateUser(user);
};

const logoutAllDevicesService = async (user) => {
  await user.invalidateAllTokens();
};

const refreshTokenService = async (refreshTokenValue) => {
  if (!refreshTokenValue) return { error: 'Refresh token not found' };
  const decoded = verifyToken(refreshTokenValue);
  if (decoded.type !== 'refresh') return { error: 'Invalid token type' };
  const user = await userRepository.findUserById(decoded.userId);
  if (!user || !user.isActive) return { error: 'User not found or inactive' };
  if (decoded.tokenVersion !== user.tokenVersion) return { error: 'Token has been invalidated' };
  user.tokenVersion += 1;
  await userRepository.updateUser(user);
  const tokens = generateTokens(user._id, user.tokenVersion);
  return { tokens };
};

const getProfileService = (user) => {
  return user;
};

const updateProfileService = async (user, { username, profile }) => {
  if (username) user.username = username;
  if (profile) user.profile = { ...user.profile, ...profile };
  await userRepository.updateUser(user);
  return user;
};

const changePasswordService = async (user, { currentPassword, newPassword }) => {
  const userWithPassword = await userRepository.findUserById(user._id);
  if (!userWithPassword) return { error: 'User not found' };
  const isMatch = await userWithPassword.comparePassword(currentPassword);
  if (!isMatch) return { error: 'Current password is incorrect' };
  userWithPassword.password = newPassword;
  await userRepository.updateUser(userWithPassword);
  return {};
};

module.exports = {
  registerService,
  loginService,
  logoutService,
  logoutAllDevicesService,
  refreshTokenService,
  getProfileService,
  updateProfileService,
  changePasswordService
};
