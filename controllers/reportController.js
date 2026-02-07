const House = require('../models/House');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');

// @desc    Get dashboard stats
// @route   GET /api/reports/dashboard
// @access  Private (Admin/Staff)
const getDashboardStats = async (req, res) => {
  try {
    const totalHouses = await House.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    
    // Revenue logic (sum of all payments with status 'paid')
    const payments = await Payment.find({ paymentStatus: 'paid' });
    const totalRevenue = payments.reduce((acc, pay) => acc + pay.amount, 0);

    // Recent bookings (last 5, only approved/booked)
    const recentBookings = await Booking.find({ bookingStatus: 'approved' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('customer', 'name email')
        .populate('house', 'address houseType price');

    res.json({
      totalHouses,
      totalBookings,
      totalCustomers,
      totalRevenue,
      recentBookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getDashboardStats };
