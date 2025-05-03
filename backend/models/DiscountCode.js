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
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage',
  },
  usageLimit: {
    type: Number,
    default: 10,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  }
});

const DiscountCode = discountConnection.model('DiscountCode', discountCodeSchema);

module.exports = DiscountCode;