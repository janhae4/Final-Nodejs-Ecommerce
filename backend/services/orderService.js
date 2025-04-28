const Order = require('../models/Order');

const generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORDER${timestamp}${random}`;
};
  
exports.createOrder = async (orderData) => {
  const order = new Order({
    ...orderData,
    orderNumber: generateOrderNumber(),
    loyaltyPointsEarned: Math.floor(orderData.totalAmount * 0.1)
  });
  // Send user an email
  // const user = await User.findById(orderData.userId);
  // const email = user.email;
  // emailService.sendOrderConfirmation(email, order);
  await order.save();
  return order;
};

exports.patchOrder = async (orderId, orderData) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  if (orderData.status && orderData.status !== order.status) {
    order.statusHistory.unshift({
      status: orderData.status,
      timestamp: new Date()
    });
    order.status = orderData.status;
  }

  for (const key of Object.keys(orderData)) {
    if (key !== 'status') {
      order[key] = orderData[key];
    }
  }

  await order.save();
  return order;
};


exports.getOrderById = async (orderId) => {
  return Order.findById(orderId);
};