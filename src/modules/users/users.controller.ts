import { Request, Response, NextFunction } from 'express';
import userService from './users.service';
import ApiResponse from '../../core/utils/api-response';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

export const userController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.register(req.body);
      ApiResponse.success(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await userService.login(email, password);
      ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.user!.id);
      ApiResponse.success(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      ApiResponse.success(res, users, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(parseInt(req.params.id));
      ApiResponse.success(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, phone, role } = req.body;
      const user = await userService.updateUser(parseInt(req.params.id), { name, phone, role });
      ApiResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.deleteUser(parseInt(req.params.id));
      ApiResponse.success(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.body;
      const user = await userService.updateUserRole(parseInt(req.params.id), role);
      ApiResponse.success(res, user, 'User role updated successfully');
    } catch (error) {
      next(error);
    }
  }
};

export default userController;