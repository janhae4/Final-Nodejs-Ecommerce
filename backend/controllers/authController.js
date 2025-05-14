const authService = require('../services/authService');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../services/authService');


exports.register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);

    // Tạo token ngay sau khi người dùng đã được tạo thành công
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Kiểm tra xem token có được tạo đúng không
    console.log("Token generated:", token);

    // Gửi token qua cookie
    res.cookie("token", token, {
      httpOnly: false,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // Cookie sống 1 ngày
    });

    res.status(201).json({ message: "Đăng ký thành công", user, token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.login = async (req, res) => {
  try {
    const user = await authService.loginUser(req.body, res);
    res.json({ user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.json({ message: "Logged out successfully" });
};

exports.changePassword = async (req, res) => {
  console.log('---- CHANGE PASSWORD REQUEST ----');
  console.log('req.user:', req.user); // kiểm tra thông tin user từ token
  console.log('req.body:', req.body); // kiểm tra dữ liệu gửi lên
  const { oldPassword, newPassword } = req.body;
  try {
    await authService.changeUserPassword(req.user.id, oldPassword, newPassword);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Google callback route
exports.googleCallback = async (req, res) => {
  try {
    const { token, encodedUser } = await authService.handleGoogleCallback(req.user);

    // ✅ Chuyển hướng về trang chủ kèm token và user
    res.redirect(`http://localhost:5173/?token=${token}&user=${encodedUser}`);
  } catch (error) {
    console.error("Error in googleCallback:", error);
    res.redirect("http://localhost:5173/login?error=oauth_failed");
  }
};

// Facebook callback route
exports.facebookCallback = async (req, res) => {
  try {
    const { token, encodedUser } = await authService.handleFacebookCallback(req.user);

    res.redirect(`http://localhost:5173/?token=${token}&user=${encodedUser}`);
  } catch (error) {
    console.error("Facebook login error:", error);
    res.status(500).json({ message: "Đăng nhập với Facebook thất bại" });
  }
};
