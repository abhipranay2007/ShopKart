const SearchBar = ({ search, setSearch, category, setCategory }) => {
  const categories = [
    "All Categories",
    "Electronics",
    "Fashion",
    "Books",
    "Home",
    "Sports",
    "Beauty",
  ];

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="category-select"
      >
        {categories.map((cat) => (
          <option key={cat} value={cat === "All Categories" ? "" : cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SearchBar;
