const Product = require("../models/product.model");
const mongoose = require("mongoose");

// @desc    Create a new product
// @route   POST /products
// @access  Public (for now — admin auth will be added in a later lab)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !image || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (name, description, price, category, image, stock)",
      });
    }

    // Validate price
    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    // Validate stock
    if (stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error creating product",
      error: error.message,
    });
  }
};

// @desc    Get all products (with optional search, category filter, and sort)
// @route   GET /products
// @route   GET /products?search=keyboard
// @route   GET /products?category=Electronics
// @route   GET /products?search=keyboard&category=Electronics
// @route   GET /products?sort=price_asc  (Bonus)
// @access  Public
const getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    // Build query dynamically based on query parameters
    let query = {};

    // Search by product name (case-insensitive regex)
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Build the Mongoose query
    let productsQuery = Product.find(query);

    // Bonus: Sorting by price
    if (sort === "price_asc") {
      productsQuery = productsQuery.sort({ price: 1 });
    } else if (sort === "price_desc") {
      productsQuery = productsQuery.sort({ price: -1 });
    } else {
      productsQuery = productsQuery.sort({ createdAt: -1 }); // newest first by default
    }

    const products = await productsQuery;

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching products",
      error: error.message,
    });
  }
};

// @desc    Get a single product by ID
// @route   GET /products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate that the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching product",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
};
