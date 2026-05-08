const router = require('express').Router();
const userController = require('./users.controller');
const { authenticateToken, isAdmin } = require('../../core/middlewares/auth.middleware');
const validate = require('../../core/middlewares/validation.middleware');
const { registerSchema, loginSchema } = require('./users.validation');

// الموجودة بالفعل
router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);
router.get('/me', authenticateToken, userController.getProfile);

// ✅ أضف هذه النقاط الجديدة
router.get('/', authenticateToken, isAdmin, userController.getAllUsers);        // جلب جميع المستخدمين
router.get('/:id', authenticateToken, isAdmin, userController.getUserById);     // جلب مستخدم محدد
router.put('/:id', authenticateToken, isAdmin, userController.updateUser);      // تحديث مستخدم
router.delete('/:id', authenticateToken, isAdmin, userController.deleteUser);   // حذف مستخدم
router.patch('/:id/role', authenticateToken, isAdmin, userController.updateUserRole); // تغيير الدور

module.exports = router;