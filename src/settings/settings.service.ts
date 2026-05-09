import prisma from '../../core/database/prisma.client';

export interface ISettingsInput {
  siteName?: string;
  siteDescription?: string;
  siteLogo?: string;
  contactEmail?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  address?: string;
  shippingFee?: number;
  freeShippingMin?: number;
  returnPolicy?: string;
}

// جلب الإعدادات (أول ريكورد في الجدول)
export const getSettings = async () => {
  // نجيب أول إعدادات موجودة، ولو مفيش ننشئ واحدة
  let settings = await prisma.setting.findFirst();
  
  if (!settings) {
    settings = await prisma.setting.create({
      data: {}, // استخدم القيم الافتراضية من الـ schema
    });
  }
  
  return settings;
};

// تحديث الإعدادات
export const updateSettings = async (data: ISettingsInput) => {
  let settings = await prisma.setting.findFirst();
  
  if (!settings) {
    // لو مفيش إعدادات، ننشئ واحدة جديدة بالبيانات
    settings = await prisma.setting.create({
      data: data as any,
    });
  } else {
    // تحديث الإعدادات الموجودة
    settings = await prisma.setting.update({
      where: { id: settings.id },
      data,
    });
  }
  
  return settings;
};

// إعادة تعيين الإعدادات للقيم الافتراضية
export const resetSettings = async () => {
  const defaultSettings = {
    siteName: 'LOHA',
    siteDescription: 'لوحات فنية حصرية مصنوعة بالكامل باليد، تحمل روح الخط العربي والألوان الفاخرة',
    siteLogo: '',
    contactEmail: 'saraabdullwhab606@gmail.com',
    contactPhone: '01006230353',
    whatsappNumber: '201006230353',
    facebookUrl: 'https://facebook.com/loha',
    instagramUrl: 'https://instagram.com/loha_art',
    tiktokUrl: 'https://tiktok.com/@loha_art',
    address: 'القاهرة، مصر',
    shippingFee: 50,
    freeShippingMin: 500,
    returnPolicy: 'يمكن استبدال المنتج خلال 30 يوم من تاريخ الشراء بشرط أن يكون بحالة جديدة',
  };
  
  // حذف كل الإعدادات الموجودة
  await prisma.setting.deleteMany();
  
  // إنشاء إعدادات جديدة بالقيم الافتراضية
  const newSettings = await prisma.setting.create({
    data: defaultSettings,
  });
  
  return newSettings;
};