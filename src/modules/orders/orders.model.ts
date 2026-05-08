import prisma from '../../core/database/prisma';
import { Order, OrderItem, Prisma } from '@prisma/client';

export interface OrderWithDetails extends Order {
  items: (OrderItem & { product: any })[];
  user: any;
}

export const orderModel = {
  async create(userId: number, total: number, items: any[]): Promise<OrderWithDetails> {
    return prisma.order.create({
      data: {
        userId,
        total,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            size: item.size
          }))
        }
      },
      include: { items: { include: { product: true } } }
    }) as Promise<OrderWithDetails>;
  },
  
  async findByUser(userId: number): Promise<OrderWithDetails[]> {
    return prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    }) as Promise<OrderWithDetails[]>;
  },
  
  async findAll(): Promise<OrderWithDetails[]> {
    return prisma.order.findMany({
      include: { 
        user: { select: { name: true, email: true, phone: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    }) as Promise<OrderWithDetails[]>;
  },
  
  async updateStatus(id: number, status: string): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: { status }
    });
  },
  
  async findById(id: number): Promise<OrderWithDetails | null> {
    return prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, user: true }
    }) as Promise<OrderWithDetails | null>;
  }
};

export default orderModel;