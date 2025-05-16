const ProductService = require("../services/productService");
const cloudinary = require("../database/cloudinary");

// Create a new product
// POST/products/create
exports.createProduct = async (req, res) => {
  try {
    const {
      nameProduct,
      price,
      brand,
      category,
      shortDescription,
      tags,
      variants,
      comments,
    } = req.body;

    // Process uploaded images (Cloudinary)
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });

        images.push(uploaded.secure_url); // Use the variable received from Promise
      }
    }

    const tagsArray = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags.split(",").map((t) => t.trim())
      : [];

    let variantsArray = [];
    if (Array.isArray(variants)) {
      variantsArray = variants;
    } else if (typeof variants === "string") {
      try {
        variantsArray = JSON.parse(variants);
      } catch {
        variantsArray = [];
      }
    }

    const product = await ProductService.createProduct({
      nameProduct,
      price,
      brand,
      category,
      images,
      shortDescription,
      tags: tagsArray,
      variants: variantsArray,
      comments,
    });

    res
      .status(201)
      .json({ status: true, message: "Product created successfully", product });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating product", error: err.message });
  }
};

// Get product by ID
// GET/products/:id
exports.getProductByIdWithVariants = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductService.getProductByIdWithVariants(id);

    res.status(200).json({ status: true, product });
  } catch (err) {
    res
      .status(404)
      .json({ message: "Error fetching product", error: err.message });
  }
};

// Search products by name
// GET/products/searchByName?keyword=yourKeyword
exports.searchProductByName = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ message: "Keyword is required" });
    }

    const products = await ProductService.searchProductsByName(keyword);
    res.status(200).json({ status: true, products });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error searching products", error: err.message });
  }
};

// Search products by brand
// GET/products/searchByBrand?keyword=yourKeyword
exports.searchProductByBrand = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ message: "Keyword is required" });
    }

    const products = await ProductService.searchProductsByBrand(keyword);
    res.status(200).json({ status: true, products });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error searching products", error: err.message });
  }
};

// Search products by price
// GET/products/searchByPrice?minPrice=yourMinPrice&maxPrice=yourMaxPrice
exports.searchByPrice = async (req, res, next) => {
  try {
    const { minPrice, maxPrice } = req.query;

    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || Number.MAX_SAFE_INTEGER;

    const products = await ProductService.findProductsByPrice(min, max);

    res.status(200).json({ status: true, products });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Error searching products by price",
        error: err.message,
      });
  }
};

// Search products by category
// GET/products/searchByCategory?category=yourCategory
exports.searchByCategory = async (req, res, next) => {
  try {
    const { category, limit } = req.query;
    if (!category) {
      return res
        .status(400)
        .json({ message: "Category is required for search" });
    }
    const products = await ProductService.findProductsByCategory(category, limit);
    res.status(200).json({ status: true, products });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Error searching products by category",
        error: err.message,
      });
  }
};

// Search products with multiple criteria
// GET/products/search?keyword=yourKeyword&minPrice=yourMinPrice&maxPrice=yourMaxPrice&category=yourCategory
exports.searchProducts = async (req, res) => {
  try {
    const {
      nameProduct,
      category,
      minPrice,
      maxPrice,
      page,
      sortBy,
      sortOrder,
    } = req.query;

    const result = await ProductService.searchProducts({
      nameProduct,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      page: page ? parseInt(page) : 1,
      sortBy,
      sortOrder,
    });

    res.status(200).json({
      status: true,
      message: "Products fetched successfully",
      products: result.products,
      totalProducts: result.totalProducts,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        status: false,
        message: "Error searching products",
        error: err.message,
      });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;

    const oldImages = Array.isArray(req.body.oldImages)
      ? req.body.oldImages
      : req.body.oldImages
      ? [req.body.oldImages]
      : [];

    let uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });

        uploadedImages.push(uploaded.secure_url);
      }
    }

    updateData.images = [...oldImages, ...uploadedImages];

    const updatedProduct = await ProductService.updateProduct(
      productId,
      updateData
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }

    res.status(200).json({
      status: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        status: false,
        message: "Error updating product",
        error: err.message,
      });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const deletedProduct = await ProductService.deleteProduct(productId);

    if (!deletedProduct) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }

    res
      .status(200)
      .json({ status: true, message: "Product deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({
        status: false,
        message: "Error deleting product",
        error: err.message,
      });
  }
};

// Add a comment to a product
// POST/products/:id/comments
exports.addComment = async (req, res) => {
  try {
    const productId = req.params.id;
    const { user, content } = req.body;

    if (!user || !content) {
      return res
        .status(400)
        .json({ status: false, message: "User and content are required" });
    }

    const updatedProduct = await ProductService.addComment(productId, {
      user,
      content,
    });

    res.status(200).json({
      status: true,
      message: "Comment added successfully",
      product: updatedProduct,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        status: false,
        message: "Error adding comment",
        error: err.message,
      });
  }
};

// Update a comment
// PATCH/products/:id/comments/:commentId
exports.updateComment = async (req, res) => {
  try {
    const productId = req.params.id;
    const commentId = req.params.commentId;
    const { newContent } = req.body;

    if (!newContent) {
      return res
        .status(400)
        .json({ status: false, message: "New content is required" });
    }

    const updatedProduct = await ProductService.updateComment(
      productId,
      commentId,
      newContent
    );

    res.status(200).json({
      status: true,
      message: "Comment updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        status: false,
        message: "Error updating comment",
        error: err.message,
      });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const productId = req.params.id;
    const commentId = req.params.commentId;

    const updatedProduct = await ProductService.deleteComment(
      productId,
      commentId
    );

    res.status(200).json({
      status: true,
      message: "Comment deleted successfully",
      product: updatedProduct,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        status: false,
        message: "Error deleting comment",
        error: err.message,
      });
  }
};

exports.decreaseInventory = async (req, res) => {
  try {
    const { productId, quantity, variantId } = req.body;

    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ message: "productId and quantity are required" });
    }

    const updatedProduct = await ProductService.decreaseInventory(
      productId,
      quantity,
      variantId
    );

    res.status(200).json({
      message: "Inventory updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductVariants = async (req, res) => {
  try {
    const productId = req.params.id;
    const variants = await ProductService.getProductVariants(productId);
    res.status(200).json(variants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductByFilter = async (req, res) => {
  try {
    const { type } = req.query;
    let products;

    switch (type) {
      case "best_sellers":
        products = await ProductService.getBestSellers();
        break;
      case "new_arrivals":
        products = await ProductService.getNewArrivals();
        break;
      default:
        products = await ProductService.getAllProducts();
    }
    res.status(200).json({ status: true, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBestSellers = async (req, res) => {
  try {
    const bestSellers = await ProductService.getBestSellers();
    res.status(200).json(bestSellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNewArrivals = async (req, res) => {
  try {
    const newArrivals = await ProductService.getNewArrivals();
    res.status(200).json(newArrivals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.syncAllProductsToElasticsearch = async (req, res) => {
  try {
    const syncResult = await ProductService.syncAllProductToElastic();
    res.status(200).json(syncResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchProductsByElasticSearch = async (req, res) => {
  try {
    const {
      keyword,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const result = await ProductService.searchProductsByElasticSearch({
      keyword,
      minPrice: Number(minPrice),
      maxPrice: Number(maxPrice),
      page: Number(page),
      limit: Number(limit),
      sortBy,
      sortOrder,
    });

    res.status(200).json({ status: true, ...result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
