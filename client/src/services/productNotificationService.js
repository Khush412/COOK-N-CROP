import api from '../config/axios';

// Set up price drop alert for a product
const setUpPriceDropAlert = async (productId) => {
  try {
    // In a real implementation, this would call a specific endpoint
    // For now, we'll simulate by adding the product to user's wishlist
    // which will trigger notifications when price drops
    const response = await api.put(`/users/me/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error setting up price drop alert:', error);
    throw error.response?.data || error;
  }
};

// Set up restock alert for a product
const setUpRestockAlert = async (productId) => {
  try {
    // In a real implementation, this would call a specific endpoint
    // For now, we'll simulate by adding the product to user's wishlist
    // which will trigger notifications when product is restocked
    const response = await api.put(`/users/me/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error setting up restock alert:', error);
    throw error.response?.data || error;
  }
};

// Get user's product alerts
const getProductAlerts = async () => {
  try {
    const response = await api.get('/users/me/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching product alerts:', error);
    throw error.response?.data || error;
  }
};

const productNotificationService = {
  setUpPriceDropAlert,
  setUpRestockAlert,
  getProductAlerts,
};

export default productNotificationService;