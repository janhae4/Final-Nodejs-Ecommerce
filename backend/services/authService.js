const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.registerUser = async ({ fullName, email, address, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email already exists");

  const newUser = new User({
    fullName,
    email,
    addresses: [address],
    provider: "local",
    role: role || "user",
  });
  if (password) {
  newUser.password = password;
  }
  await newUser.save();
  console.log("✅ New user registered:", newUser);
  return newUser;
};

exports.loginUser = async ({ email, password }, res) => {
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    // Tạo JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Gửi token qua HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true, // Giới hạn truy cập từ JavaScript
      secure: process.env.NODE_ENV === "production", // Chỉ sử dụng trên HTTPS khi production
      sameSite: "strict", // Cookie chỉ gửi theo cùng domain
      maxAge: 24 * 60 * 60 * 1000, // Thời gian sống cookie (24 giờ)
    });

    return user;  // Trả về thông tin user nếu cần
  } catch (error) {
    console.error("Login error:", error);
    throw error;  // Ném lỗi cho phía gọi API xử lý
  }
};


exports.changeUserPassword = async (userId, oldPassword, newPassword) => {
  console.log('---- PASSWORD SERVICE ----');
  console.log('userId:', userId);
  console.log('oldPassword:', oldPassword);
  console.log('newPassword:', newPassword);
  const user = await User.findById(userId);
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Old password is incorrect");
  
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
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
    user = await User.create({
      email,
      fullName,
      googleId,
      password: null, // Hoặc random nếu schema yêu cầu
      isSocial: true,
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
  // console.log("✅ Google user info:", user);
  const token = jwt.sign({ id: user._id, rold: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  // console.log("token google: ", token);
  const encodedUser = encodeURIComponent(JSON.stringify(user));

  return { token, encodedUser };
};

// Hàm xử lý Facebook callback
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
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};
