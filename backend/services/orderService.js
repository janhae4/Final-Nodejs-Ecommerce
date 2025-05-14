const DiscountCode = require("../models/DiscountCode");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const emailService = require("./emailService");
const guestService = require("./redisService");
const generateOrderCode = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORDER${timestamp}${random}`;
};

exports.createOrder = async (isGuest = null, orderData) => {
  const orderSession = await Order.startSession();
  const productSession = await Product.startSession();
  const userSession = await User.startSession();
  const discountSession = await DiscountCode.startSession();
  orderSession.startTransaction();
  productSession.startTransaction();
  userSession.startTransaction();
  discountSession.startTransaction();
  try {
    // Order
    console.log(orderData)
    const order = new Order({
      ...orderData,
      orderCode: generateOrderCode(),
      loyaltyPointsEarned: Math.floor((orderData.totalAmount || 0) * 0.1),
    });

    console.log(order);

    // Product
    for (const product of orderData.products) {
      const productData = await Product.findById(product.productId).session(
        productSession
      );

      if (!productData) {
        throw new Error("Product not found");
      }

      const variant = productData.variants.id(product.variantId);
      if (!variant) {
        throw new Error("Product variant not found");
      }

      if (variant.inventory < product.quantity) {
        throw new Error("Not enough inventory for product");
      }

      variant.used += product.quantity;
      await productData.save({ session: productSession });
    }
    if (isGuest) {
      console.log(order);
      await guestService.createOrder(order);
    }
    await order.save({ session: orderSession });
    emailService.sendOrderConfirmation(order);

    // User
    if (!isGuest) {
      const user = await User.findById(orderData.userInfo.userId).session(
        userSession
      );
      if (!user) {
        throw new Error("User not found");
      }
      user.loyaltyPoints += order.loyaltyPointsEarned - order.loyaltyPointsUsed;
      await user.save({ session: userSession });
    }

    // Discount
    const discountCode = await DiscountCode.findOne({
      code: orderData?.discountInfo?.code,
    }).session(discountSession);
    if (discountCode) {
      discountCode.usedCount += 1;
      await discountCode.save({ session: discountSession });
    }

    await orderSession.commitTransaction();
    await productSession.commitTransaction();
    await userSession.commitTransaction();
    await discountSession.commitTransaction();
    return order;
  } catch (error) {
    await orderSession.abortTransaction();
    await productSession.abortTransaction();
    await userSession.abortTransaction();
    await discountSession.abortTransaction();
    throw error;
  } finally {
    orderSession.endSession();
    productSession.endSession();
    userSession.endSession();
    discountSession.endSession();
  }
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
      pending: ["confirmed", "cancelled"],
      confirmed: ["shipping", "cancelled"],
      shipping: ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
    };

    const currentStatus = order.status;
    const newStatus = orderData.status;

    if (!validStatusTransitions[currentStatus].includes(newStatus)) {
      throw new Error(
        `Cannot transition from ${currentStatus} to ${newStatus}`
      );
    }

    order.status = orderData.status;
    order.statusHistory.push({ status: orderData.status });

    return await order.save();
  } catch (error) {
    throw new Error("Error updating order: " + error.message);
  }
};

exports.updateOrder = async (orderId, orderData) => {
  const order = await Order.findById(orderId);
  const updatePayload = { ...orderData };

  if (order.status !== orderData.status) {
    updatePayload.$push = {
      statusHistory: { status: orderData.status },
    };
  }

  return await Order.findByIdAndUpdate(orderId, updatePayload, { new: true });
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
    throw new Error("Order not found");
  }
};

const getDateRangeQuery = (timeFilter, startDate, endDate) => {
  const now = new Date();
  let dateCondition = {};

  if (startDate && endDate) {
    dateCondition = {
      $gte: startDate,
      $lte: endDate,
    };
  } else if (timeFilter && timeFilter !== "all") {
    switch (timeFilter) {
      case "today":
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dateCondition = {
          $gte: today,
          $lte: now,
        };
        break;

      case "yesterday":
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const yesterdayEnd = new Date();
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
        yesterdayEnd.setHours(23, 59, 59, 999);

        dateCondition = {
          $gte: yesterday,
          $lte: yesterdayEnd,
        };
        break;

      case "week":
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        dateCondition = {
          $gte: weekStart,
          $lte: now,
        };
        break;

      case "month":
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        dateCondition = {
          $gte: monthStart,
          $lte: now,
        };
        break;
    }
  }

  return dateCondition;
};

exports.getOrderCount = async (
  search,
  timeFilter,
  startDate,
  endDate,
  user,
  discountCode
) => {
  const dateCondition = getDateRangeQuery(timeFilter, startDate, endDate);

  const query = {
    ...(search && { orderCode: { $regex: search, $options: "i" } }),
    ...(Object.keys(dateCondition).length > 0 && {
      purchaseDate: dateCondition,
    }),
    ...(user && { "userInfo.userId": user }),
    ...(discountCode && { "discountInfo.code": discountCode }),
  };

  return await Order.countDocuments(query);
};

exports.getAllOrders = async (
  skip,
  limit,
  search,
  timeFilter,
  startDate,
  endDate,
  user,
  discountCode
) => {
  try {
    const dateCondition = getDateRangeQuery(timeFilter, startDate, endDate);
    const query = {
      ...(search && { orderCode: { $regex: search, $options: "i" } }),
      ...(Object.keys(dateCondition).length > 0 && {
        purchaseDate: dateCondition,
      }),
      ...(user && { "userInfo.userId": user }),
      ...(discountCode && { "discountInfo.code": discountCode }),
    };

    await Order.collection.createIndex({ orderCode: 1 });

    return await Order.find(query)
      .sort({ purchaseDate: -1 })
      .skip(skip)
      .limit(limit);
  } catch (error) {
    throw new Error("Error fetching orders: " + error.message);
  }
};

exports.getOrderByUser = async (userId) => {
  try {
    const orders = await Order.find({ "userInfo.userId": userId });
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
    const orders = await Order.find({ "discountInfo.code": discountCode });
    if (!orders) {
      throw new Error("Orders not found");
    }
    return orders;
  } catch (error) {
    throw new Error("Error fetching orders by discount code: " + error.message);
  }
};

exports.updateOrderUserId = async (oldUserId, newUserId) => {
  try {
    const orders = await Order.updateMany(
      { "userInfo.userId": oldUserId },
      { $set: { "userInfo.userId": newUserId } }
    );
    return orders;
  } catch (error) {
    throw new Error("Error updating order user ID: " + error.message);
  }
}