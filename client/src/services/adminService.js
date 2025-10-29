import api from '../config/axios';

const getAllUsers = async ({ page = 1, search = '' }) => {
  const params = new URLSearchParams({ page, search });
  const response = await api.get(`/users/all?${params.toString()}`);
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

const updateMultipleUserStatuses = async (userIds, isActive) => {
  const response = await api.put('/users/bulk-status', { userIds, isActive });
  return response.data;
};

const createProduct = async (formData) => {
  const response = await api.post('/products', formData);
  return response.data;
};

const updateProduct = async (productId, formData) => {
  const response = await api.put(`/products/${productId}`, formData);
  return response.data;
};

const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`);
  return response.data;
};

const deleteMultipleProducts = async (productIds) => {
  const response = await api.delete('/products', { data: { productIds } }); // Pass IDs in the body
  return response.data;
};

const searchUsers = async (query) => {
  const response = await api.get(`/users/search?q=${query}`);
  return response.data;
};

const searchProductsForAdmin = async (query) => {
  const response = await api.get(`/products?search=${query}&page=1&limit=10`);
  return response.data.products;
};

const createOrderForUser = async (orderData) => {
  const response = await api.post('/orders/admin/create', orderData);
  return response.data;
};

const editOrder = async (orderId, orderData) => {
  const response = await api.put(`/orders/admin/edit/${orderId}`, orderData);
  return response.data;
};

const sendBroadcast = async (message, link) => {
  const response = await api.post('/admin/broadcast', { message, link });
  return response.data;
};

const getLowStockProducts = async ({ page = 1, threshold = 10 }) => {
  const params = new URLSearchParams({ page, threshold });
  const response = await api.get(`/products/low-stock?${params.toString()}`);
  return response.data;
};

const getUserAddresses = async (userId) => {
  const response = await api.get(`/users/${userId}/addresses`);
  return response.data;
};

const deleteUserAddress = async (userId, addressId) => {
  const response = await api.delete(`/users/${userId}/addresses/${addressId}`);
  return response.data;
};

const getRecentActivity = async () => {
  const response = await api.get('/admin/recent-activity');
  return response.data;
};

const getDashboardStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

const getAllOrders = async ({ page = 1, search = '', status = 'All' }) => {
  const params = new URLSearchParams({ page, search, status });
  const response = await api.get(`/orders?${params.toString()}`);
  return response.data;
};

const updateOrderToPaid = async (orderId) => {
  const response = await api.put(`/orders/${orderId}/pay`);
  return response.data;
};

const updateOrderToDelivered = async (orderId) => {
  const response = await api.put(`/orders/${orderId}/deliver`);
  return response.data;
};

const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/orders/${orderId}/status`, { status });
  return response.data;
};

const toggleFeatureProduct = async (productId) => {
  const response = await api.put(`/products/${productId}/feature`);
  return response.data;
};

const exportUsers = async () => {
  const response = await api.get('/admin/users/export', {
    responseType: 'blob', // Important to handle the file download
  });
  return response.data;
};

const importProductsFromCsv = async (formData) => {
  const response = await api.post('/admin/products/import-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
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
  updateMultipleUserStatuses,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteMultipleProducts,
  getLowStockProducts,
  sendBroadcast,
  getUserAddresses,
  deleteUserAddress,
  getRecentActivity,
  getDashboardStats,
  getAllOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  editOrder,
  searchUsers,
  searchProductsForAdmin,
  createOrderForUser,
  exportUsers,
  toggleFeatureProduct,
  importProductsFromCsv,
};

export default adminService;