const ProductService = require("../services/productService");
const cloudinary = require("../database/cloudinary");
const slugify = require("slugify");
const { getIO } = require("../database/socketConnection");

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

exports.getProductBySlug = async (req, res) => {
  try {
    const product = await ProductService.getProductBySlug(req.params.slug);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ status: true, product });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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
    res.status(500).json({
      message: "Error searching products by price",
      error: err.message,
    });
  }
};

// Search products by category
// GET/products/searchByCategory?category=yourCategory
exports.searchByCategory = async (req, res, next) => {
  try {
    const { category } = req.query;
    if (!category) {
      return res
        .status(400)
        .json({ message: "Category is required for search" });
    }
    const products = await ProductService.findProductsByCategory(category);
    res.status(200).json({ status: true, products });
  } catch (err) {
    res.status(500).json({
      message: "Error searching products by category",
      error: err.message,
    });
  }
};

// Search products with multiple criteria
// GET/products/search?nameProduct=abc&minPrice=100&maxPrice=1000&category=xyz&brand=abcBrand&page=1&sortBy=price&sortOrder=asc
exports.searchProducts = async (req, res) => {
  try {
    const { nameProduct, category, brand, minPrice, maxPrice, minRating, page, sortBy, sortOrder } = req.query;

    const result = await ProductService.searchProducts({
      nameProduct,
      category,
      brand,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      page: page ? parseInt(page) : 1,
      sortBy,
      sortOrder,
    });

    res.status(200).json({
      status: true,
      message: 'Products fetched successfully',
      products: result.products,
      totalProducts: result.totalProducts,
      totalPages: result.totalPages,
      currentPage: result.currentPage
    });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Error searching products', error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await ProductService.getAllCategories();
    const data = categories.map((cat) => ({ _id: cat, name: cat }));
    res.status(200).json({ status: true, categories: data });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const brands = await ProductService.getAllBrands();
    const data = brands.map((brand) => ({ _id: brand, name: brand }));
    res.status(200).json({ status: true, brands: data });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch brands" });
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

    if (updateData.nameProduct) {
      updateData.slug = slugify(updateData.nameProduct, { lower: true });
    }

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
    res.status(500).json({
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
    res.status(500).json({
      status: false,
      message: "Error deleting product",
      error: err.message,
    });
  }
};

// Add a comment to a product
// POST/products/:id/comment
exports.addProductComment = async (req, res) => {
  const { productId } = req.params;
  const { content, rating } = req.body;
  const isGuest = !req.user;
  try {
    // Nếu là guest mà lại gửi kèm rating => từ chối
    if (isGuest && rating) {
      return res.status(401).json({
        message:
          "Guests are not allowed to rate. Please log in to rate a product.",
      });
    }

    const userId = isGuest ? null : req.user._id;

    const newComment = await ProductService.addCommentToProduct(
      productId,
      userId,
      content,
      rating
    );

    const io = getIO();
    io.emit(`new-comment-${productId}`, {
      _id: newComment._id,
      content: newComment.content,
      rating: newComment.rating,
      userFullName: newComment.user?.name || "Anonymous",
      createdAt: newComment.createdAt,
    });

    res.status(200).json({ message: "Comment added", data: newComment });
  } catch (err) {
    console.error("Error add comment:" + err);
    res.status(400).json({ message: err.message });
  }
};

exports.getProductComments = async (req, res) => {
  const { productId } = req.params;

  try {
    const comments = await ProductService.getCommentsByProductId(productId);
    res.status(200).json({ comments });
  } catch (error) {
    res.status(404).json({ message: "Can't get comment:" + error.message });
  }
};

//GET /api/products/search/by-rating?minRating=4
exports.getProductsByRating = async (req, res) => {
  const { minRating } = req.query;

  try {
    const products = await ProductService.getProductsByRating(minRating);
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    const updatedComment = await ProductService.updateComment(
      productId,
      commentId,
      newContent
    );

    const io = getIO();
    io.emit(`new-comment-${productId}`, {
      _id: updatedComment._id,
      content: updatedComment.content,
      rating: updatedComment.rating,
      userFullName: updatedComment.user?.name || "Anonymous",
      createdAt: updatedComment.createdAt,
    });

    res.status(200).json({
      status: true,
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (err) {
    res.status(500).json({
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
    res.status(500).json({
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
      brand,
      category,
      minPrice,
      maxPrice,
      minRating,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const result = await ProductService.searchProductsByElasticSearch({
      keyword,
      category,
      brand,
      minPrice: Number(minPrice),
      maxPrice: Number(maxPrice),
      minRating: Number(minRating),
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
