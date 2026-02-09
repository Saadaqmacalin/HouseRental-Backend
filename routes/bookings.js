const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  endBooking,
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createBooking)
  .get(protect, getBookings);

router.route('/:id/end')
  .put(protect, endBooking);

router.route('/:id')
  .get(protect, getBookingById)
  .put(protect, updateBookingStatus); 

module.exports = router;
