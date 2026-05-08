import productModel from './products.model';
import { cloudinary } from '../../core/utils/cloudinary';
import ApiError from '../../core/utils/api-error';
import { Product } from '@prisma/client';

export interface CreateProductData {
  name: string;
  category: string;
  description?: string;
  price: number;
  sizes: string[];
  isBestseller: boolean;
  stock: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export const productService = {
  async getAllProducts(category?: string): Promise<Product[]> {
    return productModel.findAll({ category });
  },
  
  async getProductById(id: string): Promise<Product> {
    const product = await productModel.findById(parseInt(id));
    if (!product) {
      throw new ApiError('Product not found', 404);
    }
    return product;
  },
  
  async createProduct(productData: any, imageFile: Express.Multer.File): Promise<Product> {
    const data = {
      name: productData.name,
      category: productData.category,
      description: productData.description,
      price: parseFloat(productData.price),
      sizes: JSON.parse(productData.sizes),
      imageUrl: imageFile.path,
      imagePublicId: imageFile.filename,
      isBestseller: productData.isBestseller === 'true',
      stock: parseInt(productData.stock)
    };
    
    return productModel.create(data);
  },
  
  async updateProduct(id: string, productData: any, imageFile?: Express.Multer.File): Promise<Product> {
    const productId = parseInt(id);
    const updateData: any = { ...productData };
    
    if (productData.price) updateData.price = parseFloat(productData.price);
    if (productData.sizes) updateData.sizes = JSON.parse(productData.sizes);
    if (productData.isBestseller) updateData.isBestseller = productData.isBestseller === 'true';
    if (productData.stock) updateData.stock = parseInt(productData.stock);
    
    if (imageFile) {
      // Delete old image from Cloudinary
      const oldProduct = await productModel.findById(productId);
      if (oldProduct?.imagePublicId) {
        await cloudinary.uploader.destroy(oldProduct.imagePublicId);
      }
      updateData.imageUrl = imageFile.path;
      updateData.imagePublicId = imageFile.filename;
    }
    
    return productModel.update(productId, updateData);
  },
  
  async deleteProduct(id: string): Promise<Product> {
    const productId = parseInt(id);
    const product = await productModel.findById(productId);
    if (!product) {
      throw new ApiError('Product not found', 404);
    }
    
    // Delete image from Cloudinary
    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }
    
    return productModel.delete(productId);
  }
};

export default productService;