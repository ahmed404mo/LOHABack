import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  cors: {
    origins: string[];
  };
  databaseUrl: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_this',
    expiresIn: '7d'
  },
  
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  },
  
  cors: {
    origins: ['http://localhost:5500', 'http://127.0.0.1:5500']
  },
  
  databaseUrl: process.env.DATABASE_URL || ''
};

// Validate required config
if (!config.jwt.secret || config.jwt.secret === 'default_secret_change_this') {
  console.error('❌ JWT_SECRET is required in .env file');
  process.exit(1);
}

export default config;