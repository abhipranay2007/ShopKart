const jwt = require("jsonwebtoken");

const generateToken = (res, userId) => {
  // Create a JWT with the user's ID as payload
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  });

  // Set the token as an HttpOnly cookie
  res.cookie("token", token, {
    httpOnly: true, // Prevents JavaScript from accessing the cookie (XSS protection)
    secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
    sameSite: "strict", // Prevents CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  return token;
};

module.exports = generateToken;
