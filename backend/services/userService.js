const User = require("../models/User");
const authService = require("./authService");
const bcrypt = require("bcrypt");

exports.findUserById = async (id) => await User.findById(id);
exports.findyUserByEmail = async (email) => await User.find({ email });
exports.createUser = async (user) => await User.create(user);
exports.createUserForGuest = async (user) => {
  const { email } = user;
  const u = await User.findOne({ email });
  if (u) return u;
  const { address, ...userInfo } = user;
  return await authService.registerUser({ userInfo, address });
};

exports.getProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("User not found");
  return user;
};

exports.updateProfile = async (userId, updateData) => {
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
  }).select("-password");
  if (!updatedUser) throw new Error("User not found");
  return updatedUser;
};
exports.changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  
  if (currentPassword === newPassword) {
    throw new Error("New password cannot be the same as the old password");
  }
  
  if (! await bcrypt.compare(currentPassword, user.password)) {
    throw new Error("Current password is incorrect");
  }
  user.isDefaultPassword = false;
  user.set('password', newPassword)
  return await user.save();
};
exports.getAddresses = async (userId) => {
  const user = await User.findById(userId).select("addresses");
  if (!user) throw new Error("User not found");
  return user.addresses || [];
};
exports.addAddress = async (userId, addressData) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.addresses.push(addressData);
  const updatedUser = await user.save();

  return updatedUser.addresses[updatedUser.addresses.length - 1];
};
exports.updateAddress = async (userId, addressId, updateData) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.addresses = user.addresses.filter((addr) => addr !== null);

  const address = user.addresses.id(addressId);
  if (!address) throw new Error("Address not found");

  Object.assign(address, updateData);
  await user.save();

  return address;
};
exports.deleteAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.addresses = user.addresses.filter((addr) => addr !== null);

  const addressExists = user.addresses.some(
    (addr) => addr._id.toString() === addressId
  );
  if (!addressExists) throw new Error("Address not found");

  user.addresses = user.addresses.filter(
    (addr) => addr._id.toString() !== addressId
  );

  await user.save();
};
exports.setDefaultAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.addresses = user.addresses.filter((a) => a != null);

  user.addresses.forEach((addr) => {
    addr.isDefault = false;
  });

  const address = user.addresses.find((addr) => addr._id == addressId);
  if (!address) throw new Error("Address not found");

  address.isDefault = true;

  user.addresses.sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return Number(a.provinceCode) - Number(b.provinceCode);
  });
  await user.save();

  return address;
};
