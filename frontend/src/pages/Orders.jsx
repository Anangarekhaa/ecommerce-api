import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const [showAllOrders, setShowAllOrders] = useState(isAdmin);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchOrders();
  }, [user, navigate, showAllOrders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (showAllOrders && isAdmin) {
        response = await apiService.getAllOrders();
      } else {
        response = await apiService.getMyOrders();
      }
      
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus, index) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      
      // Update local state
      const updatedOrders = [...orders];
      updatedOrders[index].status = newStatus;
      setOrders(updatedOrders);
    } catch (err) {
      setError('Failed to update order status');
      console.error(err);
    }
  };

  if (!user) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <div className="orders-container">
      <h1>Orders</h1>

      {isAdmin && (
        <div className="admin-toggle">
          <button
            onClick={() => setShowAllOrders(false)}
            className={!showAllOrders ? 'active' : ''}
          >
            My Orders
          </button>
          <button
            onClick={() => setShowAllOrders(true)}
            className={showAllOrders ? 'active' : ''}
          >
            All Orders
          </button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="loading">Loading orders...</div>}

      {!loading && orders.length === 0 && (
        <div className="empty-message">
          <p>No orders found</p>
          <button onClick={() => navigate('/products')} className="btn-shop">
            Continue Shopping
          </button>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order, index) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.id}</h3>
                  <p className="order-date">Total: ${order.total_price.toFixed(2)}</p>
                </div>
                <div className="order-status">
                  {isAdmin ? (
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value, index)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <span className={`status-badge ${order.status}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>

              <div className="order-items">
                <h4>Items:</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Product ID</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.product_id}>
                        <td>#{item.product_id}</td>
                        <td>{item.quantity}</td>
                        <td>${item.price_at_purchase.toFixed(2)}</td>
                        <td>${(item.price_at_purchase * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
