const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

const protect = async (req, res, next) => {
  try {
    // Read the JWT from the HttpOnly cookie
    const token = req.cookies.token;

    // If no token is found, the user is not authenticated
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — no token provided",
      });
    }

    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the customer in MongoDB using the ID from the token payload
    // .select("-password") ensures password is never included
    const customer = await Customer.findById(decoded.id).select("-password");

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — customer not found",
      });
    }

    // Attach the customer object to the request so controllers can use it
    req.user = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized — invalid token",
    });
  }
};

module.exports = protect;
