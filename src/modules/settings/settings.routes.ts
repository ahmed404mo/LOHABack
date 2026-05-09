import { Router } from 'express';
import settingsController from './settings.controller';
import { authenticateToken, isAdmin } from '../../core/middlewares/auth.middleware';

const router = Router();

// جميع routes settings محمية بـ Admin فقط
router.use(authenticateToken, isAdmin);

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);
router.post('/reset', settingsController.resetSettings);

export default router;