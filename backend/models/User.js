const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
}, { timestamps: true });

const userLoginHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  token:{
    type: String,
    required: true
  },
  status:{
    type: Number,
    enum: [1, 0],
    default: 1
  }
});

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    return resetToken;
};

module.exports = {
  User: mongoose.model('User', userSchema),
  UserLoginHistory: mongoose.model('UserLoginHistory', userLoginHistorySchema)
};
