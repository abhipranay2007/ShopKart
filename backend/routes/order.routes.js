const express = require("express");
const router = express.Router();
const { createPaymentOrder, verifyPayment, getOrders, getOrderById } = require("../controllers/order.controller");
const protect = require("../middlewares/auth.middleware");

// All order routes are protected
router.post("/create-payment-order", protect, createPaymentOrder);
router.post("/verify-payment", protect, verifyPayment);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);

module.exports = router;
