import app from './app';
import config from './core/config';

const server = app.listen(config.port, () => {
  console.log(`
🚀 Server is running!
   📡 URL: http://localhost:${config.port}
   🌍 Environment: ${config.nodeEnv}
   📝 Health check: http://localhost:${config.port}/health
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});