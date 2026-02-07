const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const House = require('../models/House');

// @desc    Create new payment
// @route   POST /api/payments
// @access  Private (Customer)
const createPayment = async (req, res) => {
  const { bookingId, amount, paymentMethod } = req.body;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.customer.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized to pay for this booking' });
    }

    const payment = await Payment.create({
      booking: bookingId,
      customer: req.user.id,
      amount,
      paymentMethod,
      paymentStatus: 'paid', // Simulating immediate success for now
    });

    // Update booking status to approved and house status to booked
    booking.bookingStatus = 'approved';
    await booking.save();

    const house = await House.findById(booking.house);
    if (house) {
        house.status = 'booked';
        await house.save();
    }

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payments (Admin/Staff) or My Payments (Customer)
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res) => {
    try {
        let payments;
        if (req.user.role === 'customer') {
            payments = await Payment.find({ customer: req.user.id })
                .populate({
                    path: 'booking',
                    populate: { path: 'house' }
                })
                .populate('customer', 'name email');
        } else {
            payments = await Payment.find({})
                .populate({
                    path: 'booking',
                    populate: { path: 'house' }
                })
                .populate('customer', 'name email');
        }
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
  createPayment,
  getPayments
};
