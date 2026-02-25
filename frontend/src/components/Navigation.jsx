import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { getTotalQuantity } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🛍️ E-Commerce Store
        </Link>

        <div className="nav-menu">
          <Link to="/products" className="nav-link">
            Products
          </Link>

          {user && (
            <>
              <Link to="/orders" className="nav-link">
                My Orders
              </Link>

              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link admin-link">
                  Admin Panel
                </Link>
              )}
            </>
          )}
        </div>

        <div className="nav-right">
          {user ? (
            <>
              <Link to="/cart" className="nav-cart">
                🛒 Cart
                {getTotalQuantity() > 0 && (
                  <span className="cart-badge">{getTotalQuantity()}</span>
                )}
              </Link>
              <div className="nav-user">
                <span className="user-email">{user.email}</span>
                {user.role === 'admin' && <span className="admin-badge">Admin</span>}
                <button onClick={handleLogout} className="nav-logout">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link btn-register">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
