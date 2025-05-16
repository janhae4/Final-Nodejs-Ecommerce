const Order = require("../models/Order");
const Product = require("../models/Product");
const userSerivce = require("./userService");
const rabbitService = require("./rabbitService");

const generateOrderCode = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORDER${timestamp}${random}`;
};

exports.createOrder = async (orderData) => {
  const user = await userSerivce.createUserForGuest(orderData.userInfo);
  const productSession = await Product.startSession();
  const orderSession = await Order.startSession();
  console.log(orderData);
  try {
    orderSession.startTransaction();
    productSession.startTransaction();
    // Order
    const order = new Order({
      ...orderData,
      userInfo: {
        userId: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
      },
      shippingAddress: orderData.shippingAddress,
      orderCode: generateOrderCode(),
      loyaltyPointsEarned: Math.floor((orderData.totalAmount || 0) * 0.1),
    });
    // Product
    for (const product of orderData.products) {
      const productData = await Product.findById(product.productId).session(
        productSession
      );

      if (!productData) {
        await productSession.abortTransaction();
        await orderSession.abortTransaction();
        throw new Error("Product not found");
      }

      const variant = productData.variants.id(product.variantId);
      if (!variant) {
        await productSession.abortTransaction();
        await orderSession.abortTransaction();
        throw new Error("Product variant not found");
      }

      if (variant.inventory < product.quantity) {
        await productSession.abortTransaction();
        await orderSession.abortTransaction();
        throw new Error("Not enough inventory for product");
      }
      await productData.save({ session: productSession });
    }

    const saved_order = await order.save({ session: orderSession });

    await orderSession.commitTransaction();
    const orderCreatedEvent = {
      orderId: saved_order._id.toString(),
      orderCode: saved_order.orderCode,
      userId: saved_order.userInfo?.userId?.toString(),
      guestId: orderData?.userInfo?.userId,
      email: saved_order.userInfo.email,
      fullName: saved_order.userInfo.fullName,
      products: saved_order.products.map((p) => ({
        productName: p.productName,
        variantName: p.variantName,
        productId: p.productId.toString(),
        variantId: p.variantId.toString(),
        quantity: p.quantity,
        price: p.price,
      })),
      totalAmount: saved_order.totalAmount,
      loyaltyPointsEarned: saved_order.loyaltyPointsEarned,
      loyaltyPointsUsed: saved_order.loyaltyPointsUsed,
      discountInfo: saved_order.discountInfo,
      purchaseDate: saved_order.purchaseDate,
      status: saved_order.status,
    };

    await rabbitService.publishOrderCreated(orderCreatedEvent);
    return saved_order;
  } catch (error) {
    await orderSession.abortTransaction();
    await productSession.abortTransaction();
    throw error;
  } finally {
    orderSession.endSession();
    productSession.endSession();
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
};
