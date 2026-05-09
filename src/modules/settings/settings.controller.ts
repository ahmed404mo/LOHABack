import { Request, Response, NextFunction } from 'express';
import settingsService from './settings.service';
import ApiResponse from '../../core/utils/api-response';

export const settingsController = {
  // جلب الإعدادات
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getSettings();
      ApiResponse.success(res, settings, 'Settings retrieved successfully');
    } catch (error) {
      next(error);
    }
  },
  
  // تحديث الإعدادات
  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.updateSettings(req.body);
      ApiResponse.success(res, settings, 'Settings updated successfully');
    } catch (error) {
      next(error);
    }
  },
  
  // إعادة تعيين الإعدادات
  async resetSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.resetSettings();
      ApiResponse.success(res, settings, 'Settings reset to default successfully');
    } catch (error) {
      next(error);
    }
  }
};

export default settingsController;