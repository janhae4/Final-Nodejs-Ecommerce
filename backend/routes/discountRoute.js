const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');

router.get('/', discountController.getAllDiscount)
router.get('/active', discountController.getDiscountActive)
router.post('/', discountController.createDiscount)
router.patch('/:discountId', discountController.patchDiscount)
module.exports = router;
