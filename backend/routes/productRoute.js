const router = require('express').Router();
const ProductController = require('../controllers/productController');
const upload = require('../middlewares/multer');
const {authMiddleware} = require('../middlewares/authMiddleware');

//Create and find products
router.get('/sync', ProductController.syncAllProductsToElasticsearch)
router.get('/filter', ProductController.getProductByFilter)
router.get('/search/', ProductController.searchProductsByElasticSearch);
router.get('/searchByName', ProductController.searchProductByName);
router.get('/searchByBrand', ProductController.searchProductByBrand);
router.get('/searchByCategory', ProductController.searchByCategory);
router.get('/searchByPrice', ProductController.searchByPrice);
//Get product by rating
router.get('/search/by-rating', ProductController.getProductsByRating);
router.get("/categories", ProductController.getCategories);
router.get("/brands", ProductController.getBrands);
router.post('/create', upload.array('images'), ProductController.createProduct);
router.get('/id/:id', ProductController.getProductById);
router.get('/:slug', ProductController.getProductBySlug);
router.get('/:id', ProductController.getProductByIdWithVariants);
router.get('/', ProductController.searchProducts);
router.get("/variants/:id", ProductController.getProductVariants);
router.get('/slug/:slug', ProductController.getProductBySlug);


//Update product
// PATCH/products/:id
router.patch('/:id', upload.array('images'), ProductController.updateProduct);

// Delete product
// DELETE/products/:id
router.delete('/:id', ProductController.deleteProduct);

//Add comment
router.post('/:productId/comments', authMiddleware, ProductController.addProductComment);
router.post('/:productId/comments_anonymous', ProductController.addProductComment);
//Get comments
router.get('/:productId/comments', ProductController.getProductComments);


module.exports = router;