const Landlord = require('../models/Landlord');

// @desc    Get all owners
// @route   GET /api/owners
// @access  Private
const getOwners = async (req, res) => {
  try {
    const owners = await Landlord.find().sort({ createdAt: -1 });
    res.json(owners);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single owner
// @route   GET /api/owners/:id
// @access  Private
const getOwnerById = async (req, res) => {
  try {
    const owner = await Landlord.findById(req.params.id);
    if (owner) {
      res.json(owner);
    } else {
      res.status(404).json({ message: 'Owner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new owner
// @route   POST /api/owners
// @access  Private
const createOwner = async (req, res) => {
  const { name, email, phoneNumber, nationalID, address } = req.body;

  try {
    const ownerExists = await Landlord.findOne({ nationalID });
    if (ownerExists) {
      return res.status(400).json({ message: 'Owner with this National ID already exists' });
    }

    const emailExists = await Landlord.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Owner with this email already exists' });
    }

    const owner = await Landlord.create({
      name,
      email,
      phoneNumber,
      nationalID,
      address,
      password: 'temporary_password', // Admins need to provide a password or have a default
    });

    res.status(201).json(owner);
  } catch (error) {
    res.status(400).json({ message: 'Invalid owner data', error: error.message });
  }
};

// @desc    Update owner
// @route   PUT /api/owners/:id
// @access  Private
const updateOwner = async (req, res) => {
  const { name, email, phoneNumber, nationalID, address } = req.body;

  try {
    const owner = await Landlord.findById(req.params.id);

    if (owner) {
      owner.name = name || owner.name;
      owner.email = email || owner.email;
      owner.phoneNumber = phoneNumber || owner.phoneNumber;
      owner.nationalID = nationalID || owner.nationalID;
      owner.address = address || owner.address;

      const updatedOwner = await owner.save();
      res.json(updatedOwner);
    } else {
      res.status(404).json({ message: 'Owner not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid owner data' });
  }
};

// @desc    Delete owner
// @route   DELETE /api/owners/:id
// @access  Private
const deleteOwner = async (req, res) => {
  try {
    const owner = await Landlord.findById(req.params.id);

    if (owner) {
      await owner.deleteOne();
      res.json({ message: 'Owner removed' });
    } else {
      res.status(404).json({ message: 'Owner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getOwners,
  getOwnerById,
  createOwner,
  updateOwner,
  deleteOwner,
};
