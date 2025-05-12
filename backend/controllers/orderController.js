const orderService = require("../services/orderService");
const guestService = require("../services/guestService");

exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const timeFilter = req.query.timeFilter || "all";
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }

    const user = req.query.userId || "";
    const discountCode = req.query.discountCode || "";

    const orders = await orderService.getAllOrders(
      skip,
      limit,
      search,
      timeFilter,
      startDate,
      endDate,
      user,
      discountCode
    );
    const count = await orderService.getOrderCount(
      search,
      timeFilter,
      startDate,
      endDate,
      user,
      discountCode
    );

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalCount: count,
      orders: orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const isGuest = req.body.userInfo.userId.includes("guest");
    let order;
    if (isGuest) {
      order = await guestService.createGuest(req.body);
    } else {
      order = await orderService.createOrder(req.body);
    }
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
    const userId = req.params.userId;
    if (userId.includes("guest")) {
      const ordersGuest = await guestService.getGuestOrders(userId);
      return res.json(ordersGuest);
    }
    const orders = await orderService.getOrderByUser(userId);
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
