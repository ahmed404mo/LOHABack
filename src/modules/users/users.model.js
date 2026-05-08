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
  },
 async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        orders: {
          select: { id: true, total: true, status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  // ✅ تحديث مستخدم
  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        role: data.role
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });
  },

  // ✅ حذف مستخدم
  async delete(id) {
    return prisma.user.delete({
      where: { id }
    });
  }
};


module.exports = userModel;