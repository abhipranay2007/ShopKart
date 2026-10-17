import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

// Helper: load Razorpay checkout script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, clearCart, fetchCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userProfile, setUserProfile] = useState(null);

  // Check auth and prefill name/phone if available
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await API.get("/customers/me");
        setUserProfile(data);
        setFormData((prev) => ({
          ...prev,
          fullName: data.fullName || "",
          phone: data.phone || "",
        }));
      } catch {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  // Ensure cart is loaded
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.addressLine1.trim()) errors.addressLine1 = "Street address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.trim()) errors.state = "State is required";
    if (!formData.pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      errors.pincode = "Pincode must be exactly 6 digits";
    }
    return errors;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setErrorMessage("Your cart is empty. Add items to checkout.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      // 1. Create order on backend
      const { data } = await API.post("/orders/create-payment-order", {
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
      });

      const { shopKartOrderId, razorpayOrderId, key, amount, currency } = data;

      // 2. If Razorpay order is created and key is present, open Razorpay popup
      if (!razorpayOrderId || !key) {
        setErrorMessage("Payment could not be started. Your cart has not been cleared.");
        setIsSubmitting(false);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setErrorMessage("Failed to load payment gateway. Please check your network.");
        setIsSubmitting(false);
        return;
      }

      const options = {
        key,
        amount,
        currency: currency || "INR",
        name: "ShopKart",
        description: `Order #${shopKartOrderId.slice(-6)}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // 3. Verify signature on backend
            await API.post("/orders/verify-payment", {
              shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            clearCart();
            navigate(`/orders/${shopKartOrderId}`);
          } catch (verifyErr) {
            setErrorMessage(
              verifyErr.response?.data?.message || "Payment verification failed"
            );
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
          email: userProfile?.email || "",
        },
        theme: {
          color: "#6c5ce7",
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setErrorMessage(
          response.error?.description ||
            "Payment failed. Your cart has not been cleared. Please try again."
        );
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Failed to process checkout. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="content-container">
          <div className="state-message empty-state">
            <span>🛒</span>
            <h3>No items to checkout</h3>
            <p>Your shopping cart is currently empty.</p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="content-container">
        <div className="section-header">
          <div>
            <h1 className="page-title">💳 Secure Checkout</h1>
            <p className="page-subtitle">Provide your delivery address to complete your order</p>
          </div>
          <Link to="/cart" className="btn btn-secondary">
            ← Back to Cart
          </Link>
        </div>

        {errorMessage && (
          <div className="state-message error-state checkout-error-banner">
            <span>⚠️</span>
            <p>{errorMessage}</p>
          </div>
        )}

        <div className="checkout-layout">
          {/* Shipping Address Form */}
          <div className="checkout-form-container">
            <h2 className="checkout-section-title">📍 1. Shipping Address</h2>
            <form onSubmit={handlePlaceOrder} className="checkout-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`form-input ${formErrors.fullName ? "input-error" : ""}`}
                    placeholder="e.g. John Doe"
                  />
                  {formErrors.fullName && (
                    <span className="field-error">{formErrors.fullName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`form-input ${formErrors.phone ? "input-error" : ""}`}
                    placeholder="10-digit mobile number"
                  />
                  {formErrors.phone && (
                    <span className="field-error">{formErrors.phone}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className={`form-input ${formErrors.addressLine1 ? "input-error" : ""}`}
                  placeholder="Flat, House no., Building, Street, Area"
                />
                {formErrors.addressLine1 && (
                  <span className="field-error">{formErrors.addressLine1}</span>
                )}
              </div>

              <div className="form-row form-row-three">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`form-input ${formErrors.city ? "input-error" : ""}`}
                    placeholder="e.g. Bangalore"
                  />
                  {formErrors.city && (
                    <span className="field-error">{formErrors.city}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`form-input ${formErrors.state ? "input-error" : ""}`}
                    placeholder="e.g. Karnataka"
                  />
                  {formErrors.state && (
                    <span className="field-error">{formErrors.state}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">PIN Code</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength="6"
                    className={`form-input ${formErrors.pincode ? "input-error" : ""}`}
                    placeholder="6 digits"
                  />
                  {formErrors.pincode && (
                    <span className="field-error">{formErrors.pincode}</span>
                  )}
                </div>
              </div>

              <div className="checkout-payment-box">
                <h3 className="payment-box-title">💳 2. Payment Method</h3>
                <div className="payment-option selected">
                  <span className="payment-badge-radio">●</span>
                  <div>
                    <strong>Razorpay Checkout (Test Mode)</strong>
                    <p className="payment-desc">
                      Accepts UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, or NetBanking.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-place-order"
                disabled={isSubmitting}
              >
                {isSubmitting ? "⏳ Processing Order..." : `Pay ₹${subtotal.toLocaleString()} & Place Order`}
              </button>
            </form>
          </div>

          {/* Order Review Sidebar */}
          <div className="checkout-review-sidebar">
            <div className="summary-card">
              <h2 className="summary-title">Order Review</h2>

              <div className="checkout-items-preview">
                {cartItems.map((item) => {
                  const product = item.product || {};
                  return (
                    <div key={product._id} className="checkout-item-row">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="checkout-item-img"
                      />
                      <div className="checkout-item-meta">
                        <span className="checkout-item-title">{product.name}</span>
                        <span className="checkout-item-qty">
                          Qty: {item.quantity} × ₹{product.price?.toLocaleString()}
                        </span>
                      </div>
                      <span className="checkout-item-subtotal">
                        ₹{((product.price || 0) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>

              <div className="summary-row">
                <span>Standard Delivery</span>
                <span className="summary-badge-free">FREE</span>
              </div>

              <div className="summary-row">
                <span>Estimated Tax</span>
                <span>Included</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row summary-total">
                <span>Total Due</span>
                <span className="total-amount">₹{subtotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
