import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await API.get("/orders");
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load order history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
          <p>Loading your orders...</p>
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
            <h1 className="page-title">📦 My Orders</h1>
            <p className="page-subtitle">
              {orders.length === 1
                ? "1 order placed"
                : `${orders.length} orders placed`}
            </p>
          </div>
          <Link to="/products" className="btn btn-secondary">
            ← Continue Shopping
          </Link>
        </div>

        {error && (
          <div className="state-message error-state">
            <span>⚠️</span>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchOrders}>
              Retry
            </button>
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="state-message empty-state">
            <span className="empty-icon">📦</span>
            <h3>No orders found</h3>
            <p>You haven't placed any orders yet. Discover our latest products and place your first order!</p>
            <Link to="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        )}

        {!error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString(
                "en-IN",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );

              const totalItems = order.items.reduce(
                (sum, item) => sum + (item.quantity || 1),
                0
              );

              return (
                <div key={order._id} className="order-history-card">
                  <div className="order-card-header">
                    <div className="order-meta-group">
                      <span className="order-id">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="order-date">{formattedDate}</span>
                    </div>

                    <div className="order-status-group">
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          order.paymentStatus || order.status
                        )}`}
                      >
                        Payment: {order.paymentStatus || "PENDING"}
                      </span>
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        Status: {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="order-card-body">
                    {/* Item Thumbnails Preview */}
                    <div className="order-items-preview">
                      {order.items.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="order-preview-thumb">
                          <img
                            src={item.image || "https://placehold.co/100x100?text=Product"}
                            alt={item.name}
                            className="order-thumb-img"
                          />
                          <span className="order-thumb-qty">×{item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="order-thumb-more">
                          +{order.items.length - 4} more
                        </div>
                      )}
                    </div>

                    {/* Order summary info */}
                    <div className="order-card-footer">
                      <div className="order-footer-details">
                        <span className="order-items-count">
                          {totalItems} {totalItems === 1 ? "item" : "items"}
                        </span>
                        <span className="order-total-price">
                          ₹{order.totalAmount?.toLocaleString()}
                        </span>
                      </div>

                      <Link
                        to={`/orders/${order._id}`}
                        className="btn btn-secondary btn-order-view"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Orders;
