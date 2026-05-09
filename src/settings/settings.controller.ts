import { Request, Response } from 'express';
import { getSettings, updateSettings, resetSettings, ISettingsInput } from './settings.service';

// جلب الإعدادات
export const getSettingsHandler = async (req: Request, res: Response) => {
  try {
    const settings = await getSettings();
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الإعدادات',
    });
  }
};

// تحديث الإعدادات
export const updateSettingsHandler = async (req: Request, res: Response) => {
  try {
    const data: ISettingsInput = req.body;
    const updatedSettings = await updateSettings(data);
    
    res.status(200).json({
      success: true,
      message: 'تم حفظ الإعدادات بنجاح',
      data: updatedSettings,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حفظ الإعدادات',
    });
  }
};

// إعادة تعيين الإعدادات
export const resetSettingsHandler = async (req: Request, res: Response) => {
  try {
    const defaultSettings = await resetSettings();
    res.status(200).json({
      success: true,
      message: 'تم إعادة تعيين الإعدادات بنجاح',
      data: defaultSettings,
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إعادة تعيين الإعدادات',
    });
  }
};