const express = require('express');
const router = express.Router();
const { 
  getCustomers, 
  getCustomerById, 
  addCustomer, 
  updateCustomer, 
  deleteCustomer, 
  toggleFavorite, 
  getFavorites,
  updateMyProfile
} = require('../controllers/customerController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getCustomers)
  .post(protect, addCustomer); // Assuming staff/admin can add customers

router.get('/favorites', protect, getFavorites);
router.post('/favorites/:houseId', protect, toggleFavorite);
router.put('/profile', protect, updateMyProfile);

router.route('/:id')
  .get(protect, getCustomerById)
  .put(protect, updateCustomer)
  .delete(protect, admin, deleteCustomer); // Only admin can delete customers

module.exports = router;
