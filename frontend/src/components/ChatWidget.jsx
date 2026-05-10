import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { API_URL } from '../config';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Connect to socket
    const newSocket = io(API_URL);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Join chat with user info
    socket.emit('user-join', {
      userId: user.id || 'guest',
      name: user.fullName || 'Guest',
      role: user.role || 'customer'
    });

    // Receive chat history
    socket.on('chat-history', (history) => {
      setMessages(history);
    });

    // Receive new message
    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
      if (!isOpen && message.senderId !== socket.id) {
        setUnreadCount(prev => prev + 1);
      }
    });

    // Receive typing status
    socket.on('user-typing', (data) => {
      if (data.isTyping) {
        setTypingUser(data.name);
      } else {
        setTypingUser(null);
      }
    });

    // Receive online users list
    socket.on('users-list', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('chat-history');
      socket.off('new-message');
      socket.off('user-typing');
      socket.off('users-list');
    };
  }, [socket, isOpen]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    if (!socket) return;

    socket.emit('send-message', {
      senderName: user.fullName || 'Guest',
      senderRole: user.role || 'customer',
      message: inputMessage
    });

    setInputMessage('');
  };

  const handleTyping = (e) => {
    setInputMessage(e.target.value);
    
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      socket?.emit('typing', { name: user.fullName, isTyping: true });
    } else if (isTyping && e.target.value.length === 0) {
      setIsTyping(false);
      socket?.emit('typing', { name: user.fullName, isTyping: false });
    }
  };

  const openChat = () => {
    setIsOpen(true);
    setUnreadCount(0);
    socket?.emit('mark-read');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={openChat}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#e67e22',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}
        >
          💬
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              backgroundColor: '#e74c3c',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '350px',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#e67e22',
            color: 'white',
            padding: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <strong>Live Chat Support</strong>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>
                {onlineUsers.length} online • {onlineUsers.filter(u => u.role === 'admin').length} admin(s)
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>

          {/* Online Users Indicator */}
          <div style={{
            padding: '8px 15px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #eee',
            fontSize: '12px',
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            {onlineUsers.map(u => (
              <span key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#2ecc71',
                  display: 'inline-block'
                }}></span>
                {u.name} ({u.role === 'admin' ? 'Admin' : 'Customer'})
              </span>
            ))}
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {messages.length === 0 && (
              <div style={{
                textAlign: 'center',
                color: '#999',
                padding: '20px'
              }}>
                No messages yet. Start a conversation!
              </div>
            )}
            
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.senderId === socket?.id ? 'flex-end' : 'flex-start',
                  marginBottom: '8px'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '10px',
                  borderRadius: '12px',
                  backgroundColor: msg.senderId === socket?.id ? '#e67e22' : '#f0f0f0',
                  color: msg.senderId === socket?.id ? 'white' : '#333'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {msg.senderName}
                    {msg.senderRole === 'admin' && <span style={{ marginLeft: '5px', fontSize: '10px' }}>👑 Admin</span>}
                  </div>
                  <div style={{ fontSize: '14px', wordWrap: 'break-word' }}>{msg.message}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {typingUser && (
              <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                {typingUser} is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '15px',
            borderTop: '1px solid #eee',
            display: 'flex',
            gap: '10px'
          }}>
            <input
              type="text"
              value={inputMessage}
              onChange={handleTyping}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '20px',
                outline: 'none'
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: '10px 15px',
                backgroundColor: '#e67e22',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer'
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;