const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');

router.get('/users', dashboardController.getTotalUsers);
router.get('/newUsers', dashboardController.getNewUsers);
router.get('/orders', dashboardController.getTotalOrders);
router.get('/revenue', dashboardController.getRevenue);
router.get('/productDistribution', dashboardController.getProductDistribution);
router.get('/topProducts', dashboardController.getTopSellingProducts);
router.get('/', dashboardController.getSimpleMetrics);
router.get('/performance', dashboardController.getPerformanceTrend);

module.exports = router;