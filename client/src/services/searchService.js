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

const searchUsers = async (query, page = 1) => {
  try {
    const response = await api.get(`/search/users?q=${encodeURIComponent(query)}&page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

const searchService = {
  globalSearch,
  searchPosts,
  searchProducts,
  searchUsers,
};

export default searchService;