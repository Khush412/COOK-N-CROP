import api from '../config/axios';

const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

const markAsRead = async (notificationId) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
};

const markAllAsRead = async () => {
  const response = await api.put('/notifications/mark-all-read');
  return response.data;
};

const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};

export default notificationService;