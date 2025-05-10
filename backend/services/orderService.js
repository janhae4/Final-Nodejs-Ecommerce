const Order = require("../models/Order");
const Product = require("../models/Product");

const generateOrderCode = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORDER${timestamp}${random}`;
};

exports.createOrder = async (orderData) => {
  const session = await Order.startSession();
  session.startTransaction();

  try {
    const order = new Order({
      ...orderData,
      orderCode: generateOrderCode(),
      loyaltyPointsEarned: Math.floor((orderData.totalAmount || 0) * 0.1),
    });

    for (const product of orderData.products) {
      const productData = await Product.findById(product._id).session(session);
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

      variant.inventory -= product.quantity;

      await productData.save({ session });
    }

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
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
  const dateQuery = {};
  const now = new Date();

  if (startDate && endDate) {
    dateQuery.purchaseDate = {
      $gte: startDate,
      $lte: endDate,
    };
  } else if (timeFilter && timeFilter !== "all") {
    dateQuery.purchaseDate = {};

    switch (timeFilter) {
      case "today":
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dateQuery.purchaseDate = {
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

        dateQuery.purchaseDate = {
          $gte: yesterday,
          $lte: yesterdayEnd,
        };
        break;

      case "week":
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        dateQuery.purchaseDate = {
          $gte: weekStart,
          $lte: now,
        };
        break;

      case "month":
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        dateQuery.purchaseDate = {
          $gte: monthStart,
          $lte: now,
        };
        break;
    }
  }

  return dateQuery;
};

exports.getOrderCount = async (
  search,
  timeFilter,
  startDate,
  endDate,
  user,
  discountCode
) => {
  const dateQuery = getDateRangeQuery(timeFilter, startDate, endDate);

  const query = {
    $and: [
      search && { orderCode: { $regex: search, $options: "i" } },
      ...dateQuery,
      user && { user },
      discountCode && { discountCode },
    ].filter(Boolean),
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
    const dateQuery = getDateRangeQuery(timeFilter, startDate, endDate);

    const query = {
      $and: [
        search && { orderCode: { $regex: search, $options: "i" } },
        ...dateQuery,
        user && { user },
        discountCode && { discountCode },
      ].filter(Boolean),
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
