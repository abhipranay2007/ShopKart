import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams(); // Get the product ID from the URL
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartStatus, setCartStatus] = useState("idle"); // idle | adding | added | error
  const [wishlistStatus, setWishlistStatus] = useState("idle"); // idle | saving | saved | error

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

  // Fetch the single product by ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data.product);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Something went wrong while loading the product."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (cartStatus === "adding") return;
    try {
      setCartStatus("adding");
      await addToCart(product._id);
      setCartStatus("added");
      setTimeout(() => setCartStatus("idle"), 2500);
    } catch {
      setCartStatus("error");
      setTimeout(() => setCartStatus("idle"), 2000);
    }
  };

  const handleAddToWishlist = async () => {
    if (wishlistStatus === "saving" || wishlistStatus === "saved") return;
    try {
      setWishlistStatus("saving");
      await API.post(`/wishlist/${product._id}`);
      setWishlistStatus("saved");
    } catch (err) {
      if (err.response?.status === 409) {
        setWishlistStatus("saved");
      } else {
        setWishlistStatus("error");
        setTimeout(() => setWishlistStatus("idle"), 2000);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="state-message error-state">
          <span>⚠️</span>
          <p>{error}</p>
          <Link to="/products" className="btn btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="product-details-container">
        <Link to="/products" className="back-link">
          ← Back to Products
        </Link>

        <div className="product-details-card">
          <div className="product-details-image">
            <img src={product.image} alt={product.name} />
          </div>

          <div className="product-details-info">
            <span className="product-category-badge">{product.category}</span>
            <h1 className="product-details-name">{product.name}</h1>
            <p className="product-details-description">{product.description}</p>
            <p className="product-details-price">
              ₹{product.price.toLocaleString()}
            </p>

            <div className="product-details-stock">
              <span
                className={`stock-indicator ${
                  product.stock > 0 ? "in-stock" : "out-of-stock"
                }`}
              ></span>
              {product.stock > 0
                ? `${product.stock} units in stock`
                : "Out of stock"}
            </div>

            <div className="product-details-actions">
              <button
                className="btn btn-add-to-cart"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || cartStatus === "adding"}
              >
                {product.stock === 0 && "Out of Stock"}
                {product.stock > 0 && cartStatus === "idle" && "🛒 Add to Cart"}
                {product.stock > 0 && cartStatus === "adding" && "⏳ Adding..."}
                {product.stock > 0 && cartStatus === "added" && "✓ Added to Cart!"}
                {product.stock > 0 && cartStatus === "error" && "⚠ Error, Retry"}
              </button>

              <button
                className={`btn btn-wishlist-detail ${
                  wishlistStatus === "saved" ? "wishlisted" : ""
                }`}
                onClick={handleAddToWishlist}
                disabled={wishlistStatus === "saving"}
              >
                {wishlistStatus === "idle" && "♡ Save to Wishlist"}
                {wishlistStatus === "saving" && "⏳ Saving..."}
                {wishlistStatus === "saved" && "♥ In Wishlist"}
                {wishlistStatus === "error" && "⚠ Retry"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetails;
