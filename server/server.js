const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require("socket.io");
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
require('dotenv').config();

// Debug: Check if environment variables are loaded
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'NOT FOUND');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Found' : 'NOT FOUND');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Found' : 'NOT FOUND');

// Import database connection
const connectDB = require('./config/database');

// Import passport configuration
require('./config/passport');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const addressRoutes = require('./routes/address'); // New: Import address routes
const orderRoutes = require('./routes/order'); // New: Import order routes
const postRoutes = require('./routes/posts'); // New: Import post routes
const commentRoutes = require('./routes/comments'); // New: Import comment routes
const couponRoutes = require('./routes/couponRoutes'); // New: Import coupon routes
const notificationRoutes = require('./routes/notifications'); // New: Import notification routes
const adminRoutes = require('./routes/admin'); // New: Import admin routes
const messageRoutes = require('./routes/messages'); // New: Import message routes
const searchRoutes = require('./routes/search'); // New: Import search routes
const chatbotRoutes = require('./routes/chatbot'); // New: Import chatbot routes

// Connect to database
connectDB();

const app = express();

// Trust the first proxy in the chain (e.g., the React dev server or a reverse proxy in production)
app.set('trust proxy', 1);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ["GET", "POST"]
  }
});

let onlineUsers = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log("Online users:", Object.keys(onlineUsers));
  });

  // Allow admins to join a special room for admin-only events
  socket.on('join_admin_room', () => {
    socket.join('admin_room');
    console.log(`Socket ${socket.id} joined admin_room`);
  });

  socket.on("disconnect", () => {
    const userId = Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id);
    if (userId) {
      delete onlineUsers[userId];
      console.log(`User ${userId} disconnected. Socket: ${socket.id}`);
      console.log("Online users:", Object.keys(onlineUsers));
    }
  });
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"]
    }
  }
}));

// CORS configuration - MUST be placed before routes and rate limiters
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100000, // limit each IP to 100,000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100000, // Increased limit to effectively disable it for development
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Passport middleware
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

// Middleware to attach io and onlineUsers to req
app.use((req, res, next) => {
  req.io = io;
  req.onlineUsers = onlineUsers;
  next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes); // New: Use address routes
app.use('/api/orders', orderRoutes); // New: Use order routes
app.use('/api/posts', postRoutes); // New: Use post routes
app.use('/api/comments', commentRoutes); // New: Use comment routes
app.use('/api/coupons', couponRoutes); // New: Use coupon routes
app.use('/api/admin', adminRoutes); // New: Use admin routes
app.use('/api/notifications', notificationRoutes); // New: Use notification routes
app.use('/api/messages', messageRoutes); // New: Use message routes
app.use('/api/search', searchRoutes); // New: Use search routes
app.use('/api/chatbot', chatbotRoutes); // New: Use chatbot routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const User = require('./models/User');
    
    // Test database connection
    const connectionState = mongoose.connection.readyState;
    const connectionStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    // Count users in database
    const userCount = await User.countDocuments();
    
    res.status(200).json({
      success: true,
      message: 'Database test successful',
      connectionState: connectionStates[connectionState],
      userCount: userCount,
      databaseName: mongoose.connection.name,
      host: mongoose.connection.host
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({
      success: false,
      message: `Validation Error: ${message}`
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    return res.status(400).json({
      success: false,
      message: `Duplicate Error: ${message}`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

module.exports = app;