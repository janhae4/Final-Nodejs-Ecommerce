const userService = require("../services/userService");

exports.getProfile = async (req, res) => {
  try {
    const user = await userService.getProfile(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updatedUser = await userService.updateProfile(req.user.id, req.body)
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(req.user.id, currentPassword, newPassword);
    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const user = await userService.getAddresses(req.user.id);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.addAddress = async (req, res) => {
  try {
    const addresses = await userService.addAddress(req.user.id, req.body);
    res
      .status(201)
      .json({
        message: "Address added successfully",
        address: addresses,
      });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    console.log(req.user.id, addressId, req.body);
    const address = await userService.updateAddress(req.user.id, addressId, req.body);
    res.status(200).json({ message: "Address updated successfully", address });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    await userService.deleteAddress(req.user.id, addressId);
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const address = await userService.setDefaultAddress(req.user.id, addressId);
    res.status(200).json({ message: "Default address set successfully", address });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
