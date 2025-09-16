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

module.exports = {
  User: mongoose.model('User', userSchema),
  UserLoginHistory: mongoose.model('UserLoginHistory', userLoginHistorySchema)
};
