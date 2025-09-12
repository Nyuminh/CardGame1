// Xử lý truy xuất dữ liệu cho User
const User = require('../models/User');

const createUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

const findUserByEmail = async (email) => {
  return await User.findOne({ email, isActive: true }).select('+password');
};

const findUserById = async (id) => {
  return await User.findById(id);
};

const updateUser = async (user) => {
  return await user.save();
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser
};
