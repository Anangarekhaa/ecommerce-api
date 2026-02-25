import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await apiService.getProductById(parseInt(productId));
      setProduct(response.data);
    } catch (err) {
      setError('Failed to fetch product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      addToCart(product, quantity);
      setMessage('Product added to cart!');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };

  if (loading) return <div className="loading">Loading product...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!product) return <div className="error-message">Product not found</div>;

  return (
    <div className="product-detail-container">
      <button onClick={() => navigate('/products')} className="btn-back">
        ← Back to Products
      </button>

      <div className="product-detail">
        <div className="product-detail-header">
          <h1>{product.name}</h1>
        </div>

        <div className="product-detail-body">
          <div className="product-left">
            <img
              src={product.image || `https://source.unsplash.com/900x600/?${encodeURIComponent(product.name)}`}
              alt={product.name}
              className="product-image-large"
              loading="lazy"
            />

            <div className="product-info">
              <div className="info-group">
                <label>Description:</label>
                <p>{product.description || 'No description available'}</p>
              </div>

              <div className="info-group">
                <label>Price:</label>
                <p className="price">${product.price.toFixed(2)}</p>
              </div>

              <div className="info-group">
                <label>Stock:</label>
                <p className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                  {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                </p>
              </div>

              {product.stock > 0 && (
                <div className="info-group">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="quantity-input"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="product-actions">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`btn-add-to-cart ${message ? 'success' : ''}`}
            >
              {message || (product.stock > 0 ? 'Add to Cart' : 'Out of Stock')}
            </button>
            <button onClick={() => navigate('/cart')} className="btn-view-cart">
              View Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
