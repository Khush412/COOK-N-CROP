import axios from '../config/axios';

const getAllProducts = async ({
  page = 1,
  search = '',
  category = 'All',
  minPrice = 0,
  maxPrice = 100,
  sort = 'default'
} = {}) => {
  try {
    const params = new URLSearchParams({ page, search, category, minPrice, maxPrice, sort });
    const response = await axios.get(`/products?${params.toString()}`);
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

const createProductReview = async (productId, review) => {
  try {
    const response = await axios.post(`/products/${productId}/reviews`, review);
    return response.data;
  } catch (error) {
    console.error(`Error creating review for product ${productId}`, error);
    throw error;
  }
};

const toggleReviewUpvote = async (productId, reviewId) => {
  try {
    const response = await axios.put(`/products/${productId}/reviews/${reviewId}/upvote`);
    return response.data;
  } catch (error) {
    console.error(`Error toggling upvote for review ${reviewId}`, error);
    throw error;
  }
};

const createProduct = async (productData) => {
  // productData should be FormData
  const { data } = await axios.post('/products', productData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

const updateProduct = async (id, productData) => {
  // productData should be FormData
  const { data } = await axios.put(`/products/${id}`, productData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

const deleteProduct = async (id) => {
  const { data } = await axios.delete(`/products/${id}`);
  return data;
};

const addMultipleToCart = async (items) => {
  // The endpoint should match where you added the backend route
  const { data } = await axios.post('/cart/add-multiple', { items });
  return data;
};

const searchProductsForTagging = async (query) => {
  const { data } = await axios.get(`/products/search?q=${query}`);
  return data;
};


const productService = {
  getAllProducts,
  getProductById,
  addToCart,
  getCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  createProductReview,
  toggleReviewUpvote,
  createProduct,
  updateProduct,
  deleteProduct,
  addMultipleToCart,
  searchProductsForTagging,
};

export default productService;
