const User = require('../models/User');
const Customer = require('../models/Customer');
const Landlord = require('../models/Landlord');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id, role) => {
  console.log('Generating token with secret starting with:', process.env.JWT_SECRET?.substring(0, 3));
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth User (Admin/Staff) & get token
// @route   POST /api/auth/login
// @access  Public
// @desc    Auth User (Admin/Staff) & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// @desc    Register a new User (Admin/Staff)
// @route   POST /api/auth/register
// @access  Public (Should be protected or strictly controlled in production)
const registerUser = async (req, res) => {
  const { name, email, phoneNumber, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      phoneNumber,
      password,
      role: role || 'staff',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Auth Customer & get token
// @route   POST /api/auth/customer/login
// @access  Public
const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  try {
    const customer = await Customer.findOne({ email });

    if (customer && (await customer.matchPassword(password))) {
      res.json({
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        role: 'customer',
        favorites: customer.favorites,
        token: generateToken(customer._id, 'customer'),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('LOGIN_CUSTOMER_ERROR:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Register a new Customer
// @route   POST /api/auth/customer/register
// @access  Public
const registerCustomer = async (req, res) => {
  const { name, email, password, profileImage } = req.body;

  try {
    const customerExists = await Customer.findOne({ email });

    if (customerExists) {
      return res.status(400).json({ message: 'Customer already exists' });
    }

    const customer = await Customer.create({
      name,
      email,
      password,
      profileImage,
    });

    if (customer) {
      res.status(201).json({
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        role: 'customer',
        favorites: customer.favorites,
        token: generateToken(customer._id, 'customer'),
      });
    } else {
      res.status(400).json({ message: 'Invalid customer data' });
    }
  } catch (error) {
    console.error('REGISTER_CUSTOMER_ERROR:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Auth Landlord & get token
// @route   POST /api/auth/landlord/login
// @access  Public
const loginLandlord = async (req, res) => {
  const { email, password } = req.body;

  try {
    const landlord = await Landlord.findOne({ email });

    if (landlord && (await landlord.matchPassword(password))) {
      res.json({
        _id: landlord._id,
        name: landlord.name,
        email: landlord.email,
        role: 'landlord',
        token: generateToken(landlord._id, 'landlord'),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('LOGIN_LANDLORD_ERROR:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Register a new Landlord
// @route   POST /api/auth/landlord/register
// @access  Public
const registerLandlord = async (req, res) => {
  const { name, email, password, phoneNumber, nationalID, address } = req.body;

  try {
    const landlordExists = await Landlord.findOne({ 
      $or: [{ email }, { nationalID }] 
    });

    if (landlordExists) {
      const field = landlordExists.email === email ? 'Email' : 'National ID';
      return res.status(400).json({ message: `${field} already exists` });
    }

    const landlord = await Landlord.create({
      name,
      email,
      password,
      phoneNumber,
      nationalID,
      address,
    });

    if (landlord) {
      res.status(201).json({
        _id: landlord._id,
        name: landlord.name,
        email: landlord.email,
        role: 'landlord',
        token: generateToken(landlord._id, 'landlord'),
      });
    } else {
      res.status(400).json({ message: 'Invalid landlord data' });
    }
  } catch (error) {
    console.error('REGISTER_LANDLORD_ERROR:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  loginUser,
  registerUser,
  loginCustomer,
  registerCustomer,
  loginLandlord,
  registerLandlord,
};
