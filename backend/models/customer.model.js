const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    // Lab 04 — Wishlist: array of Product ObjectId references
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    // Lab 05 — Cart: array of { product ref, quantity }
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
          validate: {
            validator: Number.isInteger,
            message: "Quantity must be a whole number",
          },
        },
      },
    ],
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Hash the password before saving to MongoDB
customerSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with the hashed password in DB
customerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from JSON responses
customerSchema.methods.toJSON = function () {
  const customer = this.toObject();
  delete customer.password;
  return customer;
};

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
