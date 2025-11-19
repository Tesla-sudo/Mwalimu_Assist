// src/components/Messages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Users } from 'lucide-react';
import Navbar from './Navbar';
import io from 'socket.io-client';

// Connect to your backend (use proxy in production)
const socket = io(); // With "proxy": "http://localhost:5000" in package.json

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [author, setAuthor] = useState('Mwalimu');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Welcome message
    setMessages([
      {
        id: 1,
        text: "Karibu Mwalimu Assist Private Messages!",
        author: "System",
        timestamp: new Date().toISOString(),
        isSystem: true
      }
    ]);

    // Listen for new messages
    socket.on('newMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    // Listen for online count
    socket.on('onlineCount', (count) => {
      setOnlineCount(count);
    });

    // Load initial messages & online count
    socket.emit('joinMessages');
    socket.on('loadMessages', (loaded) => {
      setMessages(prev => [...prev.filter(m => m.isSystem), ...loaded]);
    });

    return () => {
      socket.off('newMessage');
      socket.off('onlineCount');
      socket.off('loadMessages');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const msgData = {
      text: newMessage,
      author: author || 'Mwalimu',
      timestamp: new Date().toISOString()
    };

    socket.emit('sendMessage', msgData);
    setNewMessage('');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-emerald-50 to-amber-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 mb-4">
              Private Messages
            </h1>
            <div className="flex items-center justify-center gap-3 text-2xl text-green-600 font-bold">
              <Users className="w-8 h-8" />
              <span>{onlineCount} teachers online</span>
            </div>
            <p className="text-xl text-gray-700 mt-4">Chat privately • Share ideas • Get support</p>
          </div>

          {/* Chat Container */}
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border-4 border-white overflow-hidden">
            
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <MessageCircle className="w-10 h-10" />
                  <div>
                    <h2 className="text-3xl font-bold">Mwalimu Assist Chat</h2>
                    <p className="opacity-90">Real-time • Secure • For Teachers Only</p>
                  </div>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-full">
                  <span className="font-bold">{onlineCount} Online</span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.length === 1 && messages[0].isSystem ? (
                <div className="text-center py-20 text-gray-500">
                  <MessageCircle className="w-20 h-20 mx-auto mb-4 opacity-30" />
                  <p className="text-2xl">No messages yet. Start the conversation!</p>
                  <p className="mt-4">Be the first to say hello</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.isSystem ? 'justify-center' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md px-6 py-4 rounded-3xl shadow-lg ${
                        msg.isSystem
                          ? 'bg-gradient-to-r from-blue-100 to-green-100 text-gray-700'
                          : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-gray-800'
                      }`}
                    >
                      {!msg.isSystem && (
                        <p className="font-bold text-indigo-700 text-sm mb-1">{msg.author}</p>
                      )}
                      <p className="text-lg leading-relaxed">{msg.text}</p>
                      <p className="text-xs text-gray-500 mt-2 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString('en-KE', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-gradient-to-r from-gray-100 to-gray-200 border-t-4 border-indigo-600">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Your name (e.g. Mwalimu Jane)"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  className="px-6 py-4 rounded-xl border-2 border-indigo-300 focus:border-indigo-600 outline-none font-medium text-lg"
                />
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && sendMessage()}
                  className="flex-1 px-6 py-4 rounded-xl border-2 border-indigo-300 focus:border-indigo-600 outline-none text-lg"
                />
                <button
                  onClick={sendMessage}
                  className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xl rounded-xl shadow-xl transition-all hover:scale-105 flex items-center gap-3 justify-center"
                >
                  <Send className="w-6 h-6" />
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-2xl font-medium text-gray-700">
              Made with <span className="text-red-600">Red</span> <span className="text-black">Black</span> <span className="text-green-600">Green</span> for Kenyan Teachers
            </p>
            <p className="text-lg text-gray-600 mt-4">Pamoja tunaweza</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Messages;