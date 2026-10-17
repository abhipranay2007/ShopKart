import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

const Wishlist = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionStatus, setActionStatus] = useState({}); // { [productId]: 'removing' | 'moving' }

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

  // Fetch wishlist
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await API.get("/wishlist");
      setWishlist(data.wishlist || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Remove item from wishlist
  const handleRemove = async (productId) => {
    try {
      setActionStatus((prev) => ({ ...prev, [productId]: "removing" }));
      await API.delete(`/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((item) => (item._id || item) !== productId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove item from wishlist");
    } finally {
      setActionStatus((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  // Move item to cart (Add to cart + remove from wishlist)
  const handleMoveToCart = async (product) => {
    const productId = product._id;
    try {
      setActionStatus((prev) => ({ ...prev, [productId]: "moving" }));
      await addToCart(productId);
      await API.delete(`/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((item) => (item._id || item) !== productId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to move item to cart");
    } finally {
      setActionStatus((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your saved wishlist...</p>
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
            <h1 className="page-title">❤️ My Wishlist</h1>
            <p className="page-subtitle">
              {wishlist.length === 1
                ? "1 product saved"
                : `${wishlist.length} products saved`}
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
            <button className="btn btn-primary" onClick={fetchWishlist}>
              Retry
            </button>
          </div>
        )}

        {!error && wishlist.length === 0 && (
          <div className="state-message empty-state">
            <span className="empty-icon">🤍</span>
            <h3>Your wishlist is empty</h3>
            <p>Explore products you love and save them to review or purchase later.</p>
            <Link to="/products" className="btn btn-primary">
              Explore Products
            </Link>
          </div>
        )}

        {!error && wishlist.length > 0 && (
          <div className="wishlist-grid">
            {wishlist.map((product) => {
              const isRemoving = actionStatus[product._id] === "removing";
              const isMoving = actionStatus[product._id] === "moving";
              const isOutOfStock = product.stock === 0;

              return (
                <div key={product._id} className="wishlist-card">
                  <div className="wishlist-image-wrapper">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="wishlist-image"
                    />
                    {isOutOfStock && (
                      <span className="out-of-stock-badge">Out of Stock</span>
                    )}
                  </div>
                  <div className="wishlist-info">
                    <span className="product-category">{product.category}</span>
                    <h3 className="wishlist-name">{product.name}</h3>
                    <p className="wishlist-price">₹{product.price?.toLocaleString()}</p>
                    <p className={`product-stock ${isOutOfStock ? "no-stock" : ""}`}>
                      {isOutOfStock ? "Out of stock" : `${product.stock} units available`}
                    </p>

                    <div className="wishlist-actions">
                      <button
                        className="btn btn-move-cart"
                        onClick={() => handleMoveToCart(product)}
                        disabled={isOutOfStock || isMoving || isRemoving}
                      >
                        {isMoving ? "⏳ Moving..." : "🛒 Move to Cart"}
                      </button>

                      <button
                        className="btn btn-remove-wishlist"
                        onClick={() => handleRemove(product._id)}
                        disabled={isRemoving || isMoving}
                      >
                        {isRemoving ? "⏳ Removing..." : "🗑️ Remove"}
                      </button>
                    </div>

                    <Link
                      to={`/products/${product._id}`}
                      className="wishlist-details-link"
                    >
                      View Product Details →
                    </Link>
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

export default Wishlist;
