import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';
import styles from './ChatbotWidget.module.css';
import { API, address, myFetch } from "../../api";

const token = localStorage.getItem("token");

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'bot',
    text: 'Hi! I am your HoloRoom Assistant. Are you looking for anything specific today?'
  }
];


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

  // =========================
  // SCROLL
  // =========================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (loggedin == "true"){
    setlogin(true);
  }
  }, [messages]);

  // =========================
  // COOLDOWN TIMER
  // =========================
  useEffect(() => {
    if (cooldown <= 0) return;

    const interval = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  // =========================
  // BACKEND CALL
  // ========================= 
  const sendToBackend = async (text, chatHistory) => {
    try {
      const history = chatHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        text: msg.text
      }));

      const res = await myFetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history
        })
      });

      const raw = await res.text();

      if (!raw) return JSON.stringify({
        action: "none",
        type: "none",
        message: "Empty response"
      });

      try {
        return raw;
      } catch {
        return JSON.stringify({
          action: "none",
          type: "none",
          message: "Invalid response"
        });
      }

    } catch (err) {
      return JSON.stringify({
        action: "none",
        type: "none",
        message: "Server error"
      });
    }
  };

 // =========================
  // ACTIONS
  // =========================
  const handleNavigation = (type) => {
    if (!type) return;
    
    const target = type.toLowerCase();
    
    // Map AI navigation types to your routes
    if (target.includes('wishlist') || target.includes('profile') || target.includes('orders')) {
      navigate('/profile');
    } else if (target.includes('cart')) {
      navigate('/cart');
    } else if (target.includes('shop') || target.includes('store')) {
      navigate('/shop');
    } else if (target.includes('home')) {
      navigate('/');
    }
    else if (target.includes('orders') || target.includes('order')) {
      navigate('/profile');
    }
    else if (target.includes('settings') || target.includes('setting')) {
      navigate('/profile');
    }
  };

  // =========================
  // RESPONSE HANDLER
  // =========================
  const handleAIResponse = (reply) => {
    console.log("RAW AI RESPONSE:", reply);

    try {
      // 1st parse (outer wrapper)
      let outer = JSON.parse(reply);

      // 2nd parse (inner AI JSON string)
      let parsed =
        typeof outer.reply === "string"
          ? JSON.parse(outer.reply)
          : outer;

      const safeMessage =
        parsed?.message?.trim()
          ? parsed.message
          : "I couldn't generate a response.";

      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'bot',
          text: safeMessage
        }
      ]);

      // Handle Page Changes
      if (parsed.action === 'navigate') {
        handleNavigation(parsed.type);
        return; 
      }

      if (['search', 'price', 'top_selling', 'most_wished', 'reviews', 'discounts'].includes(parsed.action)) {
        window.dispatchEvent(new CustomEvent('ai-search', {
          detail: {
            action: parsed.action,
            type: parsed.type,     
            query: parsed.type,     
            min: parsed.min,
            max: parsed.max
          }
        }));
      }

      if (parsed.action === 'cancel') {
        window.dispatchEvent(new CustomEvent('ai-search', {
          detail: {
            action: parsed.action
          }
        }));
      }

    } catch (err) {
      console.error("AI parse error:", err);

      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'bot',
          text: "Couldn't process AI response"
        }
      ]);
    }
  };

  // =========================
  // SEND MESSAGE (COOLDOWN SAFE)
  // =========================
  const handleSend = async (e) => {
    e?.preventDefault();

    if (!inputText.trim()) return;
    if (cooldown > 0) return;

    const userText = inputText;

    const updatedMessages = [
      ...messages,
      { id: Date.now(), sender: 'user', text: userText }
    ];

    setMessages(updatedMessages);
    setInputText('');

    // start cooldown
    setCooldown(COOLDOWN_SECONDS);

    const reply = await sendToBackend(userText, updatedMessages);
    handleAIResponse(reply);
  };

  // =========================
  // UI (NO CSS CHANGES)
  // =========================
  return (
    <div className={styles.chatbotContainer}>

      {isOpen && (
        <div className={styles.chatWindowWrapper}>
          
          <div
            className={`${styles.chatWindow} glass-panel ${
              !login ? styles.blurred : ''
            }`}
          >
            {/* HEADER */}
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

              <button
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* MESSAGES */}
            <div className={styles.messagesContainer}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`${styles.messageWrapper} ${
                    msg.sender === 'user'
                      ? styles.msgRight
                      : styles.msgLeft
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <Bot size={16} className={styles.msgIcon} />
                  )}

                  <div
                    className={`${styles.message} ${
                      msg.sender === 'user'
                        ? styles.userMsg
                        : styles.botMsg
                    }`}
                  >
                    {msg.text?.trim() ? msg.text : "…"}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <form className={styles.inputArea} onSubmit={handleSend}>
              <input
                type="text"
                placeholder={
                  cooldown > 0
                    ? `Wait ${cooldown}s...`
                    : "Type your message..."
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className={styles.input}
                disabled={cooldown > 0 || !login}
              />

              <button
                type="submit"
                className={styles.sendBtn}
                disabled={!inputText.trim() || cooldown > 0 || !login}
              >
                {cooldown > 0 ? cooldown : <Send size={18} />}
              </button>
            </form>
          </div>

          {/* 🔒 OVERLAY ONLY INSIDE OPEN CHAT */}
          {!login && (
            <div className={styles.loginOverlay}>
              <div className={styles.loginBox}>
                <div className={styles.head}>
                <h3>Login required</h3>
                <button
                  className={styles.closeBtnl}
                  onClick={() => setIsOpen(false)}
                >
                  <X size={20} />
                </button>
                </div>
                <p>You need to log in to use the AI assistant.</p>

                <button
                  onClick={() => navigate('/login')}
                  className={styles.loginBtn}
                >
                  Login
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {!isOpen && (
        <button
          className={styles.floatingBtn}
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare size={24} />
        </button>
      )}

    </div>
  );
};

export default ChatbotWidget;