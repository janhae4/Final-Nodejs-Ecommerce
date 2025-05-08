const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Đường dẫn tới model User

exports.authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Lấy user từ DB theo id trong token
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;  // gán toàn bộ user (có role, email, ...)
    console.log('Decoded token:', decoded);
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token is not valid' });
  }
};
