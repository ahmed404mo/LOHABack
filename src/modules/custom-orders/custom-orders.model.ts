import prisma from '../../core/database/prisma';
import { CustomOrder } from '@prisma/client';

export interface CustomOrderWithUser extends CustomOrder {
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
}

export const customOrderModel = {
  async create(userId: number, size: string, message: string | null, imageUrl: string, imagePublicId: string): Promise<CustomOrder> {
    return prisma.customOrder.create({
      data: {
        userId,
        size,
        message,
        uploadedImage: imageUrl,
        imagePublicId
      }
    });
  },
  
  async findByUser(userId: number): Promise<CustomOrder[]> {
    return prisma.customOrder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  },
  
  async findAll(): Promise<CustomOrderWithUser[]> {
    return prisma.customOrder.findMany({
      include: { user: { select: { name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' }
    }) as Promise<CustomOrderWithUser[]>;
  },
  
  async updateStatus(id: number, status: string): Promise<CustomOrder> {
    const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }
    return prisma.customOrder.update({
      where: { id },
      data: { status }
    });
  },
  
  async findById(id: number): Promise<CustomOrderWithUser | null> {
    return prisma.customOrder.findUnique({
      where: { id },
      include: { user: true }
    }) as Promise<CustomOrderWithUser | null>;
  }
};

export default customOrderModel;