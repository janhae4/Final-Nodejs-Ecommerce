const mongoose = require("mongoose");
const orderConnection = require("../database/orderConnection");

const paymentInfoSchema = new mongoose.Schema({
  paymentMethod: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const userInfoSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const productInfoSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    variantId: { type: String },
    variantName: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const discountInfoSchema = new mongoose.Schema(
  {
    discountId: { type: String, required: true, index: true },
    code: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userInfo: userInfoSchema,
    orderCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
            enum: [
              "pending",
              "confirmed",
              "shipping",
              "delivered",
              "cancelled",
            ],
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
    products: [productInfoSchema],
    shippingAddress: {
      type: String,
      required: true,
    },
    paymentInfo: paymentInfoSchema,
    discountInfo: discountInfoSchema,
    loyaltyPointsEarned: {
      type: Number,
      default: 0,
    },
    loyaltyPointsUsed: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Order = orderConnection.model("Order", orderSchema);

module.exports = Order;
