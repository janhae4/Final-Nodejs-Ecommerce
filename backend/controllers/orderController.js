const orderService = require("../services/orderService");

exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;
    const totalCount = await orderService.getOrderCount(search);
    const totalPages = Math.ceil(totalCount / limit);
    const discounts = await orderService.getAllOrders(skip, limit, search);
    res.status(200).json({
      discounts,
      totalPages,
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { user, discountCode } = req.query;
    const orders = await orderService.getOrders(user, discountCode);
    res.json(orders);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await orderService.updateOrder(orderId, req.body);
    res.json(order);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.patchOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await orderService.patchOrder(orderId, req.body);
    res.json(order);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.patchStatusOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await orderService.patchStatusOrder(orderId, req.body);
    res.json(order);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await orderService.getOrderById(orderId);
    res.json(order);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const user = req.user;
    const orders = await orderService.getOrderByUser(user._id);
    res.json(orders);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.deleteOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    console.log(orderId);
    const order = await orderService.deleteOrderById(orderId);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderByDiscountCode = async (req, res) => {
  try {
    const discountCode = req.params.discountCode;
    const orders = await orderService.getOrderByDiscountCode(discountCode);
    res.json(orders);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};
