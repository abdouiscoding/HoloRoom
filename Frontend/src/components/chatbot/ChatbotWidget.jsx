import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';
import styles from './ChatbotWidget.module.css';
import { API, address, myFetch, logAction } from "../../api";

const token = localStorage.getItem("token");

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'bot',
    text: 'Hi! I am your HoloRoom Assistant. Ask me to find products, jump to your cart, or anything else.'
  }
];

const FILTER_ACTIONS = ['search', 'price', 'price_low', 'price_high', 'top_selling', 'most_wished', 'reviews', 'discounts', 'cancel'];
const COOLDOWN_SECONDS = 10;
const loggedin = localStorage.getItem("loggedin");

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [login, setlogin] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (loggedin == "true") setlogin(true);
  }, [messages]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const i = setInterval(() => setCooldown(p => p - 1), 1000);
    return () => clearInterval(i);
  }, [cooldown]);

  const sendToBackend = async (text, chatHistory) => {
    try {
      const history = chatHistory.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        text: m.text
      }));
      const res = await myFetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history })
      });
      const raw = await res.text();
      return raw || JSON.stringify({ action: "none", message: "Empty response" });
    } catch {
      return JSON.stringify({ action: "none", message: "Server error" });
    }
  };

  const handleNavigation = (type) => {
    if (!type) return;
    const target = type.toLowerCase();
    if (target.includes('support') || target.includes('help')) navigate('/support');
    else if (target.includes('cart')) navigate('/cart');
    else if (target.includes('wishlist') || target.includes('profile') || target.includes('orders') || target.includes('settings')) navigate('/profile');
    else if (target.includes('shop') || target.includes('store') || target.includes('product')) navigate('/shop');
    else if (target.includes('home')) navigate('/');
  };

  // Dispatch a filter event. If we're not on /shop, navigate first then dispatch after the page mounts.
  const dispatchFilter = (detail) => {
    const fire = () => window.dispatchEvent(new CustomEvent('ai-search', { detail }));
    if (location.pathname !== '/shop') {
      navigate('/shop');
      setTimeout(fire, 700); // give Shop time to mount + fetch products
    } else {
      fire();
    }
  };

  const handleAIResponse = (reply) => {
    try {
      let outer = JSON.parse(reply);
      let parsed = typeof outer.reply === "string" ? JSON.parse(outer.reply) : outer;
      const safeMessage = parsed?.message?.trim() ? parsed.message : "I couldn't generate a response.";

      setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: safeMessage }]);

      if (parsed.action === 'navigate') {
        handleNavigation(parsed.type);
        return;
      }

      if (parsed.action === 'help') {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'bot',
          text: "Try: 'show cheapest sofas', 'best reviewed', 'biggest discounts', 'open my cart', 'I need support'."
        }]);
        return;
      }

      if (FILTER_ACTIONS.includes(parsed.action)) {
        dispatchFilter({
          action: parsed.action,
          type: parsed.type,
          query: parsed.type,
          min: parsed.min,
          max: parsed.max
        });
      }
    } catch (err) {
      console.error("AI parse error:", err);
      setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: "Couldn't process that response." }]);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || cooldown > 0) return;
    const userText = inputText;
    const updated = [...messages, { id: Date.now(), sender: 'user', text: userText }];
    setMessages(updated);
    setInputText('');
    setCooldown(COOLDOWN_SECONDS);
    logAction("CHATBOT_MESSAGE", userText);
    const reply = await sendToBackend(userText, updated);
    handleAIResponse(reply);
  };

  // ...rest of the JSX unchanged
  return (
    <div className={styles.chatbotContainer}>
      {/* keep your existing JSX below */}
      {isOpen && (
        <div className={styles.chatWindowWrapper}>
          <div className={`${styles.chatWindow} glass-panel ${!login ? styles.blurred : ''}`}>
            <div className={styles.chatHeader}>
              <div className={styles.botInfo}>
                <div className={styles.avatar}><Sparkles size={16} /></div>
                <div>
                  <h4>AI Assistant</h4>
                  <span className={styles.status}>Online</span>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
            <div className={styles.messagesContainer}>
              {messages.map(msg => (
                <div key={msg.id} className={`${styles.messageWrapper} ${msg.sender === 'user' ? styles.msgRight : styles.msgLeft}`}>
                  {msg.sender === 'bot' && <Bot size={16} className={styles.msgIcon} />}
                  <div className={`${styles.message} ${msg.sender === 'user' ? styles.userMsg : styles.botMsg}`}>
                    {msg.text?.trim() ? msg.text : "…"}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form className={styles.inputArea} onSubmit={handleSend}>
              <input
                type="text"
                placeholder={cooldown > 0 ? `Wait ${cooldown}s...` : "Type your message..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className={styles.input}
                disabled={cooldown > 0 || !login}
              />
              <button type="submit" className={styles.sendBtn} disabled={!inputText.trim() || cooldown > 0 || !login}>
                {cooldown > 0 ? cooldown : <Send size={18} />}
              </button>
            </form>
          </div>
          {!login && (
            <div className={styles.loginOverlay}>
              <div className={styles.loginBox}>
                <div className={styles.head}>
                  <h3>Login required</h3>
                  <button className={styles.closeBtnl} onClick={() => setIsOpen(false)}><X size={20} /></button>
                </div>
                <p>You need to log in to use the AI assistant.</p>
                <button onClick={() => navigate('/login')} className={styles.loginBtn}>Login</button>
              </div>
            </div>
          )}
        </div>
      )}
      {!isOpen && (
        <button className={styles.floatingBtn} onClick={() => setIsOpen(true)}>
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget;