const orderService = require('./orders.service');
const ApiResponse = require('../../core/utils/api-response');

const orderController = {
  async createOrder(req, res, next) {
    try {
      const { items, total } = req.body;
      const order = await orderService.createOrder(req.user.id, items, total);
      ApiResponse.success(res, order, 'Order created successfully', 201);
    } catch (error) {
      next(error);
    }
  },
  
  async getUserOrders(req, res, next) {
    try {
      const orders = await orderService.getUserOrders(req.user.id);
      ApiResponse.success(res, orders, 'Orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  },
  
  async getAllOrders(req, res, next) {
    try {
      const orders = await orderService.getAllOrders();
      ApiResponse.success(res, orders, 'All orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  },
  
  async updateOrderStatus(req, res, next) {
    try {
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(req.params.id, status);
      ApiResponse.success(res, order, 'Order status updated successfully');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = orderController;