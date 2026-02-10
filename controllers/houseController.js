const House = require('../models/House');
const Landlord = require('../models/Landlord');

// @desc    Get all houses (with filtering)
// @route   GET /api/houses
// @access  Public
const getHouses = async (req, res) => {
  try {
    const { address, minPrice, maxPrice, rooms, houseType, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    let query = { status: 'available' };

    if (address && address.trim() !== '') {
      query.address = { $regex: address.trim(), $options: 'i' };
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = Number(maxPrice);
      
      if (Object.keys(query.price).length === 0) delete query.price;
    }

    if (rooms) {
      query.numberOfRooms = Number(rooms);
    }

    if (houseType && houseType.toLowerCase() !== 'all') {
      query.houseType = houseType.toLowerCase();
    }

    if (req.query.status) {
        query.status = req.query.status;
    }

    const total = await House.countDocuments(query);
    const houses = await House.find(query)
      .populate('owner', 'name email phoneNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      houses,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
  }
};

// @desc    Get single house
// @route   GET /api/houses/:id
// @access  Public
const getHouseById = async (req, res) => {
  try {
    const house = await House.findById(req.params.id).populate('owner');

    if (house) {
      res.json(house);
    } else {
      res.status(404).json({ message: 'House not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a house
// @route   POST /api/houses
// @access  Private (Admin/Staff)
const createHouse = async (req, res) => {
  const {
    address,
    price,
    numberOfRooms,
    houseType,
    description,
    status,
    ownerId,
    owner, // Add owner to destructuring
    ownerDetails 
  } = req.body;

  try {
    let finalOwnerId = ownerId || owner; // Use owner as fallback

    // If ownerDetails provided, create new landlord first
    if (!ownerId && ownerDetails) {
        const { name, email, phoneNumber, nationalID, address: ownerAddr } = ownerDetails;
        let landlord = await Landlord.findOne({ nationalID });
        if (!landlord) {
            landlord = await Landlord.create({ name, email, phoneNumber, nationalID, address: ownerAddr, password: 'temporary_password' }); // Admins need to provide a password or have a default
        }
        finalOwnerId = landlord._id;
    }

    if (!finalOwnerId) {
        return res.status(400).json({ message: 'Owner information required' });
    }

    // Automatic image selection from a curated pool
    const imagePool = [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1576941089067-2de3c901e126?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513584684033-649199569067?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1572120366304-5b4d7d9fbeb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    ];

    const finalImageUrl = req.body.imageUrl || imagePool[Math.floor(Math.random() * imagePool.length)];

    const house = new House({
      address,
      price,
      numberOfRooms,
      houseType,
      description,
      status,
      owner: finalOwnerId,
      imageUrl: finalImageUrl,
    });

    const createdHouse = await house.save();
    res.status(201).json(createdHouse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a house
// @route   PUT /api/houses/:id
// @access  Private (Admin/Staff)
const updateHouse = async (req, res) => {
  const {
    price,
    numberOfRooms,
    houseType,
    description,
    status,
    owner
  } = req.body;

  try {
    const house = await House.findById(req.params.id);

    if (house) {
      house.price = price || house.price;
      house.numberOfRooms = numberOfRooms || house.numberOfRooms;
      house.houseType = houseType || house.houseType;
      house.description = description || house.description;
      house.status = status || house.status;
      if (owner) house.owner = owner;

      const updatedHouse = await house.save();
      res.json(updatedHouse);
    } else {
      res.status(404).json({ message: 'House not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a house
// @route   DELETE /api/houses/:id
// @access  Private (Admin/Staff)
const deleteHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);

    if (house) {
      await house.deleteOne();
      res.json({ message: 'House removed' });
    } else {
      res.status(404).json({ message: 'House not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHouses,
  getHouseById,
  createHouse,
  updateHouse,
  deleteHouse,
};
