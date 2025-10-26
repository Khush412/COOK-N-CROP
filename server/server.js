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
const groupRoutes = require('./routes/groups'); // New
const collectionRoutes = require('./routes/collections');
const messageRoutes = require('./routes/messages'); // New: Import message routes
const searchRoutes = require('./routes/search'); // New: Import search routes
const chatbotRoutes = require('./routes/chatbot'); // New: Import chatbot routes
const supportRoutes = require('./routes/support'); // New: Import support routes
const loyaltyRoutes = require('./routes/loyaltyRoutes'); // New: Import loyalty routes
const offerRoutes = require('./routes/offerRoutes'); // New: Import offer routes

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

// Periodic cleanup of stale connections (every 5 minutes)
setInterval(() => {
  const activeSocketIds = new Set();
  
  // Get all currently connected socket IDs
  io.sockets.sockets.forEach(socket => {
    activeSocketIds.add(socket.id);
  });
  
  // Remove users whose socket IDs are no longer active
  Object.keys(onlineUsers).forEach(userId => {
    if (!activeSocketIds.has(onlineUsers[userId])) {
      delete onlineUsers[userId];
    }
  });
}, 5 * 60 * 1000); // Run every 5 minutes

io.on("connection", (socket) => {
  // console.log(`User connected: ${socket.id}`); // Optional: uncomment for debugging

  socket.on("join", (userId) => {
    onlineUsers[userId] = socket.id;
    // console.log("Online users:", Object.keys(onlineUsers)); // Optional: uncomment for debugging
  });

  // Allow admins to join a special room for admin-only events
  socket.on('join_admin_room', () => {
    socket.join('admin_room');
    // console.log(`Socket ${socket.id} joined admin_room`); // Optional: uncomment for debugging
  });

  socket.on("disconnect", () => {
    const userId = Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id);
    if (userId) {
      delete onlineUsers[userId];
      // console.log(`User ${userId} disconnected. Socket: ${socket.id}`); // Optional: uncomment for debugging
      // console.log("Online users:", Object.keys(onlineUsers)); // Optional: uncomment for debugging
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
      // Allow images from self (our server) and data URIs.
      // Also allow images from Google, GitHub, and LinkedIn for OAuth avatars.
      imgSrc: ["'self'", "data:", "https://lh3.googleusercontent.com", "https://avatars.githubusercontent.com", "https://media.licdn.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"] // Allow websockets for real-time features
    }
  },
  // This is required to allow the frontend (on a different port in dev) to load images from this server
  // by removing the 'Cross-Origin-Resource-Policy' header.
  crossOriginResourcePolicy: false,
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
  max: process.env.NODE_ENV === 'production' ? 200 : 10000, // 200 for production, high for dev
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 30 : 1000, // 30 for production, high for dev
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
app.use('/api/groups', groupRoutes); // New
app.use('/api/collections', collectionRoutes);
app.use('/api/admin', adminRoutes); // New: Use admin routes
app.use('/api/notifications', notificationRoutes); // New: Use notification routes
app.use('/api/messages', messageRoutes); // New: Use message routes
app.use('/api/search', searchRoutes); // New: Use search routes
app.use('/api/chatbot', chatbotRoutes); // New: Use chatbot routes
app.use('/api/support', supportRoutes); // New: Use support routes
app.use('/api/loyalty', loyaltyRoutes); // New: Use loyalty routes
app.use('/api/offers', offerRoutes); // New: Use offer routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// --- Production Deployment Setup ---
// This block MUST come after all API routes.
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/build');
  
  // Serve user-uploaded content from server/public/uploads
  app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

  // Serve static files from the React app
  app.use(express.static(clientBuildPath));

  // The "catchall" handler: for any request that doesn't
  // match one of the API routes above, send back React's index.html file.
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
} else {
  // In development, still serve uploads so they work locally
  app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
  // In development, just show a simple message for the root
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

// Custom 404 handler for any API routes that don't exist
// This will only be hit if a request starts with /api/ but doesn't match any route
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API route not found: ${req.originalUrl}`
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

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ --- FAILED TO START SERVER --- ❌');
    if (error.message.includes('ETIMEDOUT') || error.message.includes('whitelist')) {
        console.error('DATABASE CONNECTION FAILED: The connection to MongoDB timed out.');
        console.error('This is almost always a network or firewall issue. Please check the following:');
        console.error('1. MongoDB Atlas IP Access List: Your current IP address might not be whitelisted. This is the #1 most common cause.');
        console.error('2. .env File: Ensure your MONGODB_URI is correct and has the right password.');
        console.error('3. Local Firewall/VPN: Your network might be blocking the connection to the database port.');
    } else {
        console.error('An unexpected error occurred:', error);
    }
    process.exit(1);
  }
};

startServer();

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