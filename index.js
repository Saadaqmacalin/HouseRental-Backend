const express = require('express');
const dotenv = require('dotenv');

// Load env vars at the very top
dotenv.config();

const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./db/connectDB');

const app = express();

const authRoutes = require('./routes/auth');
const houseRoutes = require('./routes/houses');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/owners', require('./routes/owners'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/landlords', require('./routes/landlords'));

app.get('/', (req, res) => {
  res.send('House Rental API is running...');
});

// Start Server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/house_rental_db';

// Ensure JWT_SECRET is available
if (!process.env.JWT_SECRET) {
    console.warn('Warning: JWT_SECRET not defined in .env, using default.');
    process.env.JWT_SECRET = 'changeme123';
}

const start = async () => {
  try {
    await connectDB(MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
