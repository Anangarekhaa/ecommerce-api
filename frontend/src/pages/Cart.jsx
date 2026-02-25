import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      setError('Cart is empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const items = cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      await apiService.createOrder(items);
      setSuccess(true);
      clearCart();
      
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to create order';
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="cart-container">
        <div className="login-prompt">
          <h2>Please login to continue shopping</h2>
          <button onClick={() => navigate('/login')} className="btn-login">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !success) {
    return (
      <div className="cart-container">
        <h1>Shopping Cart</h1>
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button onClick={() => navigate('/products')} className="btn-continue-shopping">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="cart-container">
        <div className="success-message">
          <h2>✓ Order placed successfully!</h2>
          <p>Redirecting to your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Shopping Cart</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="cart-items">
        <table className="cart-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="product-info">
                    <p className="product-name">{item.name}</p>
                    <p className="product-desc">{item.description}</p>
                  </div>
                </td>
                <td className="price">${item.price.toFixed(2)}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    className="quantity-input"
                  />
                </td>
                <td className="total">${(item.price * item.quantity).toFixed(2)}</td>
                <td>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="cart-summary">
        <div className="summary-item">
          <span>Items:</span>
          <span>{cartItems.length}</span>
        </div>
        <div className="summary-item total-price">
          <span>Total Price:</span>
          <span>${getTotalPrice().toFixed(2)}</span>
        </div>
      </div>

      <div className="cart-actions">
        <button
          onClick={() => navigate('/products')}
          className="btn-continue-shopping"
        >
          Continue Shopping
        </button>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="btn-checkout"
        >
          {loading ? 'Processing...' : 'Checkout'}
        </button>
      </div>
    </div>
  );
};

export default Cart;
