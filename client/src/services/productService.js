import axios from '../config/axios';

const getAllProducts = async () => {
  try {
    const response = await axios.get('/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products', error);
    throw error;
  }
};

const getProductById = async (id) => {
  try {
    const response = await axios.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with id ${id}`, error);
    throw error;
  }
};

const addToCart = async (productId, quantity) => {
  try {
    const response = await axios.post('/cart', { productId, quantity });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart', error);
    throw error;
  }
};

const getCart = async () => {
  try {
    const response = await axios.get('/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart', error);
    throw error;
  }
};

const updateCartItemQuantity = async (productId, quantity) => {
  try {
    const response = await axios.put(`/cart/item/${productId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error(`Error updating quantity for product ${productId}`, error);
    throw error;
  }
};

const removeCartItem = async (productId) => {
  try {
    const response = await axios.delete(`/cart/item/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing product ${productId} from cart`, error);
    throw error;
  }
};

const clearCart = async () => {
  try {
    const response = await axios.delete('/cart');
    return response.data;
  } catch (error) {
    console.error('Error clearing cart', error);
    throw error;
  }
};

const productService = {
  getAllProducts,
  getProductById,
  addToCart,
  getCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};

export default productService;
