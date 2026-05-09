const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// ============= CONFIGURATION =============
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer setup for file uploads (memory storage for serverless)
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadCustom = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ============= MIDDLEWARE =============
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============= AUTH MIDDLEWARE =============
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// ============= HELPER FUNCTIONS =============
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    const { Readable } = require('stream');
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

// ============= HELPERS FOR SETTINGS =============
const getOrCreateSettings = async () => {
  let settings = await prisma.setting.findFirst();
  
  if (!settings) {
    settings = await prisma.setting.create({
      data: {} // استخدم القيم الافتراضية من Prisma schema
    });
  }
  
  return settings;
};

// ============= HEALTH & TEST ROUTES =============
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'LOHA API is running',
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working correctly!' });
});

// ============= 👑 USER ROUTES (المدمجة والمنظمة) =============

app.post('/api/users/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, phone: phone || null, role: 'user' }
    });
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { 
        token, 
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } 
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: { 
        token, 
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } 
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        orders: { select: { id: true, total: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: users, count: users.length });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, orders: true }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.put('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    
    const { name, phone, role } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: { name, phone, role },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
    });
    
    res.json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.delete('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    
    await prisma.user.delete({ where: { id } });
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.patch('/api/users/:id/role', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { role } = req.body;
    
    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be "user" or "admin"' });
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });
    
    res.json({ success: true, message: 'User role updated successfully', data: user });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============= PRODUCT ROUTES =============

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query;
    const where = category && category !== 'all' ? { category } : {};
    
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: products, count: products.length });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }
    
    const product = await prisma.product.findUnique({ where: { id } });
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create product (Admin only)
app.post('/api/products', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, category, description, price, sizes, isBestseller, stock } = req.body;
    
    if (!name || !category || !price || !sizes) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    let imageUrl = '';
    let imagePublicId = '';
    
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, 'loha/products');
        imageUrl = result.secure_url;
        imagePublicId = result.public_id;
      } catch (cloudError) {
        console.error('Cloudinary upload error:', cloudError);
      }
    }
    
    const product = await prisma.product.create({
      data: {
        name,
        category,
        description: description || '',
        price: parseFloat(price),
        sizes: JSON.parse(sizes),
        imageUrl,
        imagePublicId,
        isBestseller: isBestseller === 'true',
        stock: parseInt(stock) || 0
      }
    });
    
    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update product (Admin only)
