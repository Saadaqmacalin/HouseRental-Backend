const Customer = require('../models/Customer');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private (Admin/Staff)
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().select('-password').sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private (Admin/Staff)
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select('-password');
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add new customer
// @route   POST /api/customers
// @access  Private (Admin/Staff)
const addCustomer = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const customerExists = await Customer.findOne({ email });

    if (customerExists) {
      return res.status(400).json({ message: 'Customer already exists' });
    }

    const customer = await Customer.create({
      name,
      email,
      password, // Note: Customer model should handle hashing if not using authController logic, or hash here
    });

    if (customer) {
      res.status(201).json({
        _id: customer._id,
        name: customer.name,
        email: customer.email,
      });
    } else {
      res.status(400).json({ message: 'Invalid customer data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private (Admin/Staff)
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (customer) {
      customer.name = req.body.name || customer.name;
      customer.email = req.body.email || customer.email;
      if (req.body.password) {
        customer.password = req.body.password;
      }

      const updatedCustomer = await customer.save();
      res.json({
        _id: updatedCustomer._id,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
      });
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin/Staff)
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (customer) {
      await customer.deleteOne();
      res.json({ message: 'Customer removed' });
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const mongoose = require('mongoose');

const toggleFavorite = async (req, res) => {
  const { houseId } = req.params;
  const userId = req.user.id;
  
  console.log(`--- Atomic Favorite Toggle: House ${houseId} for User ${userId} ---`);
  
  if (!mongoose.Types.ObjectId.isValid(houseId)) {
    return res.status(400).json({ message: 'Invalid House ID format' });
  }

  try {
    // 1. Check current status first to determine action
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const isFavorite = customer.favorites.some(id => id && id.toString() === houseId.toString());
    const updateAction = isFavorite ? '$pull' : '$addToSet';
    
    console.log(`Current status: ${isFavorite ? 'FAVORITE' : 'NOT FAVORITE'}. Action: ${updateAction}`);

    // 2. Perform atomic update and get NEW document
    const updatedCustomer = await Customer.findByIdAndUpdate(
      userId,
      { [updateAction]: { favorites: houseId } },
      { new: true, runValidators: true }
    );

    console.log(`Update successful. New favorite count: ${updatedCustomer.favorites.length}`);
    res.json(updatedCustomer.favorites);
  } catch (error) {
    console.error('Toggle Favorite ERROR:', error);
    res.status(500).json({ message: 'Server Error', detail: error.message });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);

    if (customer) {
      customer.name = req.body.name || customer.name;
      customer.email = req.body.email || customer.email;
      
      if (req.body.password) {
        customer.password = req.body.password;
      }

      const updatedCustomer = await customer.save();

      res.json({
        _id: updatedCustomer._id,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        favorites: updatedCustomer.favorites,
        // We don't necessarily need to return a new token unless email changed and is part of JWT
      });
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getFavorites = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).populate({
        path: 'favorites',
        populate: { path: 'owner', select: 'name' }
    });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Filter out nulls in case a house was deleted but the ID remains in favorites
    const validFavorites = (customer.favorites || []).filter(item => item !== null);
    
    res.json(validFavorites);
  } catch (error) {
    console.error('Get Favorites Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  toggleFavorite,
  getFavorites,
  updateMyProfile,
};
