import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";

const Home = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch customer profile
        const { data: profile } = await API.get("/customers/me");
        setCustomer(profile);

        // Fetch featured top products for showcase
        try {
          const { data: prodData } = await API.get("/products?sort=price_desc");
          if (prodData?.products) {
            setFeaturedProducts(prodData.products.slice(0, 4));
          }
        } catch (err) {
          console.warn("Could not load featured products:", err);
        }
      } catch (error) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [navigate]);

  const categories = [
    { name: "Electronics", icon: "⚡", label: "Tech & Gadgets" },
    { name: "Footwear", icon: "👟", label: "Sneakers & Kicks" },
    { name: "Fashion", icon: "👔", label: "Apparel & Style" },
    { name: "Accessories", icon: "🎒", label: "Daily Essentials" },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your ShopKart experience...</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="home-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-pulse"></span>
              <span>Next-Gen MERN E-Commerce</span>
            </div>
            <h1 className="hero-title">
              Elevate Your Shopping <span className="gradient-text">Experience</span>.
            </h1>
            <p className="hero-subtitle">
              Discover cutting-edge gadgets, premium apparel, and trending essentials with real-time stock sync and secure checkout.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-hero-primary">
                <span>Explore Catalog</span>
                <span className="btn-arrow">→</span>
              </Link>
              <Link to="/wishlist" className="btn btn-hero-secondary">
                <span>View Wishlist ❤️</span>
              </Link>
            </div>
          </div>
          
          <div className="hero-stats-banner">
            <div className="hero-stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Authentic Items</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="stat-number">Fast</span>
              <span className="stat-label">Express Delivery</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="stat-number">256-bit</span>
              <span className="stat-label">Razorpay Encrypted</span>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="features-strip">
          <div className="feature-item">
            <span className="feature-icon">🚀</span>
            <div>
              <h4>Express Shipping</h4>
              <p>Priority delivery direct to your doorstep</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <div>
              <h4>Secure Razorpay</h4>
              <p>HMAC verified test checkout gateway</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔄</span>
            <div>
              <h4>30-Day Returns</h4>
              <p>Instant refunds on verified returns</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💬</span>
            <div>
              <h4>24/7 Support</h4>
              <p>Always here to resolve your inquiries</p>
            </div>
          </div>
        </section>

        {/* Category Quick Navigation */}
        <section className="categories-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">Find exactly what you're looking for with curated departments</p>
            </div>
            <Link to="/products" className="section-link">View All Categories →</Link>
          </div>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name}`}
                className="category-card"
              >
                <div className="category-icon">{cat.icon}</div>
                <h3 className="category-title">{cat.name}</h3>
                <span className="category-subtitle">{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="featured-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Featured Highlights</h2>
                <p className="section-subtitle">Top-tier products available in stock right now</p>
              </div>
              <Link to="/products" className="section-link">Browse All Products →</Link>
            </div>
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Customer Profile Banner */}
        <section className="home-profile-section">
          <div className="welcome-card modern-card">
            <div className="welcome-avatar-wrapper">
              <div className="welcome-avatar">
                {customer?.fullName?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="verified-badge" title="Verified Customer">✓</span>
            </div>
            <div className="welcome-info">
              <div className="welcome-heading">
                <span className="customer-status-pill">Active Member</span>
                <h2 className="welcome-title">
                  Signed in as {customer?.fullName}
                </h2>
              </div>
              <div className="profile-details-grid">
                <div className="profile-chip">
                  <span className="chip-icon">📧</span>
                  <span className="chip-val">{customer?.email}</span>
                </div>
                {customer?.phone && (
                  <div className="profile-chip">
                    <span className="chip-icon">📱</span>
                    <span className="chip-val">{customer?.phone}</span>
                  </div>
                )}
                <div className="profile-chip">
                  <span className="chip-icon">🛡️</span>
                  <span className="chip-val">JWT Protected Session</span>
                </div>
              </div>
            </div>
            <div className="profile-card-actions">
              <Link to="/orders" className="btn btn-outline-profile">
                Order History
              </Link>
              <Link to="/cart" className="btn btn-primary-profile">
                Go to Cart
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
