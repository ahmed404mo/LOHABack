// scripts/check-user-password.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    // جلب المستخدم
    const user = await prisma.user.findUnique({
      where: { email: 'admin@loha.com' }
    });
    
    if (!user) {
      console.log('❌ المستخدم غير موجود في قاعدة البيانات!');
      console.log('   قم بتشغيل: node scripts/create-admin.js');
      return;
    }
    
    console.log('✅ المستخدم موجود:');
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('   Password Hash:', user.password);
    console.log('   Hash Length:', user.password.length);
    
    // اختبار كلمة المرور "admin123"
    const isValid = await bcrypt.compare('admin123', user.password);
    console.log('\n🔐 اختبار كلمة المرور "admin123":', isValid ? '✅ صحيحة' : '❌ خطأ');
    
    if (!isValid) {
      console.log('\n⚠️ كلمة المرور المخزنة غير صحيحة!');
      console.log('   الحل: إعادة تعيين كلمة المرور');
      
      // إعادة تعيين كلمة المرور
      const newHash = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { email: 'admin@loha.com' },
        data: { password: newHash }
      });
      
      console.log('\n✅ تم إعادة تعيين كلمة المرور');
      console.log('   Email: admin@loha.com');
      console.log('   Password: admin123');
      
      // اختبار مرة أخرى
      const testAgain = await bcrypt.compare('admin123', newHash);
      console.log('   اختبار جديد:', testAgain ? '✅ يعمل' : '❌ لا يزال لا يعمل');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();