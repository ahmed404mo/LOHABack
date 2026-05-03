const userService = require('./users.service');
const ApiResponse = require('../../core/utils/api-response');

const userController = {
  async register(req, res, next) {
    try {
      const result = await userService.register(req.body);
      ApiResponse.success(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  },
  
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await userService.login(email, password);
      ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  },
  
  async getProfile(req, res, next) {
    try {
      const user = await userService.getProfile(req.user.id);
      ApiResponse.success(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;