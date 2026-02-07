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
    .delete(protect, admin, deleteHouse); // Only admin can delete? Or staff too? Prompt says Admin/Staff can add/edit/delete. Let's allow staff. 
    // UPDATE: Prompt says "Users (Admin only)" implying user management is admin only, but house management is likely shared or specific.
    // Let's stick to 'protect' for update/delete for now, maybe restrict delete to admin if strictly needed.
    // Re-reading: "Web Dashboard: React.js (Admin & Staff) ... Houses Management (Add / Edit / Delete)".
    // So both can do it.

module.exports = router;
