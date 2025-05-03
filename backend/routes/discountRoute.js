const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');

router.get('/', discountController.getAllDiscount)
router.get('/active', discountController.getDiscountActive)
router.get('/:discountId', discountController.getDiscountById)
router.post('/', discountController.createDiscount)
router.patch('/:discountId', discountController.patchDiscount)
router.put('/:discountId', discountController.patchDiscount)
router.delete('/:discountId', discountController.deleteDiscount)
module.exports = router;
