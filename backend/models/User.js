const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { userConnection } = require("../database/dbConnection");

const addressSchema = new mongoose.Schema({
  district: String,
  districtCode: String,
  fullAddress: String,
  province: String,
  provinceCode: String,
  street: String,
  ward: String,
  wardCode: String,
  _id: { type: String, default: Date.now() },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    provider: { type: String, default: "local" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBanned: { type: Boolean, default: false },
    addresses: [addressSchema],
    loyaltyPoints: { type: Number, default: 0 },
    isDefaultPassword: { type: Boolean, default: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.provider !== "local") return next();
  try {
    if (this.isModified("password") || this.isNew) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (err) {
    next(err);
  }
});

const User = userConnection.model("User", userSchema);
module.exports = User;
