const mongoose = require('mongoose');

const HouseSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  numberOfRooms: {
    type: Number,
    required: true,
  },
  houseType: {
    type: String,
    required: true,
    enum: ['apartment', 'villa', 'single house', 'other'],
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'maintenance'],
    default: 'available',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Landlord',
    required: true,
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Default nice house
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('House', HouseSchema);
