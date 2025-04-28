const express = require('express');
const router = express.Router();
const orderCotroller = require('../controllers/orderController');

router.get('/', orderCotroller.getUserOrders);
router.get('/all', orderCotroller.getAllOrders);
router.post('/', orderCotroller.createOrder);
router.get('/:orderId', orderCotroller.getOrderById);
router.patch('/:orderId', orderCotroller.patchOrder);
router.delete('/:orderId', orderCotroller.deleteOrderById)
module.exports = router;
