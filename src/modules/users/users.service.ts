import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from './users.model';
import config from '../../core/config';
import ApiError from '../../core/utils/api-error';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export const userService = {
  async register(userData: RegisterData): Promise<LoginResponse> {
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
      phone: phone || null,
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

  async login(email: string, password: string): Promise<LoginResponse> {
    console.log('\n========== LOGIN ATTEMPT ==========');
    console.log('Email:', email);
    console.log('Password provided:', password);

    const user = await userModel.findByEmail(email);
    if (!user) {
      console.log('❌ User not found');
      throw new ApiError('Invalid credentials', 401);
    }

    console.log('✅ User found:', user.email);
    console.log('Stored hash:', user.password);

    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValid);

    if (!isValid) {
      console.log('❌ Invalid password');
      throw new ApiError('Invalid credentials', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    console.log('✅ Login successful');
    console.log('=====================================\n');

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

  async getProfile(userId: number): Promise<Partial<any> | null> {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    return user;
  },

  async getAllUsers(): Promise<Partial<any>[]> {
    return userModel.findAll();
  },

  async getUserById(id: number): Promise<Partial<any> | null> {
    const user = await userModel.findById(id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    return user;
  },

  async updateUser(id: number, data: { name?: string; phone?: string; role?: string }): Promise<any> {
    const user = await userModel.findById(id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    return userModel.update(id, data);
  },

  async deleteUser(id: number): Promise<any> {
    const user = await userModel.findById(id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    return userModel.delete(id);
  },

  async updateUserRole(id: number, role: string): Promise<any> {
    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(role)) {
      throw new ApiError('Invalid role', 400);
    }

    const user = await userModel.findById(id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    return userModel.update(id, { role });
  }
};

export default userService;