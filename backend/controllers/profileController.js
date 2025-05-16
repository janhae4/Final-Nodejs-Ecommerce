const User = require("../models/User");
const bcrypt = require("bcrypt");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    }).select("-password");
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
    console.log(currentPassword, newPassword)
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Old password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user.addresses || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.addresses.push(req.body);
    await user.save();

    res
      .status(201)
      .json({
        message: "Address added successfully",
        address: user.addresses[user.addresses.length - 1],
      });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    Object.assign(address, req.body);
    await user.save();

    res.status(200).json({ message: "Address updated successfully", address });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    // Lọc bỏ những địa chỉ null trước
    user.addresses = user.addresses.filter((addr) => addr !== null);

    // Kiểm tra address có tồn tại không
    const addressExists = user.addresses.some(
      (addr) => addr._id.toString() === addressId
    );
    if (!addressExists)
      return res.status(404).json({ message: "Address not found" });

    // Lọc mảng addresses loại bỏ address có _id trùng
    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId
    );

    await user.save();

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    // console.log("Received addressId:", addressId);

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Làm sạch địa chỉ null
    user.addresses = user.addresses.filter(a => a != null);

    // console.log("Available address IDs:", user.addresses.map(a => a._id));

    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });

    const address = user.addresses.find(addr => addr._id == addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    address.isDefault = true;
    await user.save();

    res.status(200).json({ message: "Default address set successfully", address });
  } catch (err) {
    // console.log("Error in setDefaultAddress:", err);
    res.status(400).json({ message: err.message });
  }
};
