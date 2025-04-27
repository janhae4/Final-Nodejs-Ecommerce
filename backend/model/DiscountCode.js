const mongoose = require('mongoose');
const discountConnection = require('../database/discountConnection');

const discountCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: Number,
    required: true,
  },
  usageLimit: {
    type: Number,
    required: true,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
});

const DiscountCode = discountConnection.model('DiscountCode', discountCodeSchema);

module.exports = DiscountCode;