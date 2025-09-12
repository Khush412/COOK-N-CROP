import api from '../config/axios';

const API_URL = '/coupons';

const validateCoupon = async (code, cartTotal) => {
  const { data } = await api.post(`${API_URL}/validate`, { code, cartTotal });
  return data;
};

// --- Admin Functions ---

const getAllCoupons = async ({ page = 1, search = '' } = {}) => {
    const params = new URLSearchParams({ page, search });
    const { data } = await api.get(`${API_URL}?${params.toString()}`);
    return data;
};

const createCoupon = async (couponData) => {
    const { data } = await api.post(API_URL, couponData);
    return data;
};

const updateCoupon = async (id, couponData) => {
    const { data } = await api.put(`${API_URL}/${id}`, couponData);
    return data;
};

const deleteCoupon = async (id) => {
    const { data } = await api.delete(`${API_URL}/${id}`);
    return data;
};

const getOrdersByCoupon = async (code, page = 1) => {
    const { data } = await api.get(`${API_URL}/${code}/orders?page=${page}`);
    return data;
};

const couponService = {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getOrdersByCoupon,
};

export default couponService;