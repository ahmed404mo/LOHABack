const router = require('express').Router();
const orderController = require('./orders.controller');
const { authenticateToken, isAdmin } = require('../../core/middlewares/auth.middleware');

router.post('/', authenticateToken, orderController.createOrder);
router.get('/my-orders', authenticateToken, orderController.getUserOrders);
router.get('/', authenticateToken, isAdmin, orderController.getAllOrders);
router.put('/:id/status', authenticateToken, isAdmin, orderController.updateOrderStatus);

module.exports = router;