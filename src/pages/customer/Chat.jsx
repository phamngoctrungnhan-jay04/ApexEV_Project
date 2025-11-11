import { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import { 
  FiMessageSquare, FiSend, FiPaperclip, FiImage, FiSmile, 
  FiPhone, FiVideo, FiMoreVertical, FiSearch, FiUser
} from 'react-icons/fi';
import './Chat.css';

const Chat = () => {
  // States
  const [selectedContact, setSelectedContact] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Mock contacts (advisors and support)
  const contacts = [
    {
      id: 1,
      name: 'Nguyễn Văn An',
      role: 'Cố vấn dịch vụ',
      avatar: null,
      status: 'online',
      lastMessage: 'Xe của anh đã hoàn thành kiểm tra',
      lastTime: '10 phút trước',
      unread: 2
    },
    {
      id: 2,
      name: 'Trần Thị Bình',
      role: 'Cố vấn dịch vụ',
      avatar: null,
      status: 'online',
      lastMessage: 'Báo giá phụ tùng đã được gửi',
      lastTime: '1 giờ trước',
      unread: 0
    },
    {
      id: 3,
      name: 'Hỗ trợ kỹ thuật',
      role: 'Đội ngũ hỗ trợ',
      avatar: null,
      status: 'online',
      lastMessage: 'Chúng tôi có thể giúp gì cho bạn?',
      lastTime: '2 giờ trước',
      unread: 0
    },
    {
      id: 4,
      name: 'Lê Minh Châu',
      role: 'Cố vấn dịch vụ',
      avatar: null,
      status: 'offline',
      lastMessage: 'Cảm ơn anh đã tin tưởng dịch vụ',
      lastTime: 'Hôm qua',
      unread: 0
    }
  ];

  // Mock messages for selected contact
  const mockMessages = {
    1: [
      { id: 1, sender: 'advisor', text: 'Xin chào anh! Em là Văn An, cố vấn dịch vụ của anh.', time: '14:30', type: 'text' },
      { id: 2, sender: 'customer', text: 'Chào bạn! Xe của tôi đang bảo dưỡng đến đâu rồi?', time: '14:32', type: 'text' },
      { id: 3, sender: 'advisor', text: 'Dạ, xe của anh đã hoàn thành kiểm tra ban đầu. Hiện tại đang chờ phụ tùng thay thế.', time: '14:35', type: 'text' },
      { id: 4, sender: 'customer', text: 'Dự kiến bao lâu nữa hoàn thành?', time: '14:36', type: 'text' },
      { id: 5, sender: 'advisor', text: 'Phụ tùng sẽ về trong chiều nay. Dự kiến 17h là xe của anh hoàn thành ạ.', time: '14:38', type: 'text' },
      { id: 6, sender: 'advisor', text: 'Em sẽ gửi hình ảnh kiểm tra cho anh xem nhé!', time: '14:38', type: 'text' },
      { id: 7, sender: 'advisor', text: '[Hình ảnh kiểm tra xe]', time: '14:39', type: 'image', imageUrl: 'https://via.placeholder.com/300x200' }
    ],
    2: [
      { id: 1, sender: 'advisor', text: 'Chào anh! Em là Thị Bình.', time: '10:00', type: 'text' },
      { id: 2, sender: 'advisor', text: 'Báo giá phụ tùng đã được gửi qua email của anh.', time: '10:01', type: 'text' },
      { id: 3, sender: 'customer', text: 'Tôi đã nhận được. Cảm ơn bạn!', time: '10:15', type: 'text' }
    ],
    3: [
      { id: 1, sender: 'advisor', text: 'Xin chào! Chúng tôi có thể giúp gì cho bạn?', time: '08:00', type: 'text' }
    ],
    4: [
      { id: 1, sender: 'advisor', text: 'Xe của anh đã hoàn thành ạ!', time: 'Hôm qua', type: 'text' },
      { id: 2, sender: 'customer', text: 'Cảm ơn bạn rất nhiều!', time: 'Hôm qua', type: 'text' }
    ]
  };

  const [messages, setMessages] = useState([]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages when contact is selected
  useEffect(() => {
    if (selectedContact) {
      setMessages(mockMessages[selectedContact.id] || []);
    }
  }, [selectedContact]);

  // Select first contact by default
  useEffect(() => {
    if (contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0]);
    }
  }, []);

  // Handlers
  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'customer',
      text: message,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simulate advisor response after 2 seconds
    setTimeout(() => {
      const responseMessage = {
        id: messages.length + 2,
        sender: 'advisor',
        text: 'Em đã nhận được tin nhắn. Sẽ phản hồi anh ngay!',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="chat-page">
      <Container fluid>
        <div className="page-header">
          <h1 className="page-title">
            <FiMessageSquare className="me-2" />
            Tin nhắn & Hỗ trợ
          </h1>
          <p className="page-subtitle">Liên hệ với cố vấn dịch vụ và đội ngũ hỗ trợ</p>
        </div>

        <Row>
          <Col lg={12}>
            <Card className="chat-container">
              <Card.Body className="p-0">
                <Row className="g-0">
                  {/* Contacts List */}
                  <Col md={4} lg={3} className="contacts-sidebar">
                    <div className="contacts-header">
                      <h5>Cuộc trò chuyện</h5>
                    </div>

                    <div className="contacts-search">
                      <FiSearch className="search-icon" />
                      <Form.Control
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="contacts-list">
                      {filteredContacts.map(contact => (
                        <div
                          key={contact.id}
                          className={`contact-item ${selectedContact?.id === contact.id ? 'active' : ''}`}
                          onClick={() => setSelectedContact(contact)}
                        >
                          <div className="contact-avatar">
                            <FiUser size={24} />
                            <span className={`status-indicator ${contact.status}`}></span>
                          </div>
                          <div className="contact-info">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="contact-name">{contact.name}</h6>
                                <p className="contact-role">{contact.role}</p>
                              </div>
                              <span className="contact-time">{contact.lastTime}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <p className="last-message">{contact.lastMessage}</p>
                              {contact.unread > 0 && (
                                <Badge bg="primary" pill>{contact.unread}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Col>

                  {/* Chat Area */}
                  <Col md={8} lg={9} className="chat-area">
                    {selectedContact ? (
                      <>
                        {/* Chat Header */}
                        <div className="chat-header">
                          <div className="d-flex align-items-center">
                            <div className="contact-avatar me-3">
                              <FiUser size={24} />
                              <span className={`status-indicator ${selectedContact.status}`}></span>
                            </div>
                            <div>
                              <h5 className="mb-0">{selectedContact.name}</h5>
                              <p className="mb-0 text-muted small">{selectedContact.role}</p>
                            </div>
                          </div>
                          <div className="chat-actions">
                            <Button variant="link" className="action-btn">
                              <FiPhone size={20} />
                            </Button>
                            <Button variant="link" className="action-btn">
                              <FiVideo size={20} />
                            </Button>
                            <Button variant="link" className="action-btn">
                              <FiMoreVertical size={20} />
                            </Button>
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="messages-container">
                          <div className="messages-list">
                            {messages.map(msg => (
                              <div
                                key={msg.id}
                                className={`message ${msg.sender === 'customer' ? 'message-customer' : 'message-advisor'}`}
                              >
                                <div className="message-content">
                                  {msg.type === 'text' && (
                                    <p className="message-text">{msg.text}</p>
                                  )}
                                  {msg.type === 'image' && (
                                    <div className="message-image">
                                      <img src={msg.imageUrl} alt="Attachment" />
                                    </div>
                                  )}
                                  <span className="message-time">{msg.time}</span>
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </div>
                        </div>

                        {/* Message Input */}
                        <div className="message-input-container">
                          <div className="message-input-wrapper">
                            <Button variant="link" className="attachment-btn">
                              <FiPaperclip size={20} />
                            </Button>
                            <Button variant="link" className="attachment-btn">
                              <FiImage size={20} />
                            </Button>
                            <Form.Control
                              as="textarea"
                              rows={1}
                              placeholder="Nhập tin nhắn..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              onKeyPress={handleKeyPress}
                              className="message-input"
                            />
                            <Button variant="link" className="attachment-btn">
                              <FiSmile size={20} />
                            </Button>
                            <Button 
                              variant="primary" 
                              className="send-btn"
                              onClick={handleSendMessage}
                              disabled={!message.trim()}
                            >
                              <FiSend size={18} />
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="no-chat-selected">
                        <FiMessageSquare size={64} className="mb-3 text-muted" />
                        <h5>Chọn một cuộc trò chuyện</h5>
                        <p className="text-muted">Chọn một liên hệ để bắt đầu trò chuyện</p>
                      </div>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Chat;
