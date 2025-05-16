const User = require("../models/User");
const authService = require("./authService");
exports.findUserById = async (id) => await User.findById(id);
exports.findyUserByEmail = async (email) => await User.find({ email });
exports.createUser = async (user) => await User.create(user);
exports.createUserForGuest = async (user) => {
  const { email } = user.userInfo;
  const u = await User.findOne({ email });
  if (u) return u;
  return await authService.registerUser(user);
};
