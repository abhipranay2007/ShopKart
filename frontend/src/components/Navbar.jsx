import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import API from "../services/api";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, clearCart } = useCart();

  const handleLogout = async () => {
    try {
      await API.post("/customers/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearCart();
      navigate("/login");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-header">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/home" className="navbar-logo">
            <span className="logo-sparkle">✦</span>
            <span className="logo-text">ShopKart</span>
            <span className="logo-edition">PRO</span>
          </Link>
        </div>
        <div className="navbar-links">
          <Link to="/home" className={`nav-link ${isActive("/home") ? "active" : ""}`}>
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </Link>
          <Link to="/products" className={`nav-link ${isActive("/products") ? "active" : ""}`}>
            <span className="nav-icon">🛍️</span>
            <span>Products</span>
          </Link>
          <Link to="/wishlist" className={`nav-link ${isActive("/wishlist") ? "active" : ""}`}>
            <span className="nav-icon">❤️</span>
            <span>Wishlist</span>
          </Link>
          <Link to="/cart" className={`nav-link nav-link-cart ${isActive("/cart") ? "active" : ""}`}>
            <span className="nav-icon">🛒</span>
            <span>Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          <Link to="/orders" className={`nav-link ${isActive("/orders") ? "active" : ""}`}>
            <span className="nav-icon">📦</span>
            <span>Orders</span>
          </Link>
          <button onClick={handleLogout} className="btn btn-logout" title="Sign out of your account">
            <span>Logout</span>
            <span className="logout-arrow">→</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
