import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to E-Commerce Store</h1>
        <p>Discover amazing products at great prices</p>
        
        <div className="hero-buttons">
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Shop Now
          </button>
          
          {!user && (
            <button
              onClick={() => navigate('/register')}
              className="btn-secondary"
            >
              Create Account
            </button>
          )}
        </div>
      </div>

      <div className="features-section">
        <div className="feature">
          <h3>🚀 Fast Checkout</h3>
          <p>Complete your purchase in seconds</p>
        </div>
        <div className="feature">
          <h3>🔒 Secure</h3>
          <p>Your data is protected with industry standards</p>
        </div>
        <div className="feature">
          <h3>📦 Wide Selection</h3>
          <p>Browse hundreds of products</p>
        </div>
        <div className="feature">
          <h3>💬 Support</h3>
          <p>Dedicated customer service team</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
