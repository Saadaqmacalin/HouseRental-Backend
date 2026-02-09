const express = require("express");
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const { protect, admin } = require("../middleware/authMiddleware");

router.route("/createUser").post(protect,admin,createUser)
router.route("/").get(protect, admin, getUsers);

router
  .route("/:id")
  .delete(protect, admin, deleteUser)
  .patch(protect, admin, updateUser);

module.exports = router;
