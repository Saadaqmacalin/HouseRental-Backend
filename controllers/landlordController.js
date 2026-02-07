const Landlord = require('../models/Landlord');
const House = require('../models/House');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @desc    Get Landlord Statistics
// @route   GET /api/landlords/stats
// @access  Private (Landlord)
const getLandlordStats = async (req, res) => {
  try {
    const landlordId = req.user.id;

    const totalHouses = await House.countDocuments({ owner: landlordId });
    const rentedHouses = await House.countDocuments({ owner: landlordId, status: 'booked' });
    const vacantHouses = await House.countDocuments({ owner: landlordId, status: 'available' });

    // For unpaid rent, we look at active bookings that don't have a payment for the current month
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    // Get all houses owned by landlord
    const houses = await House.find({ owner: landlordId });
    const houseIds = houses.map(h => h._id);

    // Get active bookings for these houses
    const activeBookings = await Booking.find({ 
      house: { $in: houseIds },
      status: 'confirmed' 
    }).populate('house');

    // Unpaid rent tracking (simplified: based on whether a payment exists for this month)
    const paidBookingsThisMonth = await Payment.find({
      booking: { $in: activeBookings.map(b => b._id) },
      paymentDate: { $gte: startOfMonth },
      paymentStatus: 'paid'
    }).distinct('booking');

    const unpaidRentCount = activeBookings.length - paidBookingsThisMonth.length;

    // Financial calculations
    const expectedIncome = activeBookings.reduce((sum, booking) => sum + booking.house.price, 0); // Use house price for monthly income
    const collectedThisMonth = await Payment.aggregate([
      { 
        $match: { 
          booking: { $in: activeBookings.map(b => b._id) },
          paymentDate: { $gte: startOfMonth },
          paymentStatus: 'paid'
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalHouses,
      rentedHouses,
      vacantHouses,
      unpaidRentCount,
      expectedIncome,
      collectedThisMonth: collectedThisMonth[0]?.total || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get Landlord's Houses
// @route   GET /api/landlords/houses
// @access  Private (Landlord)
const getLandlordHouses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await House.countDocuments({ owner: req.user.id });
    const houses = await House.find({ owner: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      houses,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add New House
// @route   POST /api/landlords/houses
// @access  Private (Landlord)
const addHouse = async (req, res) => {
  try {
    const { address, price, numberOfRooms, houseType, description, imageUrl } = req.body;
    
    // Automatic image selection from a curated pool
    const imagePool = [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1564013489117-6d914e73a7a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    ];

    const finalImageUrl = imageUrl || imagePool[Math.floor(Math.random() * imagePool.length)];
    
    const house = await House.create({
      address,
      price,
      numberOfRooms,
      houseType,
      description,
      imageUrl: finalImageUrl,
      owner: req.user.id
    });

    res.status(201).json(house);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update House
// @route   PUT /api/landlords/houses/:id
// @access  Private (Landlord)
const updateHouse = async (req, res) => {
  try {
    const house = await House.findOne({ _id: req.params.id, owner: req.user.id });

    if (house) {
      house.address = req.body.address || house.address;
      house.price = req.body.price || house.price;
      house.numberOfRooms = req.body.numberOfRooms || house.numberOfRooms;
      house.houseType = req.body.houseType || house.houseType;
      house.description = req.body.description || house.description;
      house.status = req.body.status || house.status;
      house.imageUrl = req.body.imageUrl || house.imageUrl;

      const updatedHouse = await house.save();
      res.json(updatedHouse);
    } else {
      res.status(404).json({ message: 'House not found or not authorized' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete House
// @route   DELETE /api/landlords/houses/:id
// @access  Private (Landlord)
const deleteHouse = async (req, res) => {
  try {
    const house = await House.findOne({ _id: req.params.id, owner: req.user.id });

    if (house) {
      await house.deleteOne();
      res.json({ message: 'House removed' });
    } else {
      res.status(404).json({ message: 'House not found or not authorized' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get Tenants & Rent status
// @route   GET /api/landlords/tenants
// @access  Private (Landlord)
const getTenants = async (req, res) => {
  try {
    const houses = await House.find({ owner: req.user.id });
    const houseIds = houses.map(h => h._id);

    const bookings = await Booking.find({ house: { $in: houseIds } })
      .populate('customer', 'name email phoneNumber')
      .populate('house', 'address price')
      .sort({ createdAt: -1 });

    // Join with payments to see status
    const bookingsWithPayments = await Promise.all(bookings.map(async (booking) => {
      const payments = await Payment.find({ booking: booking._id }).sort({ paymentDate: -1 });
      return {
        ...booking._doc,
        payments,
        latestPaymentStatus: payments[0]?.paymentStatus || 'unpaid'
      };
    }));

    res.json(bookingsWithPayments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Mark Rent as Paid
// @route   POST /api/landlords/mark-paid/:bookingId
// @access  Private (Landlord)
const markRentAsPaid = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { amount, paymentMethod } = req.body;

    const booking = await Booking.findById(bookingId).populate('house');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if landlord owns the house
    if (booking.house.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const payment = await Payment.create({
      booking: bookingId,
      customer: booking.customer,
      amount: amount || booking.house.price,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'paid',
      paymentDate: new Date()
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get Landlord Profile
// @route   GET /api/landlords/profile
// @access  Private (Landlord)
const getLandlordProfile = async (req, res) => {
  try {
    const landlord = await Landlord.findById(req.user.id).select('-password');
    if (landlord) {
      res.json(landlord);
    } else {
      res.status(404).json({ message: 'Landlord not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update Landlord Profile
// @route   PUT /api/landlords/profile
// @access  Private (Landlord)
const updateLandlordProfile = async (req, res) => {
  try {
    const landlord = await Landlord.findById(req.user.id);

    if (landlord) {
      landlord.name = req.body.name || landlord.name;
      landlord.email = req.body.email || landlord.email;
      landlord.phoneNumber = req.body.phoneNumber || landlord.phoneNumber;
      landlord.address = req.body.address || landlord.address;
      landlord.nationalID = req.body.nationalID || landlord.nationalID;

      if (req.body.password) {
        landlord.password = req.body.password;
      }

      const updatedLandlord = await landlord.save();
      
      res.json({
        _id: updatedLandlord._id,
        name: updatedLandlord.name,
        email: updatedLandlord.email,
        phoneNumber: updatedLandlord.phoneNumber,
        address: updatedLandlord.address,
        nationalID: updatedLandlord.nationalID,
        token: req.headers.authorization.split(' ')[1] // Keep same token
      });
    } else {
      res.status(404).json({ message: 'Landlord not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getLandlordStats,
  getLandlordHouses,
  addHouse,
  updateHouse,
  deleteHouse,
  getTenants,
  markRentAsPaid,
  getLandlordProfile,
  updateLandlordProfile
};
