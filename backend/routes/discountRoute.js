const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');

router.get('/', discountController.getAllDiscount)
router.get('/active', discountController.getDiscountActive)
router.get('/code/:code', discountController.getDiscountByCode)
router.get('/most-used', discountController.getMostUsedDiscount)
router.get('/active-length', discountController.getActiveDiscountLength)
router.get('/inactive-length', discountController.getInactiveDiscountLength)
router.get('/:discountId', discountController.getDiscountById)
router.post('/', discountController.createDiscount)
router.patch('/:discountId', discountController.patchDiscount)
router.put('/:discountId', discountController.patchDiscount)
router.delete('/:discountId', discountController.deleteDiscount)
module.exports = router;
