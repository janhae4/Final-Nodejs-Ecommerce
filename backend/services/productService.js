const Product = require("../models/Product");
const elasticSearch = require("./elasticService");
const orderService = require("./orderService");
const User = require("../models/User");

exports.getAllProducts = async () => {
  try {
    const products = await Product.find();
    return products;
  } catch (err) {
    throw new Error("Error fetching products: " + err.message);
  }
};

exports.createProduct = async ({
  nameProduct,
  price,
  brand,
  category,
  images,
  shortDescription,
  tags,
  variants,
  comments,
}) => {
  try {
    const tagsArray =
      typeof tags === "string"
        ? tags.split(",").map((tag) => tag.trim())
        : tags || [];
    let variantsArray = Array.isArray(variants)
      ? variants
      : variants
      ? [variants]
      : [];

    const product = new Product({
      nameProduct,
      price,
      brand,
      category,
      images,
      shortDescription,
      tags: tagsArray,
      variants: variantsArray,
      comments: comments || [],
      ratingAverage: 0,
      ratingCount: 0,
    });

    const savedProduct = await product.save();
    await elasticSearch.indexProduct(savedProduct);
    return savedProduct;
  } catch (err) {
    throw new Error("Error creating product: " + err.message);
  }
};

exports.getProductBySlug = async (slug) => {
  try {
    const product = await Product.findOne({ slug: slug });
    if (!product) throw new Error("Product not found");
    return product;
  } catch (err) {
    throw new Error("Error fetching product with slug: " + err.message);
  }
};

exports.getProductByIdWithVariants = async (productId) => {
  try {
    const product = await Product.findById(productId).populate("variants");
    if (!product) throw new Error("Product not found");
    return product;
  } catch (err) {
    throw new Error("Error fetching product with variants: " + err.message);
  }
};

exports.searchProductsByName = async (keyword) => {
  try {
    const regex = new RegExp(keyword, "i");
    return await Product.find({ nameProduct: { $regex: regex } });
  } catch (err) {
    throw new Error("Error searching products by name: " + err.message);
  }
};

exports.searchProductsByBrand = async (keyword) => {
  try {
    const regex = new RegExp(keyword, "i");
    return await Product.find({ brand: { $regex: regex } });
  } catch (err) {
    throw new Error("Error searching products by brand: " + err.message);
  }
};

exports.findProductsByPrice = async (min, max) => {
  try {
    return await Product.find({ price: { $gte: min, $lte: max } });
  } catch (err) {
    throw new Error("Error finding products by price: " + err.message);
  }
};

exports.findProductsByCategory = async (category) => {
  try {
    return await Product.find({
      category: { $regex: category, $options: "i" },
    });
  } catch (err) {
    throw new Error("Error finding products by category: " + err.message);
  }
};

exports.searchProducts = async ({
  nameProduct,
  category,
  brand,
  minPrice,
  maxPrice,
  minRating,
  page = 1,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  try {
    const query = {};

    if (nameProduct) query.nameProduct = { $regex: nameProduct, $options: "i" };
    if (category) query.category = category;
    if (brand) query.brand = { $regex: brand, $options: "i" };
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }
    if (minRating) {
      query.ratingAverage = { $gte: parseFloat(minRating) };
    }

    const totalProducts = await Product.countDocuments(query);
    const limit = 12;
    const totalPages = Math.ceil(totalProducts / limit);
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    return { products, totalProducts, totalPages, currentPage: page };
  } catch (err) {
    throw new Error("Error searching products: " + err.message);
  }
};

exports.searchProductsByElasticSearch = async ({
  keyword,
  nameProduct,
  category,
  brand,
  rating,
  minPrice,
  maxPrice,
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  try {
    const mustQueries = [];
    const filterQueries = [];

    if (keyword) {
      mustQueries.push({
        bool: {
          should: [
            {
              multi_match: {
                query: keyword,
                fields: ["nameProduct^5", "shortDescription"],
                type: "phrase_prefix",
              },
            },
            {
              match: {
                shortDescription: {
                  query: keyword,
                  operator: "and",
                  boost: 1,
                },
              },
            },
          ],
          minimum_should_match: 1,
        },
      });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const rangeQuery = {};
      if (minPrice !== undefined) rangeQuery.gte = minPrice;
      if (maxPrice !== undefined) rangeQuery.lte = maxPrice;

      filterQueries.push({
        range: {
          price: rangeQuery,
        },
      });
    }

    if (nameProduct) {
      mustQueries.push({
        match: {
          nameProduct: {
            query: nameProduct,
            operator: "and",
          },
        },
      });
    }

    if (brand) {
      if (Array.isArray(brand)) {
        filterQueries.push({
          terms: {
            brand: brand,
          },
        });
      } else {
        filterQueries.push({
          term: {
            brand: brand,
          },
        });
      }
    }

    if (category) {
      if (Array.isArray(category)) {
        filterQueries.push({
          terms: {
            category: category,
          },
        });
      } else {
        filterQueries.push({
          term: {
            category: category,
          },
        });
      }
    }

    if (rating) {
      filterQueries.push({
        range: {
          rating: {
            gte: rating,
          },
        },
      });
    }

    const esQuery = {
      bool: {
        must: mustQueries,
        filter: filterQueries,
      },
    };

    const res = await elasticSearch.searchProducts(
      esQuery,
      page,
      limit,
      sortBy === "nameProduct" ? "nameProduct.keyword" : sortBy,
      sortOrder
    );

    return res;
  } catch (err) {
    throw new Error("Error searching products: " + err.message);
  }
};

exports.getAllCategories = async () => {
  const categories = await Product.distinct("category");
  return categories;
};

exports.getAllBrands = async () => {
  const brands = await Product.distinct("brand");
  return brands;
};

exports.getAllCategories = async () => {
  const categories = await Product.distinct("category");
  return categories;
};

exports.getAllBrands = async () => {
  const brands = await Product.distinct("brand");
  return brands;
};

exports.updateProduct = async (productId, updateData) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    return updatedProduct;
  } catch (err) {
    throw new Error("Error updating product: " + err.message);
  }
};

exports.updateProductImage = async (productId, image) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { image },
      { new: true, runValidators: true }
    );
    if (!updatedProduct) throw new Error("Product not found");
    return updatedProduct;
  } catch (err) {
    throw new Error("Error updating product image: " + err.message);
  }
};

exports.deleteProduct = async (productId) => {
  try {
    return await Product.findByIdAndDelete(productId);
  } catch (err) {
    throw new Error("Error deleting product: " + err.message);
  }
};

exports.addCommentToProduct = async (productId, userId, content, rating) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  // Nếu là user đã login thì kiểm tra duplicate comment
  if (userId) {
    const alreadyCommented = product.comments.some(
      (c) => c.user && c.user.toString() === userId.toString()
    );
    if (alreadyCommented) {
      throw new Error("You have already rated this product");
    }
  }

  let userFullName = "Anonymous";
  if (userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    userFullName = user.fullName;
  }

  const isBuy =
    !(await orderService.findProductOrderUser(userId, productId)) == null;

  const newComment = {
    user: userId,
    userFullName,
    content,
    createdAt: new Date(),
    isBuy: isBuy,
  };

  // Nếu có rating (chỉ user login mới có)
  if (rating !== undefined) {
    newComment.rating = rating;
    const totalRating = product.ratingAverage * product.ratingCount + rating;
    product.ratingCount += 1;
    product.ratingAverage = totalRating / product.ratingCount;
  }

  product.comments.push(newComment);
  await product.save();

  return newComment;
};

exports.getCommentsByProductId = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }
  return product.comments;
};

exports.getProductsByRating = async (minRating) => {
  const query = {};

  if (minRating) {
    query.ratingAverage = { $gte: parseFloat(minRating) };
  }

  const products = await Product.find(query);
  return products;
};

exports.updateComment = async (productId, commentId, newContent) => {
  try {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const comment = product.comments.id(commentId);
    if (!comment) throw new Error("Comment not found");

    comment.content = newContent;
    await product.save();
    return comment;
  } catch (err) {
    throw err;
  }
};

exports.deleteComment = async (productId, commentId) => {
  try {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    product.comments = product.comments.filter(
      (comment) => comment._id.toString() !== commentId
    );
    await product.save();
    return product;
  } catch (err) {
    throw err;
  }
};

exports.decreaseInventory = async (productId, quantity, variantId = null) => {
  try {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    if (variantId) {
      const variant = product.variants.id(variantId);
      if (!variant) throw new Error("Variant not found");
      if (variant.inventory < quantity)
        throw new Error("Not enough inventory for variant");
      variant.inventory -= quantity;
    } else {
      if (product.inventory < quantity)
        throw new Error("Not enough inventory for product");
      product.inventory -= quantity;
    }

    await product.save();
    return product;
  } catch (err) {
    throw new Error("Error decreasing inventory: " + err.message);
  }
};

exports.getProductVariants = async (productId) => {
  try {
    const product = await Product.findById(productId).populate("variants");
    if (!product) throw new Error("Product not found");
    return product.variants;
  } catch (err) {
    throw new Error("Error fetching product variants: " + err.message);
  }
};

exports.getBestSellers = async () => {
  try {
    const bestSellers = await Product.find()
      .sort({ soldQuantity: -1 })
      .limit(4);
    console.log(bestSellers);
    return bestSellers;
  } catch (err) {
    throw new Error("Error fetching best sellers: " + err.message);
  }
};

exports.getNewArrivals = async () => {
  try {
    const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(4);
    return newArrivals;
  } catch (err) {
    throw new Error("Error fetching new arrivals: " + err.message);
  }
};

exports.increaseUsed = async (productId, variantId, quantity) => {
  try {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const variant = product.variants.id(variantId);
    if (!variant) throw new Error("Variant not found");

    variant.used += quantity;
    product.soldQuantity += quantity;
    await product.save();
    return product;
  } catch (err) {
    throw err;
  }
};

exports.syncAllProductToElastic = async () => {
  try {
    await elasticSearch.createIndexIfNotExists();
    console.log("CREATED");
    const products = await Product.find();

    for (const product of products) {
      await elasticSearch.indexProduct(product);
    }
  } catch (err) {
    throw err;
  }
};

exports.getTopProducts = async () => {
  try {
    const topProducts = await Product.find()
      .sort({ soldQuantity: -1 })
      .limit(4)
      .select("nameProduct soldQuantity");
    return topProducts;
  } catch (err) {
    throw new Error("Error fetching top products: " + err.message);
  }
};

exports.getProductDitributionByCategory = async () => {
  try {
    const productDitribution = await Product.aggregate([
      { $unwind: "$category" },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return productDitribution;
  } catch (err) {
    throw new Error(
      "Error fetching product ditribution by category: " + err.message
    );
  }
};
