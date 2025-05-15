const router = require('express').Router();
const ProductController = require('../controllers/productController');
const upload = require('../middlewares/multer');

//Create and find products
router.get('/sync', ProductController.syncAllProductsToElasticsearch)
router.get('/search/', ProductController.searchProductsByElasticSearch);
router.get('/searchByName', ProductController.searchProductByName);
router.get('/searchByBrand', ProductController.searchProductByBrand);
router.get('/searchByCategory', ProductController.searchByCategory);
router.get('/searchByPrice', ProductController.searchByPrice);
router.get('/filter', ProductController.getProductByFilter);
router.get("/variants/:id", ProductController.getProductVariants);
router.get('/:id', ProductController.getProductByIdWithVariants);
router.post('/create', upload.array('images'), ProductController.createProduct);
router.get('/', ProductController.searchProducts);

//Update product
// PATCH/products/:id
router.patch('/:id', upload.array('images'), ProductController.updateProduct);

// Delete product
// DELETE/products/:id
router.delete('/:id', ProductController.deleteProduct);

module.exports = router;