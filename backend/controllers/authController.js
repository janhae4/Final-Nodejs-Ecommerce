require("dotenv").config();
const jwt = require("jsonwebtoken");
const authService = require("../services/authService");


exports.register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ message: "Registration successful", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await authService.loginUser(req.body);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const message = await authService.forgotPassword(req.body.email);
    res.json({ message });
  } catch (error) {
    if (error.message === 'No user found with that email.') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const result = await authService.resetPassword(token, password);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    const statusCode = err.message === 'Token and password are required' ? 400 :
                      err.message === 'Invalid or expired token' ? 401 :
                      err.message === 'Token expired' ? 401 : 500;
    res.status(statusCode).json({ message: err.message });
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
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Missing old or new password" });
  }
  try {
    await authService.changeUserPassword(req.user.id, oldPassword, newPassword);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Error in changePassword:", err);
    res.status(400).json({ message: err.message });
  }
};

// Google callback route
 exports.googleCallback = async (req, res) => {
  try {
    const { token, encodedUser } = await authService.handleGoogleCallback(
      req.user
    );
    res.cookie("token", token, { httpOnly: true });
    // ✅ Chuyển hướng về trang chủ kèm token và user
    res.redirect(
      `http://localhost:5173/auth/oauth-success?user=${encodedUser}`
    );
  } catch (error) {
    console.error("Error in googleCallback:", error);
    res.redirect("http://localhost:5173/auth/login?error=oauth_failed");
  }
};

// Facebook callback route
exports.facebookCallback = async (req, res) => {
  try {
    const { token, encodedUser } = await authService.handleFacebookCallback(
      req.user
    );
    res.cookie("token", token, { httpOnly: true });
    res.redirect(
      `http://localhost:5173/auth/oauth-success?user=${encodedUser}`
    );
  } catch (error) {
    console.error("Facebook login error:", error);
    res.status(500).json({ message: "Đăng nhập với Facebook thất bại" });
  }
};

exports.logout = (req, res) => {
  res.cookie("token", "", { httpOnly: true }, { maxAge: 0 });
  res.status(200).json({ message: "Logout successful" });
};
