const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  logout,
  changePassword,
} = require("../controllers/customer.controller");
const protect = require("../middlewares/auth.middleware");

// Public routes (no authentication needed)
router.post("/register", register);
router.post("/login", login);

// Protected routes (authentication required)
router.get("/me", protect, getProfile);
router.post("/logout", protect, logout);
router.patch("/change-password", protect, changePassword); // Bonus

module.exports = router;
