const router = require('express').Router();
const ProductController = require('../controllers/productController');
const upload = require('../middlewares/multer');
const {authMiddleware} = require('../middlewares/authMiddleware');

// ROUTES ĐẶC BIỆT (nên đặt trước)
router.get('/sync', ProductController.syncAllProductsToElasticsearch);
router.get('/filter', ProductController.getProductByFilter);
router.get('/search/', ProductController.searchProductsByElasticSearch);
router.get('/searchByName', ProductController.searchProductByName);
router.get('/searchByBrand', ProductController.searchProductByBrand);
router.get('/searchByCategory', ProductController.searchByCategory);
router.get('/searchByPrice', ProductController.searchByPrice);
router.get('/search/by-rating', ProductController.getProductsByRating);
router.get("/categories", ProductController.getCategories);
router.get("/brands", ProductController.getBrands);
router.get("/variants/:id", ProductController.getProductVariants);
router.get("/slug/:slug", ProductController.getProductBySlug);
router.post('/create', upload.array('images'), ProductController.createProduct);
router.patch('/:id', upload.array('images'), ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);
router.post('/:productId/comments', authMiddleware, ProductController.addProductComment);
router.post('/:productId/comments_anonymous', ProductController.addProductComment);
router.get('/:productId/comments', ProductController.getProductComments);

// ROUTES ĐỘNG đặt sau cùng để tránh override
router.get('/:id', ProductController.getProductByIdWithVariants);
router.get('/:slug', ProductController.getProductBySlug);
router.get('/', ProductController.searchProducts);


module.exports = router;