import api from '../config/axios';

const sendMessage = async (formData) => {
  try {
    const response = await api.post('/support', formData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getMyTickets = async () => {
  try {
    const response = await api.get('/support/my-tickets');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getTicketById = async (id) => {
  try {
    const response = await api.get(`/support/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const addUserReply = async (ticketId, replyContent) => {
  try {
    const response = await api.post(`/support/${ticketId}/user-reply`, { replyContent });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const supportService = {
  sendMessage,
  getMyTickets,
  getTicketById,
  addUserReply,
};

export default supportService;
