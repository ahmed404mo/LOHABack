const router = require('express').Router();
const customOrderController = require('./custom-orders.controller');
const { authenticateToken, isAdmin } = require('../../core/middlewares/auth.middleware');
const { uploadCustomOrder } = require('../../core/utils/cloudinary');

router.post('/', authenticateToken, uploadCustomOrder.single('designImage'), customOrderController.createCustomOrder);
router.get('/my-orders', authenticateToken, customOrderController.getUserCustomOrders);
router.get('/', authenticateToken, isAdmin, customOrderController.getAllCustomOrders);
router.put('/:id/status', authenticateToken, isAdmin, customOrderController.updateCustomOrderStatus);

module.exports = router;