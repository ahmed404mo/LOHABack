import { Router } from 'express';
import userController from './users.controller';
import { authenticateToken, isAdmin } from '../../core/middlewares/auth.middleware';
import { validate } from '../../core/middlewares/validation.middleware';
import { registerSchema, loginSchema } from './users.validation';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);

// Protected routes
router.get('/me', authenticateToken, userController.getProfile);
router.get('/', authenticateToken, isAdmin, userController.getAllUsers);
router.get('/:id', authenticateToken, isAdmin, userController.getUserById);
router.put('/:id', authenticateToken, isAdmin, userController.updateUser);
router.delete('/:id', authenticateToken, isAdmin, userController.deleteUser);
router.patch('/:id/role', authenticateToken, isAdmin, userController.updateUserRole);

export default router;