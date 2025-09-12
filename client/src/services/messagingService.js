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

const messagingService = {
  getConversations,
  getMessages,
  sendMessage,
};

export default messagingService;