const adminService = require('../services/adminService');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await adminService.updateUserById(req.params.userId, req.body);
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(error.message === 'User not found' ? 404 : 500).json({ message: error.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    await adminService.banUserById(req.params.userId);
    res.json({ message: 'User has been banned.' });
  } catch (error) {
    res.status(error.message === 'User not found' ? 404 : 500).json({ message: error.message });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    await adminService.unbanUserById(req.params.userId);
    res.json({ message: 'User has been unbanned.' });
  } catch (error) {
    res.status(error.message === 'User not found' ? 404 : 500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await adminService.deleteUserById(req.params.userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(error.message === 'User not found' ? 404 : 500).json({ message: error.message });
  }
};
