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
  const orderSession = await Order.startSession();
  const productSession = await Product.startSession();
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
      shippingAddress: saved_order.shippingAddress,
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
    console.log(discountCode);
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

exports.findProductOrderUser = async (userId, productId) => {
  try {
    const orders = await Order.find({
      "userInfo.userId": userId,
      "products.productId": productId,
    });
    if (!orders) {
      throw new Error("Orders not found");
    }
    return orders;
  } catch (error) {
    throw new Error("Error fetching orders by user: " + error.message);
  }
};

exports.getTotalOrders = async () => await Order.countDocuments();
exports.getRevenue = async () => {
  const result = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$totalAmount" },
      },
    },
  ]);

  return result[0]?.totalAmount || 0;
};

exports.getPerformanceTrendByInterval = async (interval, dateRange) => {
  const matchStage = {};

  if (interval === "custom" && dateRange?.length === 2) {
    matchStage.purchaseDate = {
      $gte: new Date(dateRange[0]),
      $lte: new Date(dateRange[1]),
    };
  }

  let groupStage;
  switch (interval) {
    case "annual":
      groupStage = {
        _id: { year: { $year: "$purchaseDate" } },
      };
      break;
    case "quarterly":
      groupStage = {
        _id: {
          year: { $year: "$purchaseDate" },
          quarter: {
            $ceil: { $divide: [{ $month: "$purchaseDate" }, 3] },
          },
        },
      };
      break;
    case "monthly":
      groupStage = {
        _id: {
          year: { $year: "$purchaseDate" },
          month: { $month: "$purchaseDate" },
        },
      };
      break;
    case "weekly":
      groupStage = {
        _id: {
          year: { $year: "$purchaseDate" },
          week: { $isoWeek: "$purchaseDate" },
        },
      };
      break;
    case "custom":
      groupStage = {
        _id: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$purchaseDate" } },
        },
      };
      break;
    default:
      throw new Error("Invalid interval");
  }

  // Phân phối theo category
  const categoryDistribution = await Order.aggregate([
    { $match: matchStage },
    { $unwind: "$products" },
    {
      $lookup: {
        from: "products",
        localField: "products.productId",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: "$productInfo" },
    {
      $group: {
        _id: "$productInfo.category",
        totalQuantity: { $sum: "$products.quantity" },
      },
    },
    {
      $project: {
        _id: 0,
        name: "$_id",
        value: "$totalQuantity",
      },
    },
  ]);

  // Thống kê theo thời gian
  const advancedStats = await Order.aggregate([
    { $match: matchStage },
    { $unwind: "$products" },
    {
      $group: {
        ...groupStage,
        revenue: { $sum: "$totalAmount" },
        product: { $sum: "$products.quantity" },
        productStats: {
          $push: {
            productId: "$products.productId",
            quantity: "$products.quantity",
          },
        },
      },
    },
    {
      $addFields: {
        profit: { $multiply: ["$revenue", 0.1] },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
        "_id.quarter": 1,
        "_id.week": 1,
      },
    },
  ]);

  // Gắn nhãn cho mỗi entry trong advancedStats
  const labeledAdvancedStats = advancedStats.map((entry) => {
    const { year, month, quarter, week, day } = entry._id;
    let name = "";

    switch (interval) {
      case "annual":
        name = `${year}`;
        break;
      case "quarterly":
        name = `Q${quarter} ${year}`;
        break;
      case "monthly":
        name = `${month}/${year}`;
        break;
      case "weekly":
        name = `W${week} ${year}`;
        break;
      case "custom":
        name = day;
        break;
    }

    return { ...entry, name };
  });

  return {
    advancedStats: labeledAdvancedStats,
    categoryDistribution,
  };
};
