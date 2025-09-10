import api from '../config/axios';

const getAllUsers = async () => {
  const response = await api.get('/users/all');
  return response.data;
};

const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

const getReportedPosts = async () => {
  const response = await api.get('/posts/reported');
  return response.data;
};

const getReportedComments = async () => {
  const response = await api.get('/comments/reported');
  return response.data;
};

const deletePost = async (postId) => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
};

const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};

const updateUserRole = async (userId, role) => {
  const response = await api.put(`/users/${userId}/role`, { role });
  return response.data;
};

const toggleUserStatus = async (userId) => {
  const response = await api.put(`/users/${userId}/status`);
  return response.data;
};

const createProduct = async (formData) => {
  const response = await api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

const updateProduct = async (productId, formData) => {
  const response = await api.put(`/products/${productId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`);
  return response.data;
};

const getDashboardStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

const adminService = {
  getAllUsers,
  deleteUser,
  getReportedPosts,
  getReportedComments,
  deletePost,
  deleteComment,
  updateUserRole,
  toggleUserStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  getDashboardStats,
};

export default adminService;