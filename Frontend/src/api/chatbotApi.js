import apiClient from './apiClient';

const chatbotApi = {
  async sendMessage(message) {
    const res = await apiClient.post('/v1/chatbot/chat', { message });
    return res.data;
  },
};

export default chatbotApi;
