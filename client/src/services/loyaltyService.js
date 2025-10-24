import api from '../config/axios';

// Get user's Harvest Coins balance
export const getHarvestCoinsBalance = async () => {
  try {
    const response = await api.get('/loyalty/balance');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch Harvest Coins balance');
  }
};

// Redeem Harvest Coins for discount
export const redeemHarvestCoins = async (coins, orderValue) => {
  try {
    const response = await api.post('/loyalty/redeem', { coins, orderValue });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to redeem Harvest Coins');
  }
};