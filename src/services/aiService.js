// src/services/aiService.js

/**
 * Service quản lý giao tiếp với AWS AI (Amazon Bedrock via Lambda)
 */

// QUAN TRỌNG: Hãy dán Invoke URL bạn copy từ API Gateway vào đây
// Ví dụ: https://xyz.execute-api.ap-southeast-1.amazonaws.com/dev/chat
const AWS_AI_ENDPOINT = import.meta.env.VITE_AWS_AI_ENDPOINT || 
  'https://4jxevt0ia6.execute-api.ap-southeast-1.amazonaws.com/dev/chat';

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
      mode: 'cors', // Đảm bảo API Gateway đã bật CORS
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // Chỉnh sửa để khớp với Lambda
      body: JSON.stringify({
        prompt: userMessage,   // Lambda đang đọc body.get('prompt')
        sessionId: sessionId   // Gửi session ID lên để Agent nhớ ngữ cảnh
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`AWS API Error: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    
    // AWS Lambda của bạn trả về key là "result"
    // (Xem dòng: 'body': json.dumps({'result': completion}) trong Lambda)
    const aiMessage = data.result || 'Xin lỗi, AI không phản hồi đúng định dạng.';
    
    return aiMessage;
  } catch (error) {
    console.error('❌ [AI Service] Error:', error);
    throw error; // Ném lỗi ra để Component xử lý (hiển thị thông báo)
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