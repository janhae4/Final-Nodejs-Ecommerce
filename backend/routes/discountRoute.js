const express = require('express');
const DiscountCode = require('../model/DiscountCode');

const router = express.Router();

router.get('/discount-codes', async (req, res) => {
  try {
    const discountCodes = await DiscountCode.find();
    res.json(discountCodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/discount-codes', async (req, res) => {
  const discountCode = new DiscountCode({
    code: req.body.code,
    value: req.body.value,
    usageLimit: req.body.usageLimit,
    usedCount: req.body.usedCount || 0,
  });

  try {
    const newDiscountCode = await discountCode.save();
    res.status(201).json(newDiscountCode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;