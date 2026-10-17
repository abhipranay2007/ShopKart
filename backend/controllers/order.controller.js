const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const crypto = require("crypto");

// Helper: validate shipping address
const validateShipping = (addr) => {
  if (!addr) return "Shipping address is required";
  const { fullName, phone, addressLine1, city, state, pincode } = addr;
  if (!fullName || !fullName.trim()) return "Full name is required";
  if (!phone || !phone.trim()) return "Phone number is required";
  if (!addressLine1 || !addressLine1.trim()) return "Address is required";
  if (!city || !city.trim()) return "City is required";
  if (!state || !state.trim()) return "State is required";
  if (!pincode || !/^\d{6}$/.test(pincode)) return "Pincode must be 6 digits";
  return null;
};

// @desc    Create payment order — validate cart, create pending order, create Razorpay order
// @route   POST /orders/create-payment-order
// @access  Protected
const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // Validate shipping
    const shippingError = validateShipping(shippingAddress);
    if (shippingError) {
      return res.status(400).json({ success: false, message: shippingError });
    }

    // Load user with cart populated
    const customer = await Customer.findById(req.user._id).populate("cart.product");

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Verify stock and build order snapshot
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = await Product.findById(cartItem.product._id || cartItem.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${cartItem.product.name || cartItem.product}`,
        });
      }
      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} available.`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });

      totalAmount += product.price * cartItem.quantity;
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpayKeyId || !razorpayKeySecret || !razorpayKeyId.startsWith("rzp_test_")) {
      return res.status(503).json({
        success: false,
        message: "Razorpay Test Mode is not configured. Please try again later.",
      });
    }

    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    // Create ShopKart order with PENDING_PAYMENT
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: "INR",
      receipt: order._id.toString(),
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      key: razorpayKeyId,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Verify Razorpay payment signature and confirm order
// @route   POST /orders/verify-payment
// @access  Protected
const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (
      typeof shopKartOrderId !== "string" ||
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string" ||
      !razorpay_order_id ||
      !razorpay_payment_id
    ) {
      return res.status(400).json({ success: false, message: "Payment details are incomplete" });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (razorpay_order_id !== order.razorpayOrderId) {
      return res.status(400).json({ success: false, message: "Payment order does not match" });
    }

    if (order.paymentStatus !== "PENDING" || order.status !== "PENDING_PAYMENT") {
      return res.status(409).json({ success: false, message: "Order payment has already been processed" });
    }

    if (
      !process.env.RAZORPAY_KEY_SECRET ||
      !process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_")
    ) {
      return res.status(503).json({ success: false, message: "Payment verification is unavailable" });
    }

    // Verify signature using HMAC SHA256
    const body = order.razorpayOrderId + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const signatureIsHex = /^[a-f0-9]{64}$/i.test(razorpay_signature);
    const signatureMatches = signatureIsHex && crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(razorpay_signature, "hex")
    );

    if (!signatureMatches) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // Atomically allow only the first valid verification to confirm this order.
    // A replay cannot clear cart items added after the original purchase.
    const paidOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        user: req.user._id,
        razorpayOrderId: razorpay_order_id,
        paymentStatus: "PENDING",
        status: "PENDING_PAYMENT",
      },
      {
        $set: {
          paymentStatus: "PAID",
          status: "PLACED",
          razorpayPaymentId: razorpay_payment_id,
        },
      },
      { new: true, runValidators: true }
    );

    if (!paidOrder) {
      return res.status(409).json({ success: false, message: "Order payment has already been processed" });
    }

    // Clear cart
    const customer = await Customer.findById(req.user._id);
    customer.cart = [];
    await customer.save();

    res.status(200).json({ success: true, message: "Payment verified", order: paidOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get current user's orders
// @route   GET /orders
// @access  Protected
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get single order by ID
// @route   GET /orders/:id
// @access  Protected
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = { createPaymentOrder, verifyPayment, getOrders, getOrderById };
