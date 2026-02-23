const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Make io accessible to routes
app.set('io', io);

/* =========================
   CORS Middleware (FIRST - before everything)
========================= */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// IMPORT ROUTES
console.log('📦 Loading routes...');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const paravetRoutes = require('./routes/paravetRoutes');
const parentRoutes = require('./routes/parentRoutes');
const doorstepRoutes = require('./routes/doorstepRoutes');
const vetRoutes = require('./routes/vetRoutes');
const uploadRoutes = require('./routes/upload');
console.log('📹 Loading video call routes...');
const videoCallRoutes = require('./routes/videoCall');
console.log('✅ All routes loaded');
const { errorHandler } = require('./middleware/errorHandler');

/* =========================
   MongoDB Connection
========================= */
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI missing in .env');
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((error) => {
    console.error('❌ MongoDB connection failed', error.message);
    process.exit(1);
  });

/* =========================
   API Routes
========================= */
console.log('🔗 Registering routes...');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/paravet', paravetRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/doorstep', doorstepRoutes);
app.use('/api/clinics', vetRoutes);
app.use('/api/upload', uploadRoutes);
console.log('📹 Registering video route at /api/video');
app.use('/api/video', videoCallRoutes);
console.log('✅ All routes registered');

/* =========================
   Health Check
========================= */
app.get('/', (req, res) => {
  res.send('🚀 Server is running & DB connected');
});

// Test endpoint for CORS
app.get('/api/test', (req, res) => {
  res.json({ message: 'CORS is working!', timestamp: new Date().toISOString() });
});

app.post('/api/test', (req, res) => {
  res.json({ message: 'POST request successful!', body: req.body });
});

/* =========================
   Error Handler (MUST BE LAST)
========================= */
app.use(errorHandler);

/* =========================
   Socket.io Connection
========================= */
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  socket.on('join-paravet', (paravetId) => {
    socket.join(`paravet-${paravetId}`);
    console.log(`👨‍⚕️ Paravet ${paravetId} joined`);
  });

  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 User ${userId} joined`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

/* =========================
   Start Server
========================= */
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server live at http://localhost:${PORT}`);
});
