const mongoose = require("mongoose");
const productConnection = require("../database/productConnection");
const { use } = require("../routes/orderRoute");

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  inventory: { type: Number, required: true },
  use: { type: Number },
});

const commentSchema = new mongoose.Schema({
  user: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema(
  {
    nameProduct: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    tags: [{ type: String }],
    images: [{ type: String, required: true }],
    shortDescription: { type: String, required: true, maxlength: 500 },
    variants: [variantSchema],
    comments: [commentSchema],
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Product = productConnection.model("Product", productSchema);

module.exports = Product;
