const mongoose = require("mongoose");
const slugify = require("slugify");
const {productConnection} = require("../database/dbConnection");
const { use } = require("../routes/orderRoute");
const User = require("./User");

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  inventory: { type: Number, required: true },
  used: { type: Number,default: 0 },
});

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  userFullName: { type: String, required: true },
  content: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema(
  {
    nameProduct: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    brand: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    tags: [{ type: String }],
    images: [{ type: String, required: true }],
    shortDescription: { type: String, required: true, maxlength: 1000 },
    variants: [variantSchema],
    comments: [commentSchema],
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    soldQuantity: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);


productSchema.pre('save', function (next) {
  if (!this.slug && this.nameProduct) {
    this.slug = slugify(this.nameProduct, { lower: true });
  }
  next();
});

const Product = productConnection.model("Product", productSchema);

module.exports = Product;
