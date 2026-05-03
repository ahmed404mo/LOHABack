const orderModel = require('./orders.model');
const productModel = require('../products/products.model');
const ApiError = require('../../core/utils/api-error');

const orderService = {
  async createOrder(userId, items, total) {
    // Validate stock
    for (const item of items) {
      const product = await productModel.findById(item.productId);
      if (!product) {
        throw new ApiError(`Product ${item.productId} not found`, 404);
      }
      if (product.stock < item.quantity) {
        throw new ApiError(`Insufficient stock for product: ${product.name}`, 400);
      }
    }
    
    // Create order
    const order = await orderModel.create(userId, total, items);
    
    // Update stock
    for (const item of items) {
      await productModel.updateStock(item.productId, item.quantity);
    }
    
    return order;
  },
  
  async getUserOrders(userId) {
    return orderModel.findByUser(userId);
  },
  
  async getAllOrders() {
    return orderModel.findAll();
  },
  
  async updateOrderStatus(orderId, status) {
    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new ApiError('Invalid status', 400);
    }
    
    const order = await orderModel.findById(orderId);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }
    
    return orderModel.updateStatus(orderId, status);
  }
};

module.exports = orderService;