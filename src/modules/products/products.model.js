const prisma = require('../../core/database/prisma');

const productModel = {
  async findAll(filters = {}) {
    const where = {};
    if (filters.category && filters.category !== 'all') {
      where.category = filters.category;
    }
    
    return prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  },
  
  async findById(id) {
    return prisma.product.findUnique({ where: { id: parseInt(id) } });
  },
  
  async create(data) {
    return prisma.product.create({ data });
  },
  
  async update(id, data) {
    return prisma.product.update({
      where: { id: parseInt(id) },
      data
    });
  },
  
  async delete(id) {
    return prisma.product.delete({ where: { id: parseInt(id) } });
  },
  
  async updateStock(productId, quantity) {
    return prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } }
    });
  }
};

module.exports = productModel;