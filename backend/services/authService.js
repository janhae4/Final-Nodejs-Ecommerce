const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const rabbitService = require("./rabbitService");

const generateRandomPassword = () => {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters.charAt(randomIndex);
  }
  return password;
};

exports.registerUser = async (data) => {
  try {
    const { userInfo, address } = data;
    console.log("registerUser", data);
    const existingUser = await User.findOne({ email: userInfo.email });
    if (existingUser) throw new Error("Email already exists");

    if (!userInfo.password) {
      userInfo.password = generateRandomPassword();
    }

    const newUser = new User({
      fullName: userInfo.fullName,
      email: userInfo.email,
      password: userInfo.password,
      addresses: [address],
      provider: "local",
      role: userInfo.role || "user",
    });

    const savedUser = await newUser.save();
    await rabbitService.publishUserCreated(userInfo);
    return savedUser.toObject();
  } catch (error) {
    console.error("Error publishing events:", error);
  }
  return savedUser.toObject();
};

exports.loginUser = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    return user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("No user found with that email.");

  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 3600000; // 1 hour

  user.resetPasswordToken = token;
  user.resetPasswordExpires = expires;
  const savedUser = await user.save();

  const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
  await rabbitService.publishUserForgotPassword(
    { email: savedUser.email, fullName: savedUser.fullName },
    resetLink
  );

  return "Reset email sent successfully.";
};

exports.resetPassword = async (token, password) => {
  if (!token || !password) {
    throw new Error("Token and password are required");
  }

  try {
    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) {
      throw new Error("Invalid or expired token");
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < Date.now()) {
      throw new Error("Token expired");
    }

    // Gán password plaintext, middleware sẽ hash
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();
    console.log("User after save:", user); // Debug

    return { message: "Password reset successful" };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

exports.changeUserPassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  if (!user.password) {
    throw new Error("User does not have a password set");
  }

  if (oldPassword === newPassword) {
    throw new Error("New password cannot be the same as the old password");
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Old password is incorrect");

  
  return await user.save();
};

///////////////////////////////////
// Social login (Google/Facebook)
///////////////////////////////////

exports.googleLogin = async ({ email, fullName, googleId }) => {
  if (!email || !fullName || !googleId) {
    throw new Error("Missing fields from Google user");
  }

  let user = await User.findOne({ email });
  if (!user) {
    await this.registerUser({
      userInfo: {
        email,
        fullName,
      },
      address: {},
    });
  }
  return user;
};

exports.facebookLogin = async ({ email, fullName, facebookId }) => {
  if (!email || !fullName || !facebookId) {
    throw new Error("Missing fields from Facebook user");
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      fullName,
      facebookId,
      password: null,
      provider: "facebook",
      isSocial: true,
    });
  }

  return user;
};

exports.handleGoogleCallback = async (user) => {
  if (!user || !user.email || !user.fullName) {
    throw new Error("Missing required information from Google profile.");
  }
  const token = jwt.sign(
    { id: user._id, rold: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
  const encodedUser = encodeURIComponent(JSON.stringify(user));

  return { token, encodedUser };
};

exports.handleFacebookCallback = async (user) => {
  if (!user) {
    throw new Error("Không tìm thấy người dùng sau xác thực Facebook");
  }

  const token = generateToken(user);
  const encodedUser = encodeURIComponent(JSON.stringify(user));

  return { token, encodedUser };
};

exports.findOrCreateOAuthUser = async (profile, provider) => {
  const socialId = profile.id;
  const displayName = profile.displayName;

  let user = await User.findOne({ socialId });

  if (!user) {
    user = await User.create({
      name: displayName,
      socialId,
      provider,
    });
  }

  return user;
};

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

exports.addLoyaltyPoints = async (userId, points) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  user.loyaltyPoints += points;
  await user.save();
};
