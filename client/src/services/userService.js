import api from '../config/axios';

const getPublicProfile = async (username) => {
  try {
    const response = await api.get(`/users/profile/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching public profile:', error);
    throw error;
  }
};

const toggleSavePost = async (postId) => {
  try {
    const response = await api.put(`/users/me/posts/save/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error toggling save post:', error);
    throw error;
  }
};

const getSavedPosts = async () => {
  try {
    const response = await api.get('/users/me/posts/saved');
    return response.data;
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    throw error;
  }
};

const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/users/me/password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error.response?.data || error;
  }
};

const deleteAccount = async (password) => {
  try {
    const response = await api.post('/users/me/delete-account', { password });
    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error.response?.data || error;
  }
};

const toggleFollow = async (userId) => {
  try {
    const response = await api.put(`/users/${userId}/follow`);
    return response.data;
  } catch (error) {
    console.error('Error toggling follow:', error);
    throw error.response?.data || error;
  }
};

const toggleWishlist = async (productId) => {
  try {
    const response = await api.put(`/users/me/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    throw error.response?.data || error;
  }
};

const getWishlist = async () => {
  try {
    const response = await api.get('/users/me/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error.response?.data || error;
  }
};

const getMyActivity = async () => {
  try {
    const response = await api.get('/users/me/activity');
    return response.data;
  } catch (error) {
    console.error('Error fetching my activity:', error);
    throw error.response?.data || error;
  }
};

const blockUser = async (userId) => {
  try {
    const response = await api.put(`/users/${userId}/block`);
    return response.data;
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error.response?.data || error;
  }
};

const getBlockedUsers = async () => {
  try {
    const response = await api.get('/users/me/blocked');
    return response.data;
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    throw error.response?.data || error;
  }
};

const userService = {
  getPublicProfile,
  toggleSavePost,
  getSavedPosts,
  changePassword,
  deleteAccount,
  toggleFollow,
  toggleWishlist,
  getWishlist,
  getMyActivity,
  blockUser,
  getBlockedUsers,
};

export default userService;
