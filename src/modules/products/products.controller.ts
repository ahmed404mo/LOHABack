import { Request, Response, NextFunction } from 'express';
import productService from './products.service';
import ApiResponse from '../../core/utils/api-response';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

export const productController = {
  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.query;
      const products = await productService.getAllProducts(category as string);
      ApiResponse.success(res, products, 'Products retrieved successfully');
    } catch (error) {
      next(error);
    }
  },
  
  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getProductById(req.params.id);
      ApiResponse.success(res, product, 'Product retrieved successfully');
    } catch (error) {
      next(error);
    }
  },
  
  async createProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await productService.createProduct(req.body, req.file as Express.Multer.File);
      ApiResponse.success(res, product, 'Product created successfully', 201);
    } catch (error) {
      next(error);
    }
  },
  
  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body, req.file as Express.Multer.File);
      ApiResponse.success(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  },
  
  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.deleteProduct(req.params.id);
      ApiResponse.success(res, null, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }
};

export default productController;