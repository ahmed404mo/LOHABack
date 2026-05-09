import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
  // بيانات عامة
  siteName: string;
  siteDescription: string;
  siteLogo: string;
  
  // معلومات الاتصال
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  
  // وسائل التواصل
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  
  // العنوان
  address: string;
  
  // الشحن
  shippingFee: number;
  freeShippingMin: number;
  
  // سياسات
  returnPolicy: string;
  
  // metadata
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    // عام
    siteName: { type: String, default: 'LOHA', required: true },
    siteDescription: { type: String, default: '', required: true },
    siteLogo: { type: String, default: '' },
    
    // اتصال
    contactEmail: { type: String, default: '', lowercase: true, trim: true },
    contactPhone: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    
    // سوشيال
    facebookUrl: { type: String, default: '' },
    instagramUrl: { type: String, default: '' },
    tiktokUrl: { type: String, default: '' },
    
    // عنوان
    address: { type: String, default: '' },
    
    // شحن
    shippingFee: { type: Number, default: 50, min: 0 },
    freeShippingMin: { type: Number, default: 500, min: 0 },
    
    // سياسات
    returnPolicy: { type: String, default: '' },
  },
  { timestamps: true }
);

// التأكد من وجود إعدادات افتراضية واحدة فقط
SettingSchema.statics.initDefaults = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    await this.create({
      siteName: 'LOHA',
      siteDescription: 'لوحات فنية حصرية مصنوعة بالكامل باليد، تحمل روح الخط العربي والألوان الفاخرة',
      contactEmail: 'saraabdullwhab606@gmail.com',
      contactPhone: '01006230353',
      whatsappNumber: '201006230353',
      address: 'القاهرة، مصر',
      shippingFee: 50,
      freeShippingMin: 500,
      returnPolicy: 'يمكن استبدال المنتج خلال 30 يوم من تاريخ الشراء بشرط أن يكون بحالة جديدة',
    });
  }
};

export default mongoose.model<ISetting>('Setting', SettingSchema);