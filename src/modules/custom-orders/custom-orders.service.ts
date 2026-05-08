import customOrderModel from './custom-orders.model';
import ApiError from '../../core/utils/api-error';
import { CustomOrder } from '@prisma/client';

export const customOrderService = {
  async createCustomOrder(
    userId: number,
    size: string,
    message: string | null,
    imageFile: Express.Multer.File | undefined  // ✅ undefined عشان نعمل validation
  ): Promise<CustomOrder> {
    // ✅ Validate image exists
    if (!imageFile) {
      throw new ApiError('Design image is required', 400);
    }

    return customOrderModel.create(
      userId,
      size,
      message,
      imageFile.path,
      imageFile.filename
    );
  },

  async getUserCustomOrders(userId: number): Promise<CustomOrder[]> {
    return customOrderModel.findByUser(userId);
  },

  async getAllCustomOrders(): Promise<any[]> {
    return customOrderModel.findAll();
  },

  async updateCustomOrderStatus(orderId: string, status: string): Promise<CustomOrder> {
    const order = await customOrderModel.findById(parseInt(orderId));
    if (!order) {
      throw new ApiError('Custom order not found', 404);
    }
    return customOrderModel.updateStatus(parseInt(orderId), status);
  }
};

export default customOrderService;