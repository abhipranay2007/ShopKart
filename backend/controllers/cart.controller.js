const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const mongoose = require("mongoose");

// @desc    Add product to cart (or increment quantity if already in cart)
// @route   POST /cart/:productId
// @access  Protected
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const customer = await Customer.findById(req.user._id);

    // Check if product is already in cart
    const existingItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // Increment quantity — but check stock
      if (existingItem.quantity + 1 > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Only ${product.stock} units available.`,
        });
      }
      existingItem.quantity += 1;
    } else {
      // New item — check stock for quantity 1
      if (product.stock < 1) {
        return res.status(400).json({ success: false, message: "Product is out of stock" });
      }
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();

    res.status(200).json({ success: true, message: "Cart updated", cart: customer.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get current user's cart
// @route   GET /cart
// @access  Protected
const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price category image stock",
    });

    res.status(200).json({ success: true, cart: customer.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Update product quantity in cart
// @route   PATCH /cart/:productId
// @access  Protected
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive whole number",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} units available.`,
      });
    }

    const customer = await Customer.findById(req.user._id);
    const cartItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Product not in cart" });
    }

    cartItem.quantity = quantity;
    await customer.save();

    res.status(200).json({ success: true, message: "Quantity updated", cart: customer.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Remove product from cart
// @route   DELETE /cart/:productId
// @access  Protected
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const customer = await Customer.findById(req.user._id);
    const index = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Product not in cart" });
    }

    customer.cart.splice(index, 1);
    await customer.save();

    res.status(200).json({ success: true, message: "Product removed from cart", cart: customer.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = { addToCart, getCart, updateCartQuantity, removeFromCart };
