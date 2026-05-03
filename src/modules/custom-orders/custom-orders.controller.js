const customOrderService = require('./custom-orders.service');
const ApiResponse = require('../../core/utils/api-response');

const customOrderController = {
  async createCustomOrder(req, res, next) {
    try {
      const { size, message } = req.body;
      const order = await customOrderService.createCustomOrder(
        req.user.id,
        size,
        message,
        req.file
      );
      ApiResponse.success(res, order, 'Custom order created successfully', 201);
    } catch (error) {
      next(error);
    }
  },
  
  async getUserCustomOrders(req, res, next) {
    try {
      const orders = await customOrderService.getUserCustomOrders(req.user.id);
      ApiResponse.success(res, orders, 'Custom orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  },
  
  async getAllCustomOrders(req, res, next) {
    try {
      const orders = await customOrderService.getAllCustomOrders();
      ApiResponse.success(res, orders, 'All custom orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  },
  
  async updateCustomOrderStatus(req, res, next) {
    try {
      const { status } = req.body;
      const order = await customOrderService.updateCustomOrderStatus(req.params.id, status);
      ApiResponse.success(res, order, 'Custom order status updated successfully');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = customOrderController;