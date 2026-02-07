const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  house: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'House',
    required: true,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: false,
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'approved', 'cancelled', 'ended'],
    default: 'pending',
  },
});

module.exports = mongoose.model('Booking', BookingSchema);
