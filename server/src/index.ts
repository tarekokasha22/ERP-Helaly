import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import sectionRoutes from './routes/section.routes';
import spendingRoutes from './routes/spending.routes';
import reportRoutes from './routes/report.routes';
import userRoutes from './routes/user.routes';
import dashboardRoutes from './routes/dashboard.routes';
import employeeRoutes from './routes/employee.routes';
import paymentRoutes from './routes/payment.routes';
import aiRoutes from './routes/ai.routes';
import inventoryRoutes from './routes/inventory.routes';
import integrationRoutes from './routes/integration.routes';
import { seedDatabase } from './utils/seed';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('📁 Data directory created');
}

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('📝 Logs directory created');
}

// Initialize JSON storage files
const initializeStorage = () => {
  const files = [
    'users.json',
    'projects.json',
    'sections.json',
    'spendings.json',
    'employees_egypt.json',
    'employees_libya.json',
    'payments_egypt.json',
    'payments_libya.json'
  ];
  files.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '[]');
      console.log(`📄 Created ${file}`);
    }
  });
  console.log('✅ JSON storage initialized successfully');
};

// Enhanced CORS configuration
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Country']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  if (NODE_ENV === 'development') {
    console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/spendings', spendingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/integration', integrationRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    storage: 'JSON'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🏗️ Al-Helaly Construction ERP API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    message: NODE_ENV === 'development' ? err.message : 'Internal server error',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Database connection function
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;

  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
    }
  } else {
    // Only log this once in development to avoid spam
    if (NODE_ENV === 'development') {
      console.log('⚠️  No MONGO_URI found, using local JSON storage');
    }
  }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Initialize storage and start server (Local Development)
const startServer = async () => {
  try {
    // Initialize JSON storage
    initializeStorage();

    // Seed database with default data
    await seedDatabase();
    console.log('🌱 Database seeded successfully');

    await connectDB();

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`📁 Data directory: ${dataDir}`);
      console.log(`🔗 CORS origin: ${CORS_ORIGIN}`);
      console.log(`📋 API endpoints available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server immediately if run directly
if (require.main === module) {
  startServer();
}

// Export for Vercel
export default app; 