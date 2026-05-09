import settingsModel from './settings.model';
import { Setting } from '@prisma/client';

export interface SettingsInput {
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

// الإعدادات الافتراضية
const defaultSettings: SettingsInput = {
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

export const settingsService = {
  // جلب الإعدادات (تنشئ default لو مش موجودة)
  async getSettings(): Promise<Setting> {
    let settings = await settingsModel.findFirst();
    
    if (!settings) {
      settings = await settingsModel.create(defaultSettings);
    }
    
    return settings;
  },
  
  // تحديث الإعدادات
  async updateSettings(data: SettingsInput): Promise<Setting> {
    let settings = await settingsModel.findFirst();
    
    if (!settings) {
      // لو مفيش إعدادات، ننشئ واحدة جديدة بالبيانات
      return await settingsModel.create({ ...defaultSettings, ...data });
    }
    
    // تحديث الحقول الموجودة فقط
    return await settingsModel.update(settings.id, data);
  },
  
  // إعادة تعيين الإعدادات للقيم الافتراضية
  async resetSettings(): Promise<Setting> {
    await settingsModel.deleteAll();
    return await settingsModel.create(defaultSettings);
  }
};

export default settingsService;