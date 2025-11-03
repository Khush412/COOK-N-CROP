import api from '../config/axios';

const API_URL = '/messages';

const getConversations = async () => {
  const { data } = await api.get(`${API_URL}/conversations`);
  return data;
};

const getMessages = async (conversationId) => {
  const { data } = await api.get(`${API_URL}/conversations/${conversationId}`);
  return data;
};

const sendMessage = async (recipientId, content) => {
  const { data } = await api.post(API_URL, { recipientId, content });
  return data;
};

const getUnreadCount = async () => {
  const { data } = await api.get(`${API_URL}/unread-count`);
  return data;
};

const deleteConversation = async (conversationId) => {
  const { data } = await api.delete(`${API_URL}/conversations/${conversationId}`);
  return data;
};

const messagingService = {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
  deleteConversation,
};

export default messagingService;