const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

exports.authMiddleware = async (req, res, next) => {
  const token = req.cookies.token; // lấy token từ cookie

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;

    next(); 
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
