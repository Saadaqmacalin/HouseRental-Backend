const express = require('express');
const router = express.Router();
const {
  loginUser,
  registerUser,
  loginCustomer,
  registerCustomer,
  loginLandlord,
  registerLandlord,
} = require('../controllers/authController');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/customer/login', loginCustomer);
router.post('/customer/register', registerCustomer);
router.post('/landlord/login', loginLandlord);
router.post('/landlord/register', registerLandlord);

module.exports = router;
