const User = require('../models/User');

exports.getAllUsers = async () => {
  return await User.find().select('-password');
};

exports.updateUserById = async (userId, updateData) => {
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
  }).select('-password');

  if (!updatedUser) throw new Error('User not found');
  return updatedUser;
};

exports.banUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  user.isBanned = true;
  await user.save();
};

exports.unbanUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  user.isBanned = false;
  await user.save();
};

exports.deleteUserById = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new Error('User not found');
};