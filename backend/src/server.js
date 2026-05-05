import './config/env.js'; // Must be first — loads dotenv before any other import reads process.env
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import './config/redis.js';
import { flushViewBuffer } from './utils/viewBuffer.js';
import errorHandler from './middleware/errorHandler.js';
import passport from './config/passport.js';
import { setupSwagger } from './config/swagger.js';
import { mcpServer } from './config/mcp.js';
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { initSocket } from './socket.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import videoRoutes from './routes/videos.js';
import channelRoutes from './routes/channels.js';
import chatRoutes from './routes/chat.js';
import analyticsRoutes from './routes/analytics.js';
import adminRoutes from './routes/admin.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import streamRoutes from './routes/streams.js';
import { initNMS } from './streaming/nms.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const httpServer = createServer(app);
initSocket(httpServer);

// Trust proxy (required for rate limiting behind Render/Vercel)
app.set('trust proxy', 1);

// Connect to database
connectDB();

// Passport middleware
app.use(passport.initialize());

// CORS - must be first
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Serve static files BEFORE helmet (to avoid CSP issues)
app.use('/videos', express.static(path.join(__dirname, '../videos')));
app.use('/thumbnails', express.static(path.join(__dirname, '../thumbnails')));
app.use('/avatars', express.static(path.join(__dirname, '../avatars')));
app.use('/hls/thumbnails', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
}, express.static(path.join(__dirname, '../streams/thumbnails')));
app.use('/hls', express.static(path.join(__dirname, '../streams')));

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: [
        "'self'",
        "data:",
        "res.cloudinary.com",
        "via.placeholder.com",
        "*.githubusercontent.com",
        "*.googleusercontent.com"
      ],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'", "res.cloudinary.com"]
    }
  }
})); // Security headers with static file support
app.use(morgan('dev')); // Logging
app.use(compression()); // Compress responses

// MCP SSE Endpoint
let mcpTransport;
app.get("/api/mcp", async (req, res) => {
  console.log("🤖 AI Agent initiating MCP SSE connection...");
  try {
    mcpTransport = new SSEServerTransport("/api/mcp/messages", res);
    await mcpServer.connect(mcpTransport);
    
    // Handle close
    req.on('close', () => {
      console.log("🔌 MCP connection closed");
      mcpTransport = null;
    });
  } catch (error) {
    console.error("❌ MCP Connection Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/mcp/messages", async (req, res) => {
  if (!mcpTransport) {
    console.warn("⚠️ POST to /api/mcp/messages but no active transport");
    return res.status(400).send("No active MCP transport");
  }
  
  try {
    await mcpTransport.handlePostMessage(req, res);
  } catch (error) {
    console.error("❌ MCP Message Error:", error);
    res.status(500).send(error.message);
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitize data
app.use(mongoSanitize());

// Setup Swagger (development only)
if (process.env.NODE_ENV !== 'production') {
  setupSwagger(app);
} else {
  // Provide helpful message in production
  app.get('/api-docs', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'API documentation is only available in development mode',
      hint: 'Visit the health endpoint at /api/health to check API status'
    });
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/streams', streamRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SecTube API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Flush buffered view counts to MongoDB every 30 seconds
setInterval(flushViewBuffer, 30_000);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`🔒 Security features enabled`);
  console.log(`📹 Video platform ready for cyber security content`);
  initNMS(); // Start RTMP server (non-blocking, warns if unavailable)
});
