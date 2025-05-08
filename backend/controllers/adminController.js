const User = require('../models/User');

// Lấy tất cả users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // bỏ password khi trả về
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update thông tin user
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ban user
exports.banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isBanned = true;
    await user.save();

    res.json({ message: 'User has been banned.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unban user
exports.unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isBanned = false;
    await user.save();

    res.json({ message: 'User has been unbanned.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
