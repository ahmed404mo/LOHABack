const prisma = require('../../core/database/prisma');

const orderModel = {
  async create(userId, total, items) {
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
    });
  },
  
  async findByUser(userId) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
  },
  
  async findAll() {
    return prisma.order.findMany({
      include: { 
        user: { select: { name: true, email: true, phone: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  },
  
  async updateStatus(id, status) {
    return prisma.order.update({
      where: { id: parseInt(id) },
      data: { status }
    });
  },
  
  async findById(id) {
    return prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: { include: { product: true } }, user: true }
    });
  }
};

module.exports = orderModel;