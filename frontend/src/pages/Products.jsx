import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { useCart } from '../context/CartContext';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [order, setOrder] = useState('asc');
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [addedProduct, setAddedProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const currentPage = Math.max(1, page);
      const response = await apiService.getProducts(currentPage, pageSize, {
        search: search || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        sortBy,
        order,
      });

      const { items = [], total = 0 } = response.data;
      
      console.log('✅ Products received:', items.length, 'products');
      
      if (!Array.isArray(items)) {
        throw new Error(`Items is not an array: ${typeof items}`);
      }

      setProducts(items);
      setTotal(total);
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, minPrice, maxPrice, sortBy, order]);

  useEffect(() => {
    fetchProducts();
  }, [page, pageSize, search, minPrice, maxPrice, sortBy, order]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedProduct(product.id);
    setTimeout(() => setAddedProduct(null), 2000);
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>🛍️ Our Products</h1>
        <p>Discover our exclusive collection</p>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-group search-group">
          <label>🔍 Search Products</label>
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && setPage(1)}
              className="search-input"
            />
            <button 
              onClick={() => setPage(1)} 
              className="search-btn"
              title="Search products"
            >
              🔍
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label>💰 Price Range</label>
          <div className="price-inputs">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="filter-input"
            />
            <span className="price-separator">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="filter-input"
            />
          </div>
        </div>

        <div className="filter-group">
          <label>📊 Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="id">ID</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="stock">Stock</option>
          </select>
        </div>

        <div className="filter-group">
          <label>↕️ Order</label>
          <select value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <div className="filter-group">
          <label>📄 Items Per Page</label>
          <select value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value))}>
            <option value={5}>5 items</option>
            <option value={10}>10 items</option>
            <option value={20}>20 items</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading amazing products...</p>
        </div>
      )}

      {!loading && (
        <>
          {products.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">📦</div>
              <h2>No Products Found</h2>
              <p>Try adjusting your filters or search terms</p>
              <details style={{ marginTop: '20px', textAlign: 'left', fontSize: '12px', color: '#666' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Debug Info</summary>
                <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto', maxHeight: '300px' }}>
{JSON.stringify({
  productsArray: products,
  productsCount: products?.length || 0,
  total: total,
  page: page,
  pageSize: pageSize
}, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <>
              <div className="products-count">Found {total} product(s)</div>
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product.id} className="product-card">
                    {product.category && <div className="category-badge">{product.category}</div>}
                    <div className="product-media" onClick={() => handleProductClick(product.id)}>
                      <img
                        src={
                          product.image ||
                          `https://source.unsplash.com/600x400/?${encodeURIComponent(product.name)}`
                        }
                        alt={product.name}
                        className="product-image"
                        loading="lazy"
                      />
                    </div>

                    <div className="product-header" onClick={() => handleProductClick(product.id)}>
                      <h3>{product.name}</h3>
                      <div className="product-sub">{product.category || ''}</div>
                    </div>

                    <div className="product-body">
                      <p className="description">{product.description || 'No description available'}</p>
                      <div className="product-meta">
                        <span className="price">{Number(product.price).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
                        <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </div>

                    <div className="product-footer">
                      <button
                        onClick={() => handleProductClick(product.id)}
                        className="btn-view"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className={`btn-cart ${addedProduct === product.id ? 'added' : ''}`}
                      >
                        {addedProduct === product.id ? '✓ Added' : 'Add to cart'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {products.length > 0 && (
            <div className="pagination">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="pagination-btn"
              >
                ← Previous
              </button>
              <div className="page-info">
                <span>Page <strong>{page}</strong> of <strong>{totalPages}</strong></span>
              </div>
              <button
                onClick={() => setPage(prev => Math.min(totalPages || prev, prev + 1))}
                disabled={page === totalPages}
                className="pagination-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
