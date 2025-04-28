const Order = require('../models/Order');

const generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORDER${timestamp}${random}`;
};
  
exports.createOrder = async (orderData, user) => {
  const order = new Order({
    ...orderData,
    userId: user._id,
    orderNumber: generateOrderNumber(),
    loyaltyPointsEarned: Math.floor(orderData.totalAmount * 0.1)
  });
  await order.save();
  return order;
};

exports.getOrderById = async (orderId) => {
  return Order.findById(orderId);
};