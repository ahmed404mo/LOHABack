const productService = require('./products.service');
const ApiResponse = require('../../core/utils/api-response');

const productController = {
  async getAllProducts(req, res, next) {
    try {
      const { category } = req.query;
      const products = await productService.getAllProducts(category);
      ApiResponse.success(res, products, 'Products retrieved successfully');
    } catch (error) {
      next(error);
    }
  },
  
  async getProductById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      ApiResponse.success(res, product, 'Product retrieved successfully');
    } catch (error) {
      next(error);
    }
  },
  
  async createProduct(req, res, next) {
    try {
      const product = await productService.createProduct(req.body, req.file);
      ApiResponse.success(res, product, 'Product created successfully', 201);
    } catch (error) {
      next(error);
    }
  },
  
  async updateProduct(req, res, next) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body, req.file);
      ApiResponse.success(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  },
  
  async deleteProduct(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id);
      ApiResponse.success(res, null, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = productController;