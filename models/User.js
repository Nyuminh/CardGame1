const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  // Token version để invalidate tất cả tokens
  tokenVersion: {
    type: Number,
    default: 0
  },
  // Profile cho GameCard
  profile: {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    avatar: { type: String },
    bio: { type: String, maxlength: 500 }
  },
  // Game stats
  gameStats: {
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    level: { type: Number, default: 1 }
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.tokenVersion;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes để tối ưu performance
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ username: 1, isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password với salt rounds từ env
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save();
};

// Invalidate tất cả tokens của user (force logout all devices)
userSchema.methods.invalidateAllTokens = async function() {
  this.tokenVersion += 1;
  await this.save();
};

// Get user's win rate
userSchema.methods.getWinRate = function() {
  if (this.gameStats.gamesPlayed === 0) return 0;
  return (this.gameStats.gamesWon / this.gameStats.gamesPlayed * 100).toFixed(2);
};

module.exports = mongoose.model('User', userSchema);
