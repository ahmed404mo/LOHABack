const router = require('express').Router();
const userController = require('./users.controller');
const { authenticateToken } = require('../../core/middlewares/auth.middleware');
const validate = require('../../core/middlewares/validation.middleware');
const { registerSchema, loginSchema } = require('./users.validation');

router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);
router.get('/me', authenticateToken, userController.getProfile);

module.exports = router;