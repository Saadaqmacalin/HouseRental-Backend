const express = require('express');
const router = express.Router();
const {
  getLandlordStats,
  getLandlordHouses,
  addHouse,
  updateHouse,
  deleteHouse,
  getTenants,
  markRentAsPaid,
  getLandlordProfile,
  updateLandlordProfile,
} = require('../controllers/landlordController');
const { protect, landlord } = require('../middleware/authMiddleware');

router.use(protect);
router.use(landlord);

router.get('/stats', getLandlordStats);
router.route('/profile')
  .get(getLandlordProfile)
  .put(updateLandlordProfile);
router.route('/houses')
  .get(getLandlordHouses)
  .post(addHouse);

router.route('/houses/:id')
  .put(updateHouse)
  .delete(deleteHouse);

router.get('/tenants', getTenants);
router.post('/mark-paid/:bookingId', markRentAsPaid);

module.exports = router;
