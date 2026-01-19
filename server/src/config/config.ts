import mongoose from 'mongoose';

// Configuration variables with defaults

// Type declaration for Node.js process
declare const process: {
  env: {
    [key: string]: string | undefined;
    JWT_SECRET?: string;
    JWT_EXPIRES_IN?: string;
    PORT?: string;
    MONGODB_URI?: string;
    ANTHROPIC_API_KEY?: string;
  };
  exit: (code?: number) => never;
};

export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'helaly_erp_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  server: {
    port: process.env.PORT || 5000
  },
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/helaly-erp'
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || ''
  }
};

/**
 * Connect to MongoDB database
 */
export const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.db.uri);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}; 