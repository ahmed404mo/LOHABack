const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('./users.model');
const config = require('../../core/config');
const ApiError = require('../../core/utils/api-error');

const userService = {
  async register(userData) {
    const { email, password, name, phone } = userData;
    
    // Check if user exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      throw new ApiError('Email already registered', 400);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await userModel.create({
      email,
      password: hashedPassword,
      name,
      phone,
      role: 'user'
    });
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  },
  
  async login(email, password) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new ApiError('Invalid credentials', 401);
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new ApiError('Invalid credentials', 401);
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  },
  
  async getProfile(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    return user;
  },
  async getAllUsers() {
    return userModel.findAll();
  },

  // ✅ جلب مستخدم بالـ ID
  async getUserById(id) {
    const user = await userModel.findById(parseInt(id));
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    return user;
  },

  // ✅ تحديث مستخدم
  async updateUser(id, data) {
    const user = await userModel.findById(parseInt(id));
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    return userModel.update(parseInt(id), data);
  },

  // ✅ حذف مستخدم
  async deleteUser(id) {
    const user = await userModel.findById(parseInt(id));
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    return userModel.delete(parseInt(id));
  },

  // ✅ تغيير دور المستخدم
  async updateUserRole(id, role) {
    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(role)) {
      throw new ApiError('Invalid role', 400);
    }
    
    const user = await userModel.findById(parseInt(id));
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    return userModel.update(parseInt(id), { role });
  }
};


module.exports = userService;