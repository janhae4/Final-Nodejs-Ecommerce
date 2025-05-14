const express = require('express');
const router = express.Router();
const passport = require('passport');
const profileController = require('../controllers/profileController');
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// MIDDLEWARE xác thực JWT
router.use(authMiddleware);


// Profile routes
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.put('/change-password', profileController.changePassword);

// Order
router.get('/orders', orderController.getUserOrders);
router.post('/orders', orderController.createOrder);

// Địa chỉ giao hàng
router.get('/shipping-addresses', profileController.getAddresses);
router.post('/shipping-addresses', profileController.addAddress);
router.put('/shipping-addresses/:addressId', profileController.updateAddress);
router.delete('/shipping-addresses/:addressId', profileController.deleteAddress);



module.exports = router;
