import express from 'express';
import {
  getSettingsHandler,
  updateSettingsHandler,
  resetSettingsHandler,
} from './settings.controller';
import { updateSettingsSchema } from './settings.validation';
import { validate } from '../../core/middlewares/validate.middleware';
import { protect, admin } from '../../core/middlewares/auth.middleware';

const router = express.Router();

// جميع routes settings محمية بـ Admin فقط
router.use(protect, admin);

router.get('/', getSettingsHandler);
router.put('/', validate(updateSettingsSchema), updateSettingsHandler);
router.post('/reset', resetSettingsHandler);

export default router;