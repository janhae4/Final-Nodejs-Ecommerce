const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const {userConnection} = require("../database/dbConnection");

const addressSchema = new mongoose.Schema({
  district: String,
  districtCode: String,
  fullAddress: String,
  province: String,
  provinceCode: String,
  street: String,
  ward: String,
  wardCode: String,
});

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    provider: { type: String, default: "local" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBanned: { type: Boolean, default: false },
    addresses: [addressSchema],
    loyaltyPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.provider !== 'local') return next(); 
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = userConnection.model("User", userSchema);
module.exports = User;
