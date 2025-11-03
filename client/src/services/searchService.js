import api from '../config/axios';

const globalSearch = async (query) => {
  try {
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error performing global search:', error);
    throw error;
  }
};

const searchPosts = async (query, page = 1) => {
  try {
    const response = await api.get(`/search/posts?q=${encodeURIComponent(query)}&page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Error searching posts:', error);
    throw error;
  }
};

const searchProducts = async (query, page = 1) => {
  try {
    const response = await api.get(`/search/products?q=${encodeURIComponent(query)}&page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// New function for product suggestions/autocomplete
const getProductSuggestions = async (query, limit = 5) => {
  try {
    const response = await api.get(`/search/product-suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error getting product suggestions:', error);
    throw error;
  }
};

const searchUsers = async (query, page = 1) => {
  try {
    const response = await api.get(`/search/users?q=${encodeURIComponent(query)}&page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

const searchByHashtag = async (hashtag, page = 1) => {
  try {
    // Remove # if user included it
    const cleanHashtag = hashtag.replace(/^#/, '');
    const response = await api.get(`/search/hashtag/${encodeURIComponent(cleanHashtag)}?page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Error searching by hashtag:', error);
    throw error;
  }
};

const getTrendingHashtags = async (limit = 10) => {
  try {
    const response = await api.get(`/search/trending-hashtags?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trending hashtags:', error);
    throw error;
  }
};

// Add a helper function to get the first image URL for a product
const getProductImageUrl = (product) => {
  if (product.images && product.images.length > 0) {
    return `${process.env.REACT_APP_API_URL}${product.images[0]}`;
  }
  return `${process.env.PUBLIC_URL}/images/placeholder.png`;
};

const searchService = {
  globalSearch,
  searchPosts,
  searchProducts,
  getProductSuggestions,
  searchUsers,
  searchByHashtag,
  getTrendingHashtags,
  getProductImageUrl, // Export the helper function
};

export default searchService;