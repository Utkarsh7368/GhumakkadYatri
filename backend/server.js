const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const authRouter = require('./routes/authRoute');
const adminRouter = require('./routes/adminRoute');
const commonRouter = require('./routes/commonRoute');
const bookingRouter = require('./routes/bookingRoute');
const passwordResetRouter = require('./routes/resetPassRoute');
const contactRouter = require('./routes/contactRoute');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Ghumakkad Yatri API is running!', 
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/common', commonRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/auth', passwordResetRouter);
app.use('/api/contact', contactRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});