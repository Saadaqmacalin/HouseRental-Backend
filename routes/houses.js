const express = require('express');
const router = express.Router();
const {
  getHouses,
  getHouseById,
  createHouse,
  updateHouse,
  deleteHouse,
} = require('../controllers/houseController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getHouses)
    .post(protect, createHouse); // Allow staff to create too, so just 'protect'

router.route('/:id')
    .get(getHouseById)
    .put(protect, updateHouse)
    .delete(protect, admin, deleteHouse); 

module.exports = router;
