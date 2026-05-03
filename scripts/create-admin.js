const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@loha.com' },
      update: {},
      create: {
        email: 'admin@loha.com',
        password: hashedPassword,
        name: 'مدير الموقع',
        phone: '0123456789',
        role: 'admin'
      }
    });
    
    console.log('✅ Admin user created successfully:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: Admin@123`);
    console.log(`   Role: ${admin.role}`);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();