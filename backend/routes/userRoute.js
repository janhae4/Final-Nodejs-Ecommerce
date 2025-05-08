const express = require('express');
const router = express.Router();
const passport = require('passport');
const profileController = require('../controllers/profileController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// MIDDLEWARE xác thực JWT
router.use(authMiddleware);

// Profile routes
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.put('/change-password', profileController.changePassword);

// Địa chỉ giao hàng
router.post('/shipping-addresses', profileController.addAddress);
router.put('/shipping-addresses/:addressId', profileController.updateAddress);
router.delete('/shipping-addresses/:addressId', profileController.deleteAddress);

module.exports = router;
