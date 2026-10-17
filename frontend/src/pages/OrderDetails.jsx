import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await API.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load order details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "PAID":
      case "PLACED":
      case "DELIVERED":
        return "badge-success";
      case "PENDING":
      case "PENDING_PAYMENT":
      case "SHIPPED":
        return "badge-warning";
      case "FAILED":
      case "CANCELLED":
        return "badge-error";
      default:
        return "badge-default";
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="content-container">
          <div className="state-message error-state">
            <span>⚠️</span>
            <p>{error || "Order not found"}</p>
            <Link to="/orders" className="btn btn-primary">
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isSuccess = order.paymentStatus === "PAID" || order.status === "PLACED";

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="content-container">
        {/* Success Alert Banner */}
        {isSuccess && (
          <div className="order-success-banner">
            <span className="success-icon">🎉</span>
            <div>
              <h3>Thank you for your order!</h3>
              <p>Your order has been placed successfully and is being processed.</p>
            </div>
          </div>
        )}

        <div className="section-header">
          <div>
            <h1 className="page-title">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="page-subtitle">Placed on {formattedDate}</p>
          </div>
          <div className="header-actions">
            <Link to="/orders" className="btn btn-secondary">
              ← Back to Orders
            </Link>
          </div>
        </div>

        <div className="order-details-grid">
          {/* Main Column: Items Breakdown */}
          <div className="order-details-main">
            <div className="details-card">
              <h2 className="details-card-title">📦 Ordered Items ({order.items?.length || 0})</h2>
              <div className="ordered-items-list">
                {order.items?.map((item, index) => {
                  const lineTotal = (item.price || 0) * (item.quantity || 1);
                  return (
                    <div key={index} className="ordered-item-row">
                      <img
                        src={item.image || "https://placehold.co/100x100?text=Product"}
                        alt={item.name}
                        className="ordered-item-image"
                      />
                      <div className="ordered-item-info">
                        <Link
                          to={`/products/${item.product}`}
                          className="ordered-item-title"
                        >
                          {item.name}
                        </Link>
                        <span className="ordered-item-price-qty">
                          ₹{item.price?.toLocaleString()} × {item.quantity}
                        </span>
                      </div>
                      <div className="ordered-item-total">
                        ₹{lineTotal.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Address Card */}
            <div className="details-card">
              <h2 className="details-card-title">📍 Delivery Address</h2>
              {order.shippingAddress ? (
                <div className="shipping-address-display">
                  <p className="addr-name">{order.shippingAddress.fullName}</p>
                  <p className="addr-phone">📞 {order.shippingAddress.phone}</p>
                  <p className="addr-street">{order.shippingAddress.addressLine1}</p>
                  <p className="addr-city-state">
                    {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                    <strong>{order.shippingAddress.pincode}</strong>
                  </p>
                </div>
              ) : (
                <p className="text-muted">No address provided</p>
              )}
            </div>
          </div>

          {/* Sidebar: Order Summary & Payment Info */}
          <div className="order-details-sidebar">
            <div className="summary-card">
              <h2 className="summary-title">Order Status</h2>

              <div className="status-row">
                <span>Order Status:</span>
                <span
                  className={`status-badge ${getStatusBadgeClass(order.status)}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="status-row">
                <span>Payment Status:</span>
                <span
                  className={`status-badge ${getStatusBadgeClass(
                    order.paymentStatus
                  )}`}
                >
                  {order.paymentStatus || "PENDING"}
                </span>
              </div>

              {order.razorpayPaymentId && (
                <div className="status-row razorpay-meta">
                  <span>Razorpay Payment ID:</span>
                  <span className="meta-code">{order.razorpayPaymentId}</span>
                </div>
              )}

              {order.razorpayOrderId && (
                <div className="status-row razorpay-meta">
                  <span>Razorpay Order ID:</span>
                  <span className="meta-code">{order.razorpayOrderId}</span>
                </div>
              )}

              <div className="summary-divider"></div>

              <h2 className="summary-title">Payment Summary</h2>

              <div className="summary-row">
                <span>Items Subtotal</span>
                <span>₹{order.totalAmount?.toLocaleString()}</span>
              </div>

              <div className="summary-row">
                <span>Delivery</span>
                <span className="summary-badge-free">FREE</span>
              </div>

              <div className="summary-row">
                <span>Taxes</span>
                <span>Included</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row summary-total">
                <span>Total Paid</span>
                <span className="total-amount">
                  ₹{order.totalAmount?.toLocaleString()}
                </span>
              </div>

              <Link to="/products" className="btn btn-primary btn-block">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderDetails;
