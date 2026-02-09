const Booking = require('../models/Booking');
const House = require('../models/House');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Customer)
const createBooking = async (req, res) => {
  const { houseId, startDate, endDate } = req.body;
  console.log('Booking request received:', { houseId, startDate, endDate, userId: req.user?.id });

  try {
    const house = await House.findById(houseId);

    if (!house) {
      console.log('House not found:', houseId);
      return res.status(404).json({ message: 'House not found' });
    }

    if (house.status !== 'available') {
      console.log('House not available:', house.status);
      return res.status(400).json({ message: 'House is not available' });
    }

    const booking = new Booking({
      customer: req.user.id,
      house: houseId,
      startDate,
      bookingStatus: 'pending', 
    });

    const createdBooking = await booking.save();
    console.log('Booking created (pending payment):', createdBooking._id);
    res.status(201).json(createdBooking);
  } catch (error) {
    console.error('Booking Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Admin/Staff/Customer)
const getBookings = async (req, res) => {
  try {
    let bookings;
    if (req.user.role === 'customer') {
      bookings = await Booking.find({ customer: req.user.id })
        .populate('house')
        .populate('customer', 'name email');
    } else {
      // Admin/Staff - Get all
      bookings = await Booking.find({})
        .populate('house')
        .populate('customer', 'name email');
    }
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('house')
      .populate('customer', 'name email');

    if (booking) {
      // Check if user is authorized to view
      if (req.user.role !== 'customer' || booking.customer._id.toString() === req.user.id) {
          res.json(booking);
      } else {
          res.status(401).json({ message: 'Not authorized' });
      }
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private (Admin/Staff)
const updateBookingStatus = async (req, res) => {
  const { bookingStatus } = req.body;

  try {
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      booking.bookingStatus = bookingStatus;
      await booking.save();

      // If approved, maybe update House status to 'booked'?
      // Prompt says status: available | booked.
      if (bookingStatus === 'approved') {
          const house = await House.findById(booking.house);
          if (house) {
              house.status = 'booked';
              await house.save();
          }
      } 
      // If cancelled, set house back to available?
      else if (bookingStatus === 'cancelled') {
          const house = await House.findById(booking.house);
          if (house) {
              house.status = 'available';
              await house.save();
          }
      }

      res.json(booking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    End booking (Stop Renting)
// @route   PUT /api/bookings/:id/end
// @access  Private (Customer)
const endBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to end this booking
    // Only the customer who made the booking can end it
    if (booking.customer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to end this booking' });
    }

    if (booking.bookingStatus !== 'approved') {
      return res.status(400).json({ message: 'Only approved bookings can be ended' });
    }

    booking.bookingStatus = 'ended';
    booking.endDate = Date.now(); // Set end date automatically
    await booking.save();

    // Set house status back to available
    const house = await House.findById(booking.house);
    if (house) {
      house.status = 'available';
      await house.save();
    }

    res.json({ message: 'Booking ended successfully', booking });
  } catch (error) {
    console.error('End Booking Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  endBooking,
};
