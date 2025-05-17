const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdminMiddleware } = require('../middlewares/isAdminMiddleware');
const User = require('../models/User');
// Tất cả route admin cần auth + admin role
router.use(authMiddleware, isAdminMiddleware);

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId', adminController.updateUser);
router.put('/users/:userId/ban', adminController.banUser);
router.put('/users/:userId/unban', adminController.unbanUser);
router.delete('/users/:userId', adminController.deleteUser);
router.get('/dashboard', dashboardController.getSimpleMetrics);
router.get('/dashboard/performance', dashboardController.getPerformanceTrend);

module.exports = router;
