const mongoose = require("mongoose");
const orderConnection = require("../database/orderConnection");

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  orderCode: {
    type: String,
    required: true,
    unique: true,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
    default: "pending",
  },
  statusHistory: {
    type: [
      {
        status: {
          type: String,
          enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    default: [
      {
        status: "pending",
        timestamp: Date.now(),
      },
    ],
  },
  products: [
    {
      productId: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  shippingAddress: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String,
    required: true,
    unique: true,
  },
  discountCode: {
    type: String,
  },
  loyaltyPointsEarned: {
    type: Number,
    default: 0,
  },
  loyaltyPointsUsed: {
    type: Number,
    default: 0,
  },
});

const Order = orderConnection.model("Order", orderSchema);

module.exports = Order;
