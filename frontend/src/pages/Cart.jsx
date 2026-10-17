import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartLoading,
    cartError,
    cartCount,
    subtotal,
    fetchCart,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [updatingId, setUpdatingId] = useState(null);

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await API.get("/customers/me");
      } catch {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  // Load cart on component mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (productId, currentQty, delta, maxStock) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    if (newQty > maxStock) {
      alert(`Cannot exceed available stock of ${maxStock} units.`);
      return;
    }

    try {
      setUpdatingId(productId);
      await updateQuantity(productId, newQty);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    try {
      setUpdatingId(productId);
      await removeFromCart(productId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove item");
    } finally {
      setUpdatingId(null);
    }
  };

  if (cartLoading && cartItems.length === 0) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your cart...</p>
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
            <h1 className="page-title">🛒 Shopping Cart</h1>
            <p className="page-subtitle">
              {cartCount === 1 ? "1 item in your cart" : `${cartCount} items in your cart`}
            </p>
          </div>
          <Link to="/products" className="btn btn-secondary">
            ← Continue Shopping
          </Link>
        </div>

        {cartError && (
          <div className="state-message error-state">
            <span>⚠️</span>
            <p>{cartError}</p>
            <button className="btn btn-primary" onClick={fetchCart}>
              Retry
            </button>
          </div>
        )}

        {!cartError && cartItems.length === 0 && (
          <div className="state-message empty-state">
            <span className="empty-icon">🛒</span>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        )}

        {!cartError && cartItems.length > 0 && (
          <div className="cart-layout">
            {/* Cart Items List */}
            <div className="cart-items-list">
              {cartItems.map((item) => {
                const product = item.product || {};
                const productId = product._id;
                const isUpdating = updatingId === productId;
                const itemTotal = (product.price || 0) * item.quantity;
                const maxStock = product.stock || 1;

                return (
                  <div key={productId} className="cart-item-card">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="cart-item-image"
                    />

                    <div className="cart-item-details">
                      <span className="product-category">{product.category}</span>
                      <Link
                        to={`/products/${productId}`}
                        className="cart-item-name"
                      >
                        {product.name}
                      </Link>
                      <p className="cart-item-price">
                        ₹{product.price?.toLocaleString()}{" "}
                        <span className="cart-unit-label">each</span>
                      </p>
                      <p className="cart-item-stock-hint">
                        {maxStock > 5
                          ? "In stock"
                          : `Only ${maxStock} left in stock`}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="cart-item-quantity-section">
                      <div className="quantity-controls">
                        <button
                          className="qty-btn"
                          onClick={() =>
                            handleQuantityChange(productId, item.quantity, -1, maxStock)
                          }
                          disabled={item.quantity <= 1 || isUpdating}
                          title="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="qty-number">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() =>
                            handleQuantityChange(productId, item.quantity, 1, maxStock)
                          }
                          disabled={item.quantity >= maxStock || isUpdating}
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="btn-remove-cart-item"
                        onClick={() => handleRemove(productId)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? "⏳..." : "🗑️ Remove"}
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="cart-item-line-total">
                      <span className="line-total-label">Subtotal</span>
                      <span className="line-total-amount">
                        ₹{itemTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div className="cart-summary-sidebar">
              <div className="summary-card">
                <h2 className="summary-title">Order Summary</h2>

                <div className="summary-row">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="summary-value">₹{subtotal.toLocaleString()}</span>
                </div>

                <div className="summary-row">
                  <span>Estimated Shipping</span>
                  <span className="summary-badge-free">FREE</span>
                </div>

                <div className="summary-row">
                  <span>GST / Tax</span>
                  <span className="summary-value">Included</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row summary-total">
                  <span>Order Total</span>
                  <span className="total-amount">₹{subtotal.toLocaleString()}</span>
                </div>

                <button
                  className="btn btn-primary btn-checkout-proceed"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout →
                </button>

                <div className="summary-guarantee">
                  <span>🔒 Secure 256-bit encrypted checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
