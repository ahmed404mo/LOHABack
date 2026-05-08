import { Request, Response, NextFunction } from 'express';
import customOrderService from './custom-orders.service';
import ApiResponse from '../../core/utils/api-response';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

export const customOrderController = {
  async createCustomOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { size, message } = req.body;
      const order = await customOrderService.createCustomOrder(
        req.user!.id,
        size,
        message,
        req.file as Express.Multer.File
      );
      ApiResponse.success(res, order, 'Custom order created successfully', 201);
    } catch (error) {
      next(error);
    }
  },
  
  async getUserCustomOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orders = await customOrderService.getUserCustomOrders(req.user!.id);
      ApiResponse.success(res, orders, 'Custom orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  },
  
  async getAllCustomOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await customOrderService.getAllCustomOrders();
      ApiResponse.success(res, orders, 'All custom orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  },
  
  async updateCustomOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const order = await customOrderService.updateCustomOrderStatus(req.params.id, status);
      ApiResponse.success(res, order, 'Custom order status updated successfully');
    } catch (error) {
      next(error);
    }
  }
};

export default customOrderController;