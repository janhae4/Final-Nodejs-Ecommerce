const express = require('express');
const DiscountCode = require('../model/DiscountCode');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const discountCodes = await DiscountCode.find();
    res.json(discountCodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const existingDiscountCode = await DiscountCode.findOne({ code: req.body.code });
  if (existingDiscountCode) {
    return res.status(400).json({ message: 'Discount code already exists' });
  }

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
