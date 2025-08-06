import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import housekeepersRoutes from './routes/housekeepers.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/housekeepers', housekeepersRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Mini Housekeeper API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Database connection test route
app.get('/api/db-test', async (req, res) => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      res.json({ 
        status: 'Connected', 
        message: 'Database connection successful',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ 
        status: 'Error', 
        message: 'Database connection failed'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'Error', 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Default API route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to Mini Housekeeper API',
    version: '1.0.0',
    endpoints: {
      housekeepers: {
        'POST /api/housekeepers': 'Register a new housekeeper',
        'GET /api/housekeepers': 'Get all approved housekeepers',
        'GET /api/housekeepers/pending': 'Get pending registrations (admin)',
        'PATCH /api/housekeepers/:id/approve': 'Approve housekeeper (admin)',
        'DELETE /api/housekeepers/:id': 'Delete housekeeper (admin)',
        'GET /api/housekeepers/:id': 'Get housekeeper details'
      },
      admin: {
        'POST /api/admin/login': 'Admin login',
        'POST /api/admin/logout': 'Admin logout'
      },
      system: {
        'GET /api/health': 'Health check',
        'GET /api/db-test': 'Database connection test'
      }
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'API endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Handle specific error types
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body'
    });
  }
  
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request body too large'
    });
  }
  
  res.status(500).json({ 
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection before starting server
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your database configuration.');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Database test: http://localhost:${PORT}/api/db-test`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
      console.log(`🔐 Admin login: POST http://localhost:${PORT}/api/admin/login`);
      console.log(`👥 Housekeepers: http://localhost:${PORT}/api/housekeepers`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
