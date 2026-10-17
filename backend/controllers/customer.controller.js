const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");

// @desc    Register a new customer
// @route   POST /customers/register
// @access  Public
const register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Check all fields are provided
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Create the customer (password will be hashed by the pre-save hook)
    const customer = await Customer.create({
      fullName,
      email,
      password,
      phone,
    });

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// @desc    Login a customer
// @route   POST /customers/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check both fields are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find customer by email
    const customer = await Customer.findOne({ email });

    // If customer not found OR password doesn't match — same error message
    // (Don't reveal whether the email or password was incorrect)
    if (!customer || !(await customer.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT and set it in an HttpOnly cookie
    generateToken(res, customer._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

// @desc    Get current customer's profile
// @route   GET /customers/me
// @access  Protected
const getProfile = async (req, res) => {
  try {
    // req.user was attached by the auth middleware
    res.status(200).json({
      _id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching profile",
      error: error.message,
    });
  }
};

// @desc    Logout customer
// @route   POST /customers/logout
// @access  Protected
const logout = async (req, res) => {
  try {
    // Clear the authentication cookie
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0), // Set expiry to the past to delete the cookie
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during logout",
      error: error.message,
    });
  }
};

// @desc    Change password (Bonus)
// @route   PATCH /customers/change-password
// @access  Protected
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    // Find the customer WITH the password field (since we excluded it by default)
    const customer = await Customer.findById(req.user._id);

    // Verify the old password
    const isMatch = await customer.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // Set the new password (pre-save hook will hash it)
    customer.password = newPassword;
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error changing password",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
  changePassword,
};
