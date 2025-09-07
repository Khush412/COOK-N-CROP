import axios from '../config/axios';

const API_URL = '/addresses';

const getAddresses = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const addAddress = async (addressData) => {
    const response = await axios.post(API_URL, addressData);
    return response.data;
};

const updateAddress = async (id, addressData) => {
    const response = await axios.put(`${API_URL}/${id}`, addressData);
    return response.data;
};

const deleteAddress = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

const addressService = {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
};

export default addressService;
