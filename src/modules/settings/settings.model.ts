import prisma from '../../core/database/prisma';
import { Setting, Prisma } from '@prisma/client';

export const settingsModel = {
  // جلب الإعدادات (تكون record واحدة فقط)
  async findFirst(): Promise<Setting | null> {
    return prisma.setting.findFirst();
  },
  
  // إنشاء إعدادات جديدة
  async create(data: Prisma.SettingCreateInput): Promise<Setting> {
    return prisma.setting.create({ data });
  },
  
  // تحديث الإعدادات
  async update(id: number, data: Prisma.SettingUpdateInput): Promise<Setting> {
    return prisma.setting.update({
      where: { id },
      data
    });
  },
  
  // حذف كل الإعدادات (لإعادة التعيين)
  async deleteAll(): Promise<{ count: number }> {
    return prisma.setting.deleteMany();
  }
};

export default settingsModel;