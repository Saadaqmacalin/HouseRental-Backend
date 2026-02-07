const express = require('express');
const router = express.Router();
const {
  getOwners,
  getOwnerById,
  createOwner,
  updateOwner,
  deleteOwner,
} = require('../controllers/ownerController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getOwners)
  .post(protect, createOwner);

router.route('/:id')
  .get(protect, getOwnerById)
  .put(protect, updateOwner)
  .delete(protect, deleteOwner);

module.exports = router;
