import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  // Check if user is authenticated
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

  // Fetch products whenever search, category, or sort changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        // Build query string dynamically
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (category) params.append("category", category);
        if (sort) params.append("sort", sort);

        const queryString = params.toString();
        const url = `/products${queryString ? `?${queryString}` : ""}`;

        const { data } = await API.get(url);
        setProducts(data.products);
      } catch (err) {
        setError("Something went wrong while loading products.");
      } finally {
        setLoading(false);
      }
    };

    // Debounce search input to avoid too many API calls
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search, category, sort]);

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="products-container">
        <div className="products-header">
          <h1>Our Products</h1>
          <p>Discover amazing deals on ShopKart</p>
        </div>

        <SearchBar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
        />

        {/* Bonus: Sort controls */}
        <div className="sort-controls">
          <label>Sort by: </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="sort-select"
          >
            <option value="">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="state-message error-state">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="state-message empty-state">
            <span>📦</span>
            <p>No products found.</p>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Products;
