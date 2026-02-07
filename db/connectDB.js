const mongoose = require('mongoose');

const connectDB = async (url) => {
  try {
    await mongoose.connect(url);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
