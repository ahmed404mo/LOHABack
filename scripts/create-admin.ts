import bcrypt from 'bcryptjs';
import prisma from '../src/core/database/prisma';

async function createAdmin() {
  try {
    const email = 'admin@loha.com';
    const password = '0100admin';
    
    // Delete existing admin
    await prisma.user.deleteMany({
      where: { email }
    });
    console.log('🗑️ Deleted existing admin (if any)');
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new admin
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'System Admin',
        phone: '0123456789',
        role: 'admin'
      }
    });
    
    console.log('\n✅ Admin created successfully!');
    console.log('   Email:', admin.email);
    console.log('   Password:', password);
    console.log('   Role:', admin.role);
    
    // Test
    const test = await bcrypt.compare(password, admin.password);
    console.log('   Test:', test ? '✅ Working' : '❌ Failed');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();