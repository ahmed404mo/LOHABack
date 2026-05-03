const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');

const app = express();
const prisma = new PrismaClient();

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

// Auth middleware
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

// Helper: Upload to Cloudinary
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

// ============= HEALTH & TEST =============
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

// ============= AUTH ROUTES =============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name, 
        phone: phone || null, 
        role: 'user' 
      }
    });
    
    // Generate token
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
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          phone: user.phone,
          role: user.role 
        } 
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
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
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          phone: user.phone,
          role: user.role 
        } 
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get current user profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
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
    
    // Validation
    if (!name || !category || !price || !sizes) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    let imageUrl = '';
    let imagePublicId = '';
    
    // Upload image to Cloudinary if provided
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, 'loha/products');
        imageUrl = result.secure_url;
        imagePublicId = result.public_id;
      } catch (cloudError) {
        console.error('Cloudinary upload error:', cloudError);
        // Continue without image
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
    if (isBestseller) updateData.isBestseller = isBestseller === 'true';
    if (stock) updateData.stock = parseInt(stock);
    
    // Upload new image if provided
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
    
    // Delete image from Cloudinary if exists
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

// ============= EXPORT =============
module.exports = app;