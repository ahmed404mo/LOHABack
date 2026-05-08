import { Request, Response, NextFunction } from 'express';
import orderService from './orders.service';
import ApiResponse from '../../core/utils/api-response';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

export const orderController = {
  async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { items, total } = req.body;
      const order = await orderService.createOrder(req.user!.id, items, total);
      ApiResponse.success(res, order, 'Order created successfully', 201);
    } catch (error) {
      next(error);
    }
  },
  
  async getUserOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orders = await orderService.getUserOrders(req.user!.id);
      ApiResponse.success(res, orders, 'Orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  },
  
  async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await orderService.getAllOrders();
      ApiResponse.success(res, orders, 'All orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  },
  
  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(req.params.id, status);
      ApiResponse.success(res, order, 'Order status updated successfully');
    } catch (error) {
      next(error);
    }
  }
};

export default orderController;