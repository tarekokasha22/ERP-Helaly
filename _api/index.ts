// Vercel Serverless Function wrapper for Express app
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Import routes
import authRoutes from '../server/src/routes/auth.routes';
import projectRoutes from '../server/src/routes/project.routes';
import sectionRoutes from '../server/src/routes/section.routes';
import spendingRoutes from '../server/src/routes/spending.routes';
import reportRoutes from '../server/src/routes/report.routes';
import userRoutes from '../server/src/routes/user.routes';
import dashboardRoutes from '../server/src/routes/dashboard.routes';
import employeeRoutes from '../server/src/routes/employee.routes';
import paymentRoutes from '../server/src/routes/payment.routes';
import aiRoutes from '../server/src/routes/ai.routes';
import { seedDatabase } from '../server/src/utils/seed';

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Country']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize data directory (for Vercel serverless)
const dataDir = path.join(process.cwd(), 'server', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize JSON storage files
const initializeStorage = () => {
  const files = ['users.json', 'projects.json', 'sections.json', 'spendings.json'];
  files.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '[]');
    }
  });
};

// Initialize storage
initializeStorage();

// Seed database on first run
let seeded = false;
if (!seeded) {
  seedDatabase().then(() => {
    seeded = true;
  }).catch(console.error);
}

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

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    storage: 'JSON'
  });
});

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '🏗️ Al-Helaly Construction ERP API',
    version: '1.0.0',
    health: '/health'
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Export as Vercel Serverless Function
export default app;
