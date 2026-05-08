import prisma from '../../core/database/prisma';
import { Product, Prisma } from '@prisma/client';

export interface ProductFilters {
  category?: string;
}

export const productModel = {
  async findAll(filters: ProductFilters = {}): Promise<Product[]> {
    const where: Prisma.ProductWhereInput = {};
    if (filters.category && filters.category !== 'all') {
      where.category = filters.category;
    }
    
    return prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  },
  
  async findById(id: number): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  },
  
  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({ data });
  },
  
  async update(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data
    });
  },
  
  async delete(id: number): Promise<Product> {
    return prisma.product.delete({ where: { id } });
  },
  
  async updateStock(productId: number, quantity: number): Promise<Product> {
    return prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } }
    });
  }
};

export default productModel;