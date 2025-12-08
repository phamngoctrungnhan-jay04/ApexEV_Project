import { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend, FiLoader } from 'react-icons/fi';
import { chatWithAI, getChatSessionId } from '../../services/aiService';
import './AIChatbot.css';

function AIChatbot() {
  console.log('🤖 [AIChatbot] Component loaded successfully!');
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Xin chào! Tôi là trợ lý AI của APEX EV. Tôi có thể giúp gì cho bạn?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessageToAI = async (userMessage) => {
    try {
      // Gọi trực tiếp AWS API Gateway
      const sessionId = getChatSessionId();
      const aiResponse = await chatWithAI(userMessage, sessionId);
      return aiResponse;
    } catch (error) {
      console.error('❌ [AIChatbot] Error:', error);
      return error.message || 'Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau.';
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    const newUserMessage = {
      id: Date.now(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Gọi AI API
    const aiResponse = await sendMessageToAI(userMessage);

    const botMessage = {
      id: Date.now() + 1,
      text: aiResponse,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="ai-chatbot-container">
      {/* Chat Button */}
      {!isOpen && (
        <button 
          className="chatbot-toggle-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Mở chat AI"
        >
          <FiMessageCircle size={24} />
          <span className="chat-badge">AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <FiMessageCircle size={20} />
              </div>
              <div className="chatbot-header-text">
                <h3>APEX AI Assistant</h3>
                <span className="chatbot-status">
                  <span className="status-dot"></span>
                  Đang hoạt động
                </span>
              </div>
            </div>
            <button 
              className="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng chat"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`chat-message ${message.sender}`}
              >
                {message.sender === 'bot' && (
                  <div className="message-avatar">
                    <FiMessageCircle size={16} />
                  </div>
                )}
                <div className="message-content">
                  <div className="message-bubble">
                    {message.text}
                  </div>
                  <span className="message-time">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chat-message bot">
                <div className="message-avatar">
                  <FiMessageCircle size={16} />
                </div>
                <div className="message-content">
                  <div className="message-bubble typing">
                    <FiLoader className="typing-loader" />
                    <span>Đang trả lời...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-container">
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="Nhập câu hỏi của bạn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button 
              className="chatbot-send-btn"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              aria-label="Gửi tin nhắn"
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIChatbot;