app.put('/api/products/:id', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }
    
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    const { name, category, description, price, sizes, isBestseller, stock } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (sizes) updateData.sizes = JSON.parse(sizes);
    if (isBestseller !== undefined) updateData.isBestseller = isBestseller === 'true';
    if (stock !== undefined) updateData.stock = parseInt(stock);
    
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, 'loha/products');
        updateData.imageUrl = result.secure_url;
        updateData.imagePublicId = result.public_id;
      } catch (cloudError) {
        console.error('Cloudinary upload error:', cloudError);
      }
    }
    
    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });
    
    res.json({ success: true, message: 'Product updated successfully', data: product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete product (Admin only)
app.delete('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }
    
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    if (product.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(product.imagePublicId);
      } catch (cloudError) {
        console.error('Cloudinary delete error:', cloudError);
      }
    }
    
    await prisma.product.delete({ where: { id } });
    
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============= ORDER ROUTES =============

// Create order
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items, total } = req.body;
    
    if (!items || !items.length || !total) {
      return res.status(400).json({ success: false, message: 'Items and total are required' });
    }
    
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        total,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            size: item.size
          }))
        }
      },
      include: { items: true }
    });
    
    res.status(201).json({ success: true, message: 'Order created successfully', data: order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get my orders
app.get('/api/orders/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all orders (Admin only)
app.get('/api/orders', authenticateToken, isAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { 
        user: { select: { name: true, email: true, phone: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update order status (Admin only)
app.put('/api/orders/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });
    
    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============= CUSTOM ORDER ROUTES =============

// Create custom order
app.post('/api/custom-orders', authenticateToken, uploadCustom.single('designImage'), async (req, res) => {
  try {
    const { size, message } = req.body;
    
    if (!size) {
      return res.status(400).json({ success: false, message: 'Size is required' });
    }
    
    let imageUrl = '';
    let imagePublicId = '';
    
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, 'loha/custom-orders');
        imageUrl = result.secure_url;
        imagePublicId = result.public_id;
      } catch (cloudError) {
        console.error('Cloudinary upload error:', cloudError);
      }
    }
    
    const customOrder = await prisma.customOrder.create({
      data: {
        userId: req.user.id,
        size,
        message: message || '',
        uploadedImage: imageUrl,
        imagePublicId,
        status: 'pending'
      }
    });
    
    res.status(201).json({ success: true, message: 'Custom order created successfully', data: customOrder });
  } catch (error) {
    console.error('Create custom order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get my custom orders
app.get('/api/custom-orders/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.customOrder.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get custom orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all custom orders (Admin only)
app.get('/api/custom-orders', authenticateToken, isAdmin, async (req, res) => {
  try {
    const orders = await prisma.customOrder.findMany({
      include: { user: { select: { name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get all custom orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update custom order status (Admin only)
app.put('/api/custom-orders/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const order = await prisma.customOrder.update({
      where: { id },
      data: { status }
    });
    
    res.json({ success: true, message: 'Custom order status updated', data: order });
  } catch (error) {
    console.error('Update custom order status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============= ✨ SETTINGS ROUTES (NEW) ✨ =============

// جلب الإعدادات (Admin only)
app.get('/api/settings', authenticateToken, isAdmin, async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching settings' });
  }
});

// تحديث الإعدادات (Admin only)
app.put('/api/settings', authenticateToken, isAdmin, async (req, res) => {
  try {
    const {
      siteName, siteDescription, siteLogo,
      contactEmail, contactPhone, whatsappNumber,
      facebookUrl, instagramUrl, tiktokUrl,
      address, shippingFee, freeShippingMin, returnPolicy
    } = req.body;
    
    let settings = await prisma.setting.findFirst();
    
    if (!settings) {
      settings = await prisma.setting.create({
        data: {
          siteName, siteDescription, siteLogo,
          contactEmail, contactPhone, whatsappNumber,
          facebookUrl, instagramUrl, tiktokUrl,
          address, shippingFee, freeShippingMin, returnPolicy
        }
      });
    } else {
      settings = await prisma.setting.update({
        where: { id: settings.id },
        data: {
          siteName, siteDescription, siteLogo,
          contactEmail, contactPhone, whatsappNumber,
          facebookUrl, instagramUrl, tiktokUrl,
          address, shippingFee, freeShippingMin, returnPolicy
        }
      });
    }
    
    res.json({ success: true, message: 'Settings saved successfully', data: settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Server error while saving settings' });
  }
});

// إعادة تعيين الإعدادات للقيم الافتراضية (Admin only)
app.post('/api/settings/reset', authenticateToken, isAdmin, async (req, res) => {
  try {
    // حذف جميع الإعدادات الموجودة
    await prisma.setting.deleteMany();
    
    // إنشاء إعدادات جديدة بالقيم الافتراضية
    const defaultSettings = await prisma.setting.create({
      data: {} // تستخدم القيم الافتراضية من Prisma schema
    });
    
    res.json({ success: true, message: 'Settings reset to default successfully', data: defaultSettings });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({ success: false, message: 'Server error while resetting settings' });
  }
});

// ============= START SERVER =============
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 API Base URL: http://localhost:${PORT}/api`);
  console.log(`\n📋 User Endpoints:`);
  console.log(`   POST   /api/users/register   - Register new user`);
  console.log(`   POST   /api/users/login      - Login user`);
  console.log(`   GET    /api/users/me         - Get my profile`);
  console.log(`   GET    /api/users            - Get all users (Admin)`);
  console.log(`   GET    /api/users/:id        - Get user by ID (Admin)`);
  console.log(`   PUT    /api/users/:id        - Update user (Admin)`);
  console.log(`   DELETE /api/users/:id        - Delete user (Admin)`);
  console.log(`   PATCH  /api/users/:id/role   - Update user role (Admin)`);
  console.log(`\n📋 Product Endpoints:`);
  console.log(`   GET    /api/products         - Get all products`);
  console.log(`   GET    /api/products/:id     - Get single product`);
  console.log(`   POST   /api/products         - Create product (Admin)`);
  console.log(`   PUT    /api/products/:id     - Update product (Admin)`);
  console.log(`   DELETE /api/products/:id     - Delete product (Admin)`);
  console.log(`\n📋 Order Endpoints:`);
  console.log(`   POST   /api/orders           - Create order`);
  console.log(`   GET    /api/orders/my-orders - Get my orders`);
  console.log(`   GET    /api/orders           - Get all orders (Admin)`);
  console.log(`   PUT    /api/orders/:id/status - Update order status (Admin)`);
  console.log(`\n📋 Custom Order Endpoints:`);
  console.log(`   POST   /api/custom-orders    - Create custom order`);
  console.log(`   GET    /api/custom-orders/my-orders - Get my custom orders`);
  console.log(`   GET    /api/custom-orders    - Get all custom orders (Admin)`);
  console.log(`   PUT    /api/custom-orders/:id/status - Update custom order status (Admin)`);
  console.log(`\n📋 Settings Endpoints (NEW):`);
  console.log(`   GET    /api/settings         - Get settings (Admin)`);
  console.log(`   PUT    /api/settings         - Update settings (Admin)`);
  console.log(`   POST   /api/settings/reset   - Reset settings to default (Admin)`);
  console.log(`\n✨ All routes are ready!\n`);
});

module.exports = app;