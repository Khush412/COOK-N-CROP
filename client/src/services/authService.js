import api from '../config/axios';

const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const resetPassword = async (token, password) => {
  try {
    const response = await api.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export { forgotPassword, resetPassword };