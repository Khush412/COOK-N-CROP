import api from '../config/axios';

const getPosts = async (sort = 'new', page = 1, options = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('sort', sort);
    params.append('page', page);
    if (options.isRecipe) {
      params.append('isRecipe', 'true');
    }
    const response = await api.get(`/posts?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

const createPost = async (postData) => {
  try {
    const response = await api.post('/posts', postData);
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

const toggleUpvote = async (postId) => {
  try {
    const response = await api.put(`/posts/${postId}/upvote`);
    return response.data;
  } catch (error) {
    console.error('Error toggling upvote:', error);
    throw error;
  }
};

const getPostById = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    throw error;
  }
};

const addComment = async (postId, { content, parentCommentId }) => {
  try {
    const response = await api.post(`/posts/${postId}/comments`, { content, parentCommentId });
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

const toggleCommentUpvote = async (commentId) => {
  try {
    // Note: The endpoint is /comments, not /posts
    const response = await api.put(`/comments/${commentId}/upvote`);
    return response.data;
  } catch (error) {
    console.error('Error toggling comment upvote:', error);
    throw error;
  }
};

const updatePost = async (postId, postData) => {
  try {
    const response = await api.put(`/posts/${postId}`, postData);
    return response.data;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

const deletePost = async (postId) => {
  try {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

const updateComment = async (commentId, commentData) => {
  try {
    const response = await api.put(`/comments/${commentId}`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

const reportPost = async (postId, reason) => {
  try {
    const response = await api.put(`/posts/${postId}/report`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error reporting post:', error);
    throw error;
  }
};

const reportComment = async (commentId, reason) => {
  try {
    const response = await api.put(`/comments/${commentId}/report`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error reporting comment:', error);
    throw error;
  }
};

const getTrendingTags = async () => {
  try {
    const response = await api.get('/posts/tags/trending');
    return response.data;
  } catch (error) {
    console.error('Error fetching trending tags:', error);
    throw error;
  }
};

const getFeedPosts = async (page = 1) => {
  try {
    const response = await api.get(`/posts/feed?page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching feed posts:', error);
    throw error;
  }
};

const getShoppableIngredients = async (postId) => {
  const { data } = await api.get(`/posts/${postId}/shoppable-ingredients`);
  return data;
};

const communityService = {
  getPosts,
  createPost,
  toggleUpvote,
  getPostById,
  addComment,
  toggleCommentUpvote,
  updatePost,
  deletePost,
  updateComment,
  deleteComment,
  reportPost,
  reportComment,
  getTrendingTags,
  getFeedPosts,
  getShoppableIngredients,
};

export default communityService;
