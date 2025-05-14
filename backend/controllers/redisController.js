const redisService = require("../services/redisService");
const orderService = require("../services/orderService");
exports.createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(true, req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const ordersGuest = await redisService.getGuestOrders(req.params.userId);
    res.json(ordersGuest);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const guestId = req.body?.userInfo?.userId;
    const order = await redisService.addGuestAddress(guestId, req.body);
    res.json(order);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getGuestAddresses = async (req, res) => {
  try {
    const addresses = await redisService.getGuestAddresses(req.params.guestId);
    res.json(addresses);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.deleteGuestAddress = async (req, res) => {
  try {
    const { guestId, addressId } = req.params;
    const order = await redisService.deleteGuestAddress(guestId, addressId);
    res.json(order);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.updateGuestAddress = async (req, res) => {
  try {
    const guestId = req.params.guestId;
    const address = req.body;
    const order = await redisService.updateGuestAddress(guestId, address);
    res.json(order);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.addCart = async (req, res) => {
  try {
    const { guestId, ...cart } = req.body;
    const order = await redisService.addCart(guestId, cart);
    res.json(order);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const guestId = req.params.guestId;
    const cart = req.body;
    console.log(cart);
    const cartItem = await redisService.updateCart(guestId, cart);
    res.json(cartItem);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCart = async (req, res) => {
  try {
    const guestId = req.params.guestId;
    const order = await redisService.deleteCart(guestId);
    res.json(order);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const guestId = req.params.guestId;
    const cart = await redisService.getCart(guestId);
    res.json(cart);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.addUserCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItem = await redisService.addCart({ ...req.body, id: userId });
    res.json(cartItem);
  } catch {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await redisService.getCart(userId);
    res.json(cart);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await redisService.updateCart(userId, req.body);
    res.json(cart);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUserCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await redisService.deleteCart(userId);
    res.json(cart);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getInfo = async (req, res) => {
  try {
    const guestId = req.params.guestId;
    const order = await redisService.getInfo(guestId);
    res.json(order);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.addInfo = async (req, res) => {
  try {
    const { guestId, ...info } = req.body;
    const order = await redisService.updateInfo(guestId, info);
    res.json(order);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.updateInfo = async (req, res) => {
  try {
    const guestId = req.params.guestId;
    const info = req.body;
    console.log("Day la update");
    console.log(info);
    const order = await redisService.updateInfo(guestId, info);
    res.json(order);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};
