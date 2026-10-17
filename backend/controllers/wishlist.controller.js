const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const mongoose = require("mongoose");

// @desc    Add product to wishlist
// @route   POST /wishlist/:productId
// @access  Protected
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Add only when the product is not already present. Keeping the check in
    // the update filter makes duplicate prevention atomic under concurrent requests.
    const customer = await Customer.findOneAndUpdate(
      { _id: req.user._id, wishlist: { $ne: productId } },
      { $addToSet: { wishlist: productId } },
      { new: true }
    );

    if (!customer) {
      const customerExists = await Customer.exists({ _id: req.user._id });
      if (!customerExists) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }
      return res.status(409).json({ success: false, message: "Product already in wishlist" });
    }

    res.status(200).json({ success: true, message: "Product added to wishlist" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get current user's wishlist
// @route   GET /wishlist
// @access  Protected
const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price category image stock",
    });

    res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /wishlist/:productId
// @access  Protected
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const index = customer.wishlist.indexOf(productId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Product not in wishlist" });
    }

    customer.wishlist.splice(index, 1);
    await customer.save();

    res.status(200).json({ success: true, message: "Product removed from wishlist" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist };
