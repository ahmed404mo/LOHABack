import orderModel from './orders.model';
import productModel from '../products/products.model';
import ApiError from '../../core/utils/api-error';
import { Order } from '@prisma/client';

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
  size: string;
}

export const orderService = {
  async createOrder(userId: number, items: OrderItem[], total: number): Promise<any> {
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

  async getUserOrders(userId: number): Promise<any[]> {
    return orderModel.findByUser(userId);
  },

  async getAllOrders(): Promise<any[]> {
    return orderModel.findAll();
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new ApiError('Invalid status', 400);
    }

    const order = await orderModel.findById(parseInt(orderId));
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    return orderModel.updateStatus(parseInt(orderId), status);
  }
};

export default orderService;