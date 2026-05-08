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
  },
   async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      ApiResponse.success(res, users, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }
      ApiResponse.success(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  // ✅ تحديث مستخدم
  async updateUser(req, res, next) {
    try {
      const { name, phone, role } = req.body;
      const user = await userService.updateUser(req.params.id, { name, phone, role });
      ApiResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  },

  // ✅ حذف مستخدم
  async deleteUser(req, res, next) {
    try {
      await userService.deleteUser(req.params.id);
      ApiResponse.success(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateUserRole(req, res, next) {
    try {
      const { role } = req.body;
      const user = await userService.updateUserRole(req.params.id, role);
      ApiResponse.success(res, user, 'User role updated successfully');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;