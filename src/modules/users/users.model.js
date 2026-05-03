const prisma = require('../../core/database/prisma');

const userModel = {
  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },
  
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
    });
  },
  
  async create(data) {
    return prisma.user.create({ data });
  },
  
  async update(id, data) {
    return prisma.user.update({ where: { id }, data });
  }
};

module.exports = userModel;