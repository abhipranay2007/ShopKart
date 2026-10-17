import { Link } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const [wishlistStatus, setWishlistStatus] = useState("idle"); // idle | saving | saved | error
  const [cartStatus, setCartStatus] = useState("idle"); // idle | adding | error
  const { addToCart } = useCart();

  const handleAddToWishlist = async () => {
    if (wishlistStatus === "saving" || wishlistStatus === "saved") return;
    try {
      setWishlistStatus("saving");
      await API.post(`/wishlist/${product._id}`);
      setWishlistStatus("saved");
    } catch (error) {
      if (error.response?.status === 409) {
        setWishlistStatus("saved"); // Already in wishlist
      } else {
        setWishlistStatus("error");
        setTimeout(() => setWishlistStatus("idle"), 2000);
      }
    }
  };

  const handleAddToCart = async () => {
    if (cartStatus === "adding") return;
    try {
      setCartStatus("adding");
      await addToCart(product._id);
      setCartStatus("idle");
    } catch (error) {
      setCartStatus("error");
      setTimeout(() => setCartStatus("idle"), 2000);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
        />
        {product.stock === 0 && (
          <span className="out-of-stock-badge">Out of Stock</span>
        )}
      </div>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">₹{product.price.toLocaleString()}</p>
        <p className={`product-stock ${product.stock === 0 ? "no-stock" : ""}`}>
          {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
        </p>
        <div className="product-actions">
          <Link to={`/products/${product._id}`} className="btn btn-view-details">
            View Details
          </Link>
          <button
            className={`btn btn-wishlist ${wishlistStatus === "saved" ? "wishlisted" : ""}`}
            onClick={handleAddToWishlist}
            disabled={wishlistStatus === "saving"}
          >
            {wishlistStatus === "idle" && "♡ Wishlist"}
            {wishlistStatus === "saving" && "⏳ Saving..."}
            {wishlistStatus === "saved" && "♥ Saved"}
            {wishlistStatus === "error" && "⚠ Retry"}
          </button>
          {product.stock > 0 && (
            <button
              className="btn btn-add-cart"
              onClick={handleAddToCart}
              disabled={cartStatus === "adding"}
            >
              {cartStatus === "idle" && "🛒 Add to Cart"}
              {cartStatus === "adding" && "⏳ Adding..."}
              {cartStatus === "error" && "⚠ Retry"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
