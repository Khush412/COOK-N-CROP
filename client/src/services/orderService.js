import axios from '../config/axios';

const API_URL = '/orders';

const createOrder = async (orderData) => {
    const response = await axios.post(API_URL, orderData);
    return response.data;
};

const getOrderDetails = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

const getMyOrders = async () => {
    const response = await axios.get(`${API_URL}/myorders`);
    return response.data;
};

const orderService = {
    createOrder,
    getOrderDetails,
    getMyOrders,
};

export default orderService;
