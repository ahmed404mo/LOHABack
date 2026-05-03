const app = require('./app');
const config = require('./core/config');
const prisma = require('./core/database/prisma');

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    const server = app.listen(config.port, () => {
      console.log(`\n🚀 Server running on http://localhost:${config.port}`);
      console.log(`📁 API Base URL: http://localhost:${config.port}/api`);
      console.log(`🌍 Environment: ${config.nodeEnv}\n`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, closing server...');
      await server.close();
      await prisma.$disconnect();
      console.log('Server closed');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();