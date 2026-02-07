const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private (Admin)
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Create new user
 * @route   POST /api/users
 * @access  Private (Admin)
 */
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'staff',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private (Admin)
 */
const updateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin)
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
