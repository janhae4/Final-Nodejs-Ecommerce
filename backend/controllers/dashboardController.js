const userService = require("../services/userService");
const orderService = require("../services/orderService");
const productService = require("../services/productService");

exports.getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await userService.getTotalUsers();
    res.json(totalUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNewUsers = async (req, res) => {
  try {
    const newUsers = await userService.getNewUsers();
    res.json(newUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTotalOrders = async (req, res) => {
  try {
    const totalOrders = await orderService.getTotalOrders();
    res.json(totalOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRevenue = async (req, res) => {
  try {
    const revenue = await orderService.getRevenue();
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductDistribution = async (req, res) => {
  try {
    const productDistribution =
      await productService.getProductDitributionByCategory();
    res.json(productDistribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSaleProductDistribution = async (req, res) => {
  try {
    const saleProductDistribution =
      await productService.getSaleProductDistribution();
    res.json(saleProductDistribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getTopSellingProducts = async (req, res) => {
  try {
    const topSellingProducts = await productService.getTopSellingProducts();
    res.json(topSellingProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSimpleMetrics = async (req, res) => {
  try {
    const [totalUsers, totalNewUsers, totalOrders, totalRevenue, bestSellers] =
      await Promise.all([
        userService.getTotalUsers(),
        userService.getNewUsers(),
        orderService.getTotalOrders(),
        orderService.getRevenue(),
        productService.getTopProducts(),
      ]);
    res.json({
      totalUsers,
      totalNewUsers,
      totalOrders,
      totalRevenue,
      bestSellers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPerformanceTrend = async (req, res) => {
  const { interval = "annual", dateRange } = req.query;

  try {
    const result = await orderService.getPerformanceTrendByInterval(
      interval,
      JSON.parse(dateRange || "[]")
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
