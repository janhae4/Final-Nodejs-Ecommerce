const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userConnection = require('../database/userConnection');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },  // Không yêu cầu password khi login qua Google
  provider: { type: String, default: 'local' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isBanned: { type: Boolean, default: false },
  addresses: [{
    street: String,
    city: String,
    zipCode: String
  }]
}, { timestamps: true });

// Nếu người dùng đăng ký qua email (local), mã hóa password trước khi lưu
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.provider !== 'local') return next(); // Không mã hóa password khi đăng nhập qua Google
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = userConnection.model('User', userSchema);
module.exports = User;
