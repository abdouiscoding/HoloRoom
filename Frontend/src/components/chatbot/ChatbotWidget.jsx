import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import styles from './ChatbotWidget.module.css';

const INITIAL_MESSages = [
  { id: 1, sender: 'bot', text: 'Hi! I am your HoloRoom Assistant. Are you looking for anything specific today?' }
];

const PRE_AR_SUGGESTIONS = ['Help me find a sofa', 'What fits in a small room?', 'Show latest trends'];
const DURING_AR_SUGGESTIONS = ['Change color to Blue', 'Is this the real size?', 'Similar items'];

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSages);
  const [inputText, setInputText] = useState('');
  const location = useLocation();
  const messagesEndRef = useRef(null);

  // Determine context based on route
  const isARMode = location.pathname.includes('/ar/');
  const currentSuggestions = isARMode ? DURING_AR_SUGGESTIONS : PRE_AR_SUGGESTIONS;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Contextual greeting when entering AR
  useEffect(() => {
    if (isARMode && !messages.find(m => m.text.includes('AR mode enabled'))) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: 'AR mode enabled! You can ask me to change the color, scale the object, or find similar items.'
      }]);
      setIsOpen(true);
    }
  }, [isARMode]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Build Gemini-format conversation history
    const history = [...messages, userMsg]
      .filter(m => m.text)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

    try {
      const res = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history })
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: data.reply
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again.'
      }]);
    }
  };

  const handleSuggestionClick = async (text) => {
    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);

    // Build Gemini-format conversation history
    const history = [...messages, userMsg]
      .filter(m => m.text)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

    try {
      const res = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history })
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: data.reply
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again.'
      }]);
    }
  };

  return (
    <div className={styles.chatbotContainer}>
      {/* Chat Window */}
      {isOpen && (
        <div className={`${styles.chatWindow} glass-panel`}>
          <div className={styles.chatHeader}>
            <div className={styles.botInfo}>
              <div className={styles.avatar}>
                <Sparkles size={16} />
              </div>
              <div>
                <h4>AI Assistant</h4>
                <span className={styles.status}>Online</span>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.messagesContainer}>
            {messages.map(msg => (
              <div key={msg.id} className={`${styles.messageWrapper} ${msg.sender === 'user' ? styles.msgRight : styles.msgLeft}`}>
                {msg.sender === 'bot' && <Bot size={16} className={styles.msgIcon} />}
                <div className={`${styles.message} ${msg.sender === 'user' ? styles.userMsg : styles.botMsg}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.suggestions}>
            {currentSuggestions.map((sug, idx) => (
              <button
                key={idx}
                className={styles.sugBtn}
                onClick={() => handleSuggestionClick(sug)}
              >
                {sug}
              </button>
            ))}
          </div>

          <form className={styles.inputArea} onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className={styles.input}
            />
            <button type="submit" className={styles.sendBtn} disabled={!inputText.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          className={styles.floatingBtn}
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare size={24} />
          {isARMode && <span className={styles.badge}>1</span>}
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget;