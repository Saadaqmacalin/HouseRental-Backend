const express = require('express');
const router = express.Router();
const { createPayment, getPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createPayment)
    .get(protect, getPayments);

module.exports = router;
