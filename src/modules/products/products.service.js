const productModel = require('./products.model');
const { cloudinary } = require('../../core/utils/cloudinary');
const ApiError = require('../../core/utils/api-error');

const productService = {
  async getAllProducts(category) {
    return productModel.findAll({ category });
  },
  
  async getProductById(id) {
    const product = await productModel.findById(id);
    if (!product) {
      throw new ApiError('Product not found', 404);
    }
    return product;
  },
  
  async createProduct(productData, imageFile) {
    const data = {
      ...productData,
      price: parseFloat(productData.price),
      sizes: JSON.parse(productData.sizes),
      imageUrl: imageFile.path,
      imagePublicId: imageFile.filename,
      isBestseller: productData.isBestseller === 'true',
      stock: parseInt(productData.stock)
    };
    
    return productModel.create(data);
  },
  
  async updateProduct(id, productData, imageFile) {
    const updateData = { ...productData };
    
    if (productData.price) updateData.price = parseFloat(productData.price);
    if (productData.sizes) updateData.sizes = JSON.parse(productData.sizes);
    if (productData.isBestseller) updateData.isBestseller = productData.isBestseller === 'true';
    if (productData.stock) updateData.stock = parseInt(productData.stock);
    
    if (imageFile) {
      // Delete old image from Cloudinary
      const oldProduct = await productModel.findById(id);
      if (oldProduct?.imagePublicId) {
        await cloudinary.uploader.destroy(oldProduct.imagePublicId);
      }
      updateData.imageUrl = imageFile.path;
      updateData.imagePublicId = imageFile.filename;
    }
    
    return productModel.update(id, updateData);
  },
  
  async deleteProduct(id) {
    const product = await productModel.findById(id);
    if (!product) {
      throw new ApiError('Product not found', 404);
    }
    
    // Delete image from Cloudinary
    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }
    
    return productModel.delete(id);
  }
};

module.exports = productService;