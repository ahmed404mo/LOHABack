import { Router } from 'express';
import productController from './products.controller';
import { authenticateToken, isAdmin } from '../../core/middlewares/auth.middleware';
import { uploadProduct } from '../../core/utils/cloudinary';

const router = Router();

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', authenticateToken, isAdmin, uploadProduct.single('image'), productController.createProduct);
router.put('/:id', authenticateToken, isAdmin, uploadProduct.single('image'), productController.updateProduct);
router.delete('/:id', authenticateToken, isAdmin, productController.deleteProduct);

export default router;