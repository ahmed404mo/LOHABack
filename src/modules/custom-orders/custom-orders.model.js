const prisma = require('../../core/database/prisma');

const customOrderModel = {
  async create(userId, size, message, imageUrl, imagePublicId) {
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
  
  async findByUser(userId) {
    return prisma.customOrder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  },
  
  async findAll() {
    return prisma.customOrder.findMany({
      include: { user: { select: { name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' }
    });
  },
  
  async updateStatus(id, status) {
    const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }
    return prisma.customOrder.update({
      where: { id: parseInt(id) },
      data: { status }
    });
  },
  
  async findById(id) {
    return prisma.customOrder.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });
  }
};

module.exports = customOrderModel;