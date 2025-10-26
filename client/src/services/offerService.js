import api from '../config/axios';

const API_URL = '/offers';

const getPersonalizedOffers = async () => {
  try {
    const response = await api.get(`${API_URL}/personalized`);
    return response.data;
  } catch (error) {
    console.error('Error fetching personalized offers:', error);
    throw error.response?.data || error;
  }
};

const getDynamicPricing = async (productId) => {
  try {
    const response = await api.get(`${API_URL}/dynamic-pricing/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dynamic pricing:', error);
    throw error.response?.data || error;
  }
};

const offerService = {
  getPersonalizedOffers,
  getDynamicPricing,
};

export default offerService;