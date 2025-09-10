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

const userService = {
  getPublicProfile,
  toggleSavePost,
  getSavedPosts,
};

export default userService;
