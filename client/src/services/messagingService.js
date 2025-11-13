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

const sendMessage = async (recipientId, content, referencedMessage = null) => {
  const { data } = await api.post(API_URL, { recipientId, content, referencedMessage });
  return data;
};

const sendAttachment = async (recipientId, content, attachments, referencedMessage = null) => {
  const formData = new FormData();
  formData.append('recipientId', recipientId);
  if (content) {
    formData.append('content', content);
  }
  if (referencedMessage) {
    formData.append('referencedMessage', referencedMessage);
  }
  
  // Handle single attachment or array of attachments
  if (attachments) {
    if (Array.isArray(attachments)) {
      attachments.forEach((attachment, index) => {
        formData.append('attachments', attachment);
      });
    } else {
      formData.append('attachments', attachments);
    }
  }
  
  // Remove the Content-Type header to let the browser set it automatically for FormData
  const { data } = await api.post(`${API_URL}/upload`, formData);
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

const updateMessage = async (messageId, content) => {
  const { data } = await api.put(`${API_URL}/${messageId}`, { content });
  return data;
};

const deleteMessage = async (messageId) => {
  const { data } = await api.delete(`${API_URL}/${messageId}`);
  return data;
};

const searchMessages = async (conversationId, query) => {
  const { data } = await api.get(`${API_URL}/conversations/${conversationId}/search?q=${encodeURIComponent(query)}`);
  return data;
};

const messagingService = {
  getConversations,
  getMessages,
  sendMessage,
  sendAttachment,
  getUnreadCount,
  deleteConversation,
  updateMessage,
  deleteMessage,
  searchMessages
};

export default messagingService;