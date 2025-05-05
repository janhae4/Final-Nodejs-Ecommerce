const Order = require("../models/Order");

const generateOrderCode = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORDER${timestamp}${random}`;
};

exports.createOrder = async (orderData) => {
  const order = new Order({
    ...orderData,
    orderCode: generateOrderCode(),
    loyaltyPointsEarned: Math.floor(orderData.totalAmount || 0 * 0.1),
  });
  return await order.save();
};

exports.getOrders = async (user, discountCode) => {
  try {
    if (user) return await this.getOrderByUser(user);
    if (discountCode) return await this.getOrderByDiscountCode(discountCode);
  } catch (error) {
    throw new Error("Error fetching orders: " + error.message);
  }
};

exports.patchOrder = async (orderId, orderData) => {
  try {
    const order = await Order.findOneAndUpdate({ _id: orderId }, orderData, {
      new: true,
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  } catch (error) {
    throw new Error("Error updating order: " + error.message);
  }
};

exports.patchStatusOrder = async (orderId, orderData) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const validStatusTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['shipping', 'cancelled'],
      shipping: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: []
    };

    const currentStatus = order.status;
    const newStatus = orderData.status;

    if (!validStatusTransitions[currentStatus].includes(newStatus)) {
      throw new Error(`Cannot transition from ${currentStatus} to ${newStatus}`);
    }

    order.status = orderData.status;
    order.statusHistory.push({ status: orderData.status });
    
    return await order.save();
  } catch (error) {
    throw new Error("Error updating order: " + error.message);
  }
};

exports.updateOrder = async (orderId, orderData) => {
  return await Order.findByIdAndUpdate(orderId, orderData, { new: true });
};

exports.getOrderById = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  } catch (error) {
    throw new Error("Error fetching order by ID: " + error.message);
  }
};

exports.deleteOrderById = async (orderId) => {
  try {
    const order = await Order.findByIdAndDelete(orderId);
    return { message: "Order deleted successfully" };
  } catch (error) {
    throw new Error("Oder not found");
  }
};

exports.getOrderCount = async (search) => {
  return await Order.countDocuments({
    $or: [{ orderCode: { $regex: search, $options: "i" } }],
  });
};

exports.getAllOrders = async (skip, limit, search) => {
  try {
    await Order.collection.dropIndexes();
    return await Order.find({
      $or: [{ orderCode: { $regex: search, $options: "i" } }],
    })
      .skip(skip)
      .limit(limit);
  } catch (error) {
    throw new Error("Error fetching orders: " + error.message);
  }
};

exports.getOrderByUser = async (userId) => {
  try {
    const orders = await Order.find({ user: userId });
    if (!orders) {
      throw new Error("Orders not found");
    }
    return orders;
  } catch (error) {
    throw new Error("Error fetching orders by user: " + error.message);
  }
};

exports.getOrderByDiscountCode = async (discountCode) => {
  try {
    const orders = await Order.find({ discountCode: discountCode });
    if (!orders) {
      throw new Error("Orders not found");
    }
    return orders;
  } catch (error) {
    throw new Error("Error fetching orders by discount code: " + error.message);
  }
};
