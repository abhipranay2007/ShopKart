import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/home" className="footer-logo">
              🛒 ShopKart
            </Link>
            <p className="footer-tagline">
              Your premier destination for high-grade tech, fashion, and lifestyle essentials. Built with modern full-stack performance.
            </p>
            <div className="footer-badges">
              <span className="badge-pill">🔒 Razorpay Secure</span>
              <span className="badge-pill">⚡ Express Delivery</span>
              <span className="badge-pill">🛡️ 100% Authentic</span>
            </div>
          </div>

          <div className="footer-nav-group">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/home">Home</Link></li>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/cart">My Cart</Link></li>
              <li><Link to="/orders">Order History</Link></li>
            </ul>
          </div>

          <div className="footer-nav-group">
            <h4>Popular Categories</h4>
            <ul>
              <li><Link to="/products?category=Electronics">Electronics & Audio</Link></li>
              <li><Link to="/products?category=Footwear">Footwear & Sneakers</Link></li>
              <li><Link to="/products?category=Fashion">Apparel & Fashion</Link></li>
              <li><Link to="/products?category=Accessories">Accessories</Link></li>
            </ul>
          </div>

          <div className="footer-nav-group">
            <h4>Customer Care</h4>
            <ul>
              <li><span className="footer-text-dim">support@shopkart.io</span></li>
              <li><span className="footer-text-dim">Available 24/7 for assistance</span></li>
              <li><span className="footer-text-dim">Easy 30-Day Hassle-Free Returns</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ShopKart. Handcrafted with ❤️ by <strong>Abhipranay</strong>.</p>
          <div className="footer-tech-stack">
            <span>React 19</span> • <span>Node.js</span> • <span>Express</span> • <span>MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
