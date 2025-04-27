const express = require('express');
const DiscountCode = require('../model/DiscountCode');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: DiscountCodes
 *   description: Operations for managing discount codes
 */

/**
 * @swagger
 * /api/discount-codes:
 *   get:
 *     summary: Get a list of all discount codes
 *     tags: [DiscountCodes]
 *     responses:
 *       200:
 *         description: A list of discount codes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                   value:
 *                     type: number
 *                   usageLimit:
 *                     type: number
 *                   usedCount:
 *                     type: number
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const discountCodes = await DiscountCode.find();
    res.json(discountCodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/discount-codes:
 *   post:
 *     summary: Create a new discount code
 *     tags: [DiscountCodes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - value
 *               - usageLimit
 *             properties:
 *               code:
 *                 type: string
 *                 description: The unique discount code
 *               value:
 *                 type: number
 *                 description: The value of the discount (percentage or fixed amount)
 *               usageLimit:
 *                 type: number
 *                 description: The maximum number of times the discount code can be used
 *     responses:
 *       201:
 *         description: Discount code created successfully
 *       400:
 *         description: Bad request or duplicate code
 *       500:
 *         description: Internal server error
 */
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
