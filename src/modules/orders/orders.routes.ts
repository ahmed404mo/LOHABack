import { Router } from 'express';
import orderController from './orders.controller';
import { authenticateToken, isAdmin } from '../../core/middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, orderController.createOrder);
router.get('/my-orders', authenticateToken, orderController.getUserOrders);
router.get('/', authenticateToken, isAdmin, orderController.getAllOrders);
router.put('/:id/status', authenticateToken, isAdmin, orderController.updateOrderStatus);

export default router;