import { Router } from 'express';
import customOrderController from './custom-orders.controller';
import { authenticateToken, isAdmin } from '../../core/middlewares/auth.middleware';
import { uploadCustomOrder } from '../../core/utils/cloudinary';

const router = Router();

router.post('/', authenticateToken, uploadCustomOrder.single('designImage'), customOrderController.createCustomOrder);
router.get('/my-orders', authenticateToken, customOrderController.getUserCustomOrders);
router.get('/', authenticateToken, isAdmin, customOrderController.getAllCustomOrders);
router.put('/:id/status', authenticateToken, isAdmin, customOrderController.updateCustomOrderStatus);

export default router;