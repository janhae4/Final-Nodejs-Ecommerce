const Product = require("../models/Product");
const elasticSearch = require("./elasticService");

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
    console.log("Product saved successfully:", savedProduct);
    return savedProduct;
  } catch (err) {
    throw new Error("Error creating product: " + err.message);
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

exports.findProductsByCategory = async (category, limit = null) => {
  try {
    return await Product.find({
      category: { $regex: category, $options: "i" },
    }).limit(limit);
  } catch (err) {
    throw new Error("Error finding products by category: " + err.message);
  }
};

exports.searchProducts = async ({
  nameProduct,
  category,
  minPrice,
  maxPrice,
  page = 1,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  try {
    const query = {};

    if (nameProduct) query.nameProduct = { $regex: nameProduct, $options: "i" };
    if (category) query.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    const totalProducts = await Product.countDocuments(query);
    const limit = 10;
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
  minPrice,
  maxPrice,
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  try {
    const mustQueries = [];

    if (keyword) {
      mustQueries.push({
        bool: {
          should: [
            {
              multi_match: {
                query: keyword,
                fields: ["nameProduct^5", "brand^2", "shortDescription"],
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

      mustQueries.push({
        range: {
          price: rangeQuery,
        },
      });
    }

    const esQuery = {
      bool: {
        must: mustQueries,
      },
    };

    const products = await elasticSearch.searchProducts(
      esQuery,
      page,
      limit,
      sortBy,
      sortOrder
    );

    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / limit);

    return { products, totalProducts, totalPages, currentPage: page };
  } catch (err) {
    throw new Error("Error searching products: " + err.message);
  }
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

exports.addComment = async (productId, commentData) => {
  try {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    product.comments.push(commentData);
    return await product.save();
  } catch (err) {
    throw new Error("Error adding comment: " + err.message);
  }
};

exports.updateComment = async (productId, commentId, newContent) => {
  try {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const comment = product.comments.id(commentId);
    if (!comment) throw new Error("Comment not found");

    comment.content = newContent;
    await product.save();
    return product;
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
