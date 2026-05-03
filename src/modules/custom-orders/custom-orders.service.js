const customOrderModel = require('./custom-orders.model');
const { cloudinary } = require('../../core/utils/cloudinary');
const ApiError = require('../../core/utils/api-error');

const customOrderService = {
  async createCustomOrder(userId, size, message, imageFile) {
    return customOrderModel.create(
      userId, 
      size, 
      message, 
      imageFile.path, 
      imageFile.filename
    );
  },
  
  async getUserCustomOrders(userId) {
    return customOrderModel.findByUser(userId);
  },
  
  async getAllCustomOrders() {
    return customOrderModel.findAll();
  },
  
  async updateCustomOrderStatus(orderId, status) {
    const order = await customOrderModel.findById(orderId);
    if (!order) {
      throw new ApiError('Custom order not found', 404);
    }
    return customOrderModel.updateStatus(orderId, status);
  }
};

module.exports = customOrderService;