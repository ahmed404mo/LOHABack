const router = require('express').Router();
const productController = require('./products.controller');
const { authenticateToken, isAdmin } = require('../../core/middlewares/auth.middleware');
const { uploadProduct } = require('../../core/utils/cloudinary');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', authenticateToken, isAdmin, uploadProduct.single('image'), productController.createProduct);
router.put('/:id', authenticateToken, isAdmin, uploadProduct.single('image'), productController.updateProduct);
router.delete('/:id', authenticateToken, isAdmin, productController.deleteProduct);

module.exports = router;