// src/services/aiService.js

/**
 * Service quản lý giao tiếp với AWS AI (Amazon Bedrock via Lambda)
 */

const AWS_AI_ENDPOINT = import.meta.env.VITE_AWS_AI_ENDPOINT || 
  'https://zwzx1oerz7.execute-api.us-east-1.amazonaws.com/default/Chat';

/**
 * Gửi tin nhắn đến AWS AI Assistant
 * @param {string} userMessage - Nội dung tin nhắn từ user
 * @param {string} sessionId - ID phiên chat để duy trì ngữ cảnh
 * @returns {Promise<string>} - Phản hồi từ AI
 */
export const chatWithAI = async (userMessage, sessionId) => {
  try {
    const response = await fetch(AWS_AI_ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        inputText: userMessage,
        sessionId: sessionId
      })
    });

    if (!response.ok) {
      throw new Error(`AWS API responded with status ${response.status}`);
    }

    const data = await response.json();
    
    // AWS Bedrock trả về response trong key "response"
    const aiMessage = data.response || data.message || 'Xin lỗi, tôi không thể trả lời câu hỏi này.';
    
    return aiMessage;
  } catch (error) {
    console.error('❌ [AI Service] Error:', error);
    throw new Error('Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau.');
  }
};

/**
 * Tạo hoặc lấy sessionId cho chat
 * @returns {string} - Session ID
 */
export const getChatSessionId = () => {
  let sessionId = localStorage.getItem('chatSessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('chatSessionId', sessionId);
  }
  return sessionId;
};

/**
 * Xóa session hiện tại (Reset chat)
 */
export const clearChatSession = () => {
  localStorage.removeItem('chatSessionId');
};
