const router = require('express').Router();
const ProductController = require('../controllers/productController');
const upload = require('../middlewares/multer');

//Create and find products
router.get('/', ProductController.searchProducts);
router.get('/search', ProductController.searchProducts);
router.get('/searchByName', ProductController.searchProductByName);
router.get('/searchByBrand', ProductController.searchProductByBrand);
router.get('/searchByCategory', ProductController.searchByCategory);
router.get('/searchByPrice', ProductController.searchByPrice);
router.get("/categories", ProductController.getCategories);
router.get("/brands", ProductController.getBrands);
router.get('/:id', ProductController.getProductByIdWithVariants);
router.post('/create', upload.array('images'), ProductController.createProduct);
router.get("/variants/:id", ProductController.getProductVariants);


//Update product
// PATCH/products/:id
router.patch('/:id', upload.array('images'), ProductController.updateProduct);

// Delete product
// DELETE/products/:id
router.delete('/:id', ProductController.deleteProduct);

module.exports = router;