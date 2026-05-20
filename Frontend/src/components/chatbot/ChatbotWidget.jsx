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

const FILTER_ACTIONS = ['search', 'price', 'price_low', 'price_high', 'top_selling', 'most_wished', 'reviews', 'discounts', 'color', 'size', 'cancel'];
const NAMED_COLORS = {
  black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000',
  blue: '#0000ff', yellow: '#ffff00', orange: '#ffa500', purple: '#800080',
  pink: '#ffc0cb', brown: '#8b4513', gray: '#808080', grey: '#808080',
  cyan: '#00ffff', magenta: '#ff00ff', beige: '#f5f5dc', gold: '#ffd700',
  silver: '#c0c0c0', navy: '#000080', maroon: '#800000', teal: '#008080',
  olive: '#808000', cream: '#fffdd0', tan: '#d2b48c', ivory: '#fffff0',
  charcoal: '#36454f', mint: '#98ff98', lavender: '#e6e6fa',
  turquoise: '#40e0d0', coral: '#ff7f50', salmon: '#fa8072',
  indigo: '#4b0082', violet: '#ee82ee', khaki: '#f0e68c'
};

const COLOR_BUCKETS = {
  Black: '#000000', White: '#ffffff', Gray: '#808080',
  Red: '#e63946', Orange: '#ffa500', Yellow: '#ffd60a',
  Green: '#2a9d3f', Blue: '#1e6fff', Purple: '#7c3aed',
  Pink: '#ff6fa3', Brown: '#8b4513', Beige: '#e9d8b8',
  Navy: '#0a2540', Gold: '#d4af37'
};

const hexToRgb = (hex) => {
  if (!hex) return null;
  let h = hex.toString().toLowerCase().replace('#', '').trim();
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length < 6) h = h.padEnd(6, '0');
  h = h.slice(0, 6);
  const n = parseInt(h, 16);
  if (isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const toHex = (input) => {
  if (!input) return null;
  const s = input.toString().toLowerCase().trim();
  if (s.startsWith('#') || /^[0-9a-f]{3,8}$/.test(s)) return s.startsWith('#') ? s : '#' + s;
  return NAMED_COLORS[s] || null;
};

const colorToBucket = (raw) => {
  if (!raw) return null;
  const hex = toHex(raw);
  if (!hex) return null;
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  let closest = null;
  let minDist = Infinity;
  for (const [name, bHex] of Object.entries(COLOR_BUCKETS)) {
    const brgb = hexToRgb(bHex);
    if (!brgb) continue;
    const d = (rgb.r - brgb.r) ** 2 + (rgb.g - brgb.g) ** 2 + (rgb.b - brgb.b) ** 2;
    if (d < minDist) { minDist = d; closest = name; }
  }
  return closest;
};

const sizeToBucket = (raw) => {
  if (!raw) return null;
  const s = raw.toString().toLowerCase().trim();
  if (['s', 'sm', 'xs'].includes(s)) return 'Small';
  if (['m', 'md', 'med'].includes(s)) return 'Medium';
  if (['l', 'lg', 'xl', 'xxl'].includes(s)) return 'Large';
  if (s.includes('small') || s.includes('tiny') || s.includes('mini')) return 'Small';
  if (s.includes('large') || s.includes('big') || s.includes('huge') || s.includes('xl')) return 'Large';
  if (s.includes('medium') || s.includes('med') || s.includes('mid') || s.includes('regular') || s.includes('standard')) return 'Medium';
  return 'Medium';
};
const COOLDOWN_SECONDS = 10;
const loggedin = localStorage.getItem("loggedin");

let _productMap = null;
const getProductMap = async () => {
  if (_productMap) return _productMap;
  try {
    const res = await myFetch(`${API}/api/products/get`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
    if (!res.ok) return {};
    const list = await res.json();
    _productMap = {};
    (list || []).forEach(p => { if (p?.pId != null) _productMap[p.pId] = p; });
    return _productMap;
  } catch { return {}; }
};

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [login, setlogin] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const lastSuggestedRef = useRef(null);

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

  // ---- AI helper: fetch products, filter, sort, return best match ----
  const findProduct = async (parsed) => {
    try {
      const res = await myFetch(`${API}/api/products/get`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (!res.ok) return null;
      let list = (await res.json()).filter(p => p && p.pId && p.pName && p.pFinalPrice != null);

      if (parsed.type && parsed.type !== 'none') {
        const t = parsed.type.toLowerCase();
        list = list.filter(p =>
          (p.categories || []).some(c => {
            const cLow = (c?.pCategory || '').toLowerCase();
            return cLow === t || cLow.includes(t) || t.includes(cLow);
          }) ||
          p.pName?.toLowerCase().includes(t)
        );
      }

      if (parsed.color) {
        const targetBucket = colorToBucket(parsed.color);
        if (targetBucket) {
          list = list.filter(p =>
            (p.sizecolorstock || []).some(v => colorToBucket(v?.pColor) === targetBucket)
          );
        } else {
          const c = parsed.color.toLowerCase();
          list = list.filter(p =>
            (p.sizecolorstock || []).some(v => v?.pColor?.toLowerCase().includes(c))
          );
        }
      }

      if (parsed.size) {
        const targetBucket = sizeToBucket(parsed.size);
        list = list.filter(p =>
          (p.sizecolorstock || []).some(v => sizeToBucket(v?.pSize) === targetBucket)
        );
      }

      if (parsed.min != null) list = list.filter(p => Number(p.pFinalPrice) >= parsed.min);
      if (parsed.max != null) list = list.filter(p => Number(p.pFinalPrice) <= parsed.max);

      if (!list.length) return null;

      switch (parsed.criteria) {
        case 'cheapest':     list.sort((a,b) => (+a.pFinalPrice||0) - (+b.pFinalPrice||0)); break;
        case 'expensive':    list.sort((a,b) => (+b.pFinalPrice||0) - (+a.pFinalPrice||0)); break;
        case 'best_rated':   list.sort((a,b) => (b.pRating||0) - (a.pRating||0)); break;
        case 'most_wished':  list.sort((a,b) => (b.pWishes||0) - (a.pWishes||0)); break;
        case 'best_selling': list.sort((a,b) => (b.pSold||0)   - (a.pSold||0));   break;
      }
      return list[0];
    } catch (e) {
      console.error('findProduct error:', e);
      return null;
    }
  };

  // ---- pick current product if on /product/X ----
  const fetchCurrentProduct = async () => {
    if (!location.pathname.startsWith('/product/')) return null;
    const id = localStorage.getItem('selectedProductId');
    if (!id) return null;
    try {
      const res = await myFetch(`${API}/api/products/get/${id}`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  };

  const botSay = (text) => setMessages(prev => [...prev, { id: Date.now() + Math.random(), sender: 'bot', text }]);

  // ---- ADD TO CART ----
  const handleAddCart = async (parsed) => {
    window.dispatchEvent(new CustomEvent('ai-search', { detail: { action: 'cancel' } }));
    const hasSpecifiers = parsed.type || parsed.color || parsed.criteria;
    const product = hasSpecifiers ? await findProduct(parsed) : await fetchCurrentProduct();
    if (!product) { botSay("I couldn't find a matching product."); return; }

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) { botSay('Please log in first to add items to your cart.'); return; }

    try {
      const cartRes = await myFetch(`${API}/api/cart/getbyuser/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!cartRes.ok) { botSay('Could not access your cart.'); return; }
      const cart = await cartRes.json();

      const variant = (product.sizecolorstock || [])
        .find(v => {
          if (parsed.color) {
            const tb = colorToBucket(parsed.color);
            if (tb && colorToBucket(v?.pColor) !== tb) return false;
          }
          if (parsed.size) {
            const tb = sizeToBucket(parsed.size);
            if (tb && sizeToBucket(v?.pSize) !== tb) return false;
          }
          return true;
        })
        || (product.sizecolorstock || [])[0]; 
      if (!variant) { botSay(`"${product.pName}" has no variants available.`); return; }

      const imageId = product.images?.[0]?.pImageId?.toString() || '0';
      const res = await myFetch(`${API}/api/cart/additem/${cart.pCartId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          pId: product.pId.toString(),
          pscsId: variant.pscsId.toString(),
          pImageId: imageId,
          quantity: '1'
        })
      });

      if (res.ok) {
        botSay(`Added "${product.pName}"${parsed.color ? ` (${parsed.color})` : ''} to your cart.`);
        logAction('ADD_TO_CART', `Added ${product.pName} via chatbot`);
      } else {
        const t = await res.text();
        botSay(`Couldn't add to cart: ${t || 'unknown error'}`);
      }
    } catch { botSay('Something went wrong adding to cart.'); }
  };

  // ---- ADD TO WISHLIST ----
  const handleAddWishlist = async (parsed) => {
    window.dispatchEvent(new CustomEvent('ai-search', { detail: { action: 'cancel' } }));
    const hasSpecifiers = parsed.type || parsed.color || parsed.criteria;
    const product = hasSpecifiers ? await findProduct(parsed) : await fetchCurrentProduct();
    if (!product) { botSay("I couldn't find a matching product."); return; }

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) { botSay('Please log in first to use the wishlist.'); return; }

    try {
      const res = await myFetch(`${API}/api/wishlist/add/${userId}/${product.pId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok || res.status === 201) {
        botSay(`Added "${product.pName}" to your wishlist.`);
        logAction('ADD_TO_WISHLIST', `Added ${product.pName} via chatbot`);
      } else if (res.status === 409) {
        botSay(`"${product.pName}" is already on your wishlist.`);
      } else {
        botSay(`Couldn't add to wishlist.`);
      }
    } catch { botSay('Something went wrong adding to wishlist.'); }
  };

  // ---- SHOW CART ----
const handleShowCart = async () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  if (!token || !userId) { botSay('Log in to see your cart.'); return; }

  try {
    const res = await myFetch(`${API}/api/cart/getbyuser/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) { botSay('Could not load your cart.'); return; }
    const cart = await res.json();

    console.log('[CART DEBUG] getbyuser response:', cart);

    // Try every plausible field name
    let items = cart.cartItems || cart.items || cart.pCartItems
             || cart.cart_items || cart.products || [];

    // If still empty but we have a cart ID, try separate item endpoints
    if (!items.length && cart.pCartId) {
      const tries = [
        `${API}/api/cartitem/getbycart/${cart.pCartId}`,
        `${API}/api/cart/items/${cart.pCartId}`,
        `${API}/api/cartitems/getbycart/${cart.pCartId}`,
        `${API}/api/cartitem/get/${cart.pCartId}`,
      ];
      for (const url of tries) {
        try {
          const r = await myFetch(url, { headers: { Authorization: `Bearer ${token}` } });
          if (!r.ok) continue;
          const data = await r.json();
          const got = Array.isArray(data) ? data : (data.items || data.cartItems || []);
          if (got.length) {
            items = got;
            console.log('[CART DEBUG] items found at:', url);
            break;
          }
        } catch {}
      }
    }

    if (!items.length) { botSay('Your cart is empty.'); return; }

    const map = await getProductMap();
    const lines = items.map(it => {
      const pid = it.pId || it.productId || it.pIdProduct;
      const p = map[pid];
      const name = it.pName || p?.pName || `Product #${pid}`;
      const qty = it.quantity || it.qty || 1;
      const price = Number(it.price) || Number(p?.pFinalPrice) || 0;
      return `• ${name} × ${qty}${price ? ` — ${price} DZD` : ''}`;
    }).join('\n');
    const total = items.reduce((s, it) => {
      const pid = it.pId || it.productId || it.pIdProduct;
      const price = Number(it.price) || Number(map[pid]?.pFinalPrice) || 0;
      const qty = it.quantity || it.qty || 1;
      return s + price * qty;
    }, 0);
    botSay(`You have ${items.length} item${items.length > 1 ? 's' : ''} in your cart:\n${lines}\nTotal: ${total.toLocaleString()} DZD`);
  } catch (e) {
    console.error(e);
    botSay('Something went wrong loading your cart.');
  }
};

  // ---- SHOW WISHLIST ----
 const handleShowWishlist = async () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  if (!token || !userId) { botSay('Log in to see your wishlist.'); return; }
  try {
    const res = await myFetch(`${API}/api/wishlist/get/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) { botSay('Could not load your wishlist.'); return; }
    const data = await res.json();
    const items = data.wishlistItems || [];
    if (!items.length) { botSay('Your wishlist is empty.'); return; }
    const map = await getProductMap();
    const lines = items.map(it => {
      const p = map[it.pId];
      const name = p?.pName || `Product #${it.pId}`;
      const price = Number(p?.pFinalPrice) || 0;
      return `• ${name}${price ? ` — ${price} DZD` : ''}`;
    }).join('\n');
    botSay(`Your wishlist (${items.length} item${items.length > 1 ? 's' : ''}):\n${lines}`);
  } catch { botSay('Something went wrong loading your wishlist.'); }
};

const handleSuggest = async (parsed) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // Collect signals from user's history
  const categoryFreq = {};
  const colorFreq = {};
  let priceSum = 0, priceCount = 0;
  const ownedIds = new Set();

  const addSignal = (p, weight = 1) => {
    if (!p) return;
    ownedIds.add(p.pId);
    (p.categories || []).forEach(c => {
      if (c?.pCategory) categoryFreq[c.pCategory.toLowerCase()] = (categoryFreq[c.pCategory.toLowerCase()] || 0) + weight;
    });
    (p.sizecolorstock || []).forEach(v => {
      if (v?.pColor) colorFreq[v.pColor.toLowerCase()] = (colorFreq[v.pColor.toLowerCase()] || 0) + weight;
    });
    if (p.pFinalPrice) { priceSum += Number(p.pFinalPrice) * weight; priceCount += weight; }
  };

  const map = await getProductMap();

  if (token && userId) {
    try {
      const r = await myFetch(`${API}/api/wishlist/get/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) (await r.json()).wishlistItems?.forEach(it => addSignal(map[it.pId], 2));
    } catch {}
    try {
      const r = await myFetch(`${API}/api/cart/getbyuser/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) {
        const c = await r.json();
        (c.cartItems || c.items || []).forEach(it => addSignal(map[it.pId || it.productId], 3));
      }
    } catch {}
    try {
      const r = await myFetch(`${API}/api/orders/getbyuser/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) {
        (await r.json()).forEach(o => (o.orderItems || o.items || []).forEach(it => addSignal(map[it.pId || it.productId], 4)));
      }
    } catch {}
  }

  const topCats = Object.entries(categoryFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
  const topColors = Object.entries(colorFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
  const avgPrice = priceCount > 0 ? priceSum / priceCount : null;

  // Candidates = all products
  let candidates = Object.values(map);

  // Filter by explicit user constraints from this turn
  if (parsed.type) {
    const t = parsed.type.toLowerCase();
    candidates = candidates.filter(p =>
      (p.categories || []).some(c => {
        const cLow = (c?.pCategory || '').toLowerCase();
        return cLow === t || cLow.includes(t) || t.includes(cLow);
      })
    );
  }
  if (parsed.color) {
    const c = parsed.color.toLowerCase();
    candidates = candidates.filter(p => (p.sizecolorstock || []).some(v => v?.pColor?.toLowerCase() === c));
  }
  if (parsed.size) {
    const s = parsed.size.toLowerCase();
    candidates = candidates.filter(p => (p.sizecolorstock || []).some(v => v?.pSize?.toLowerCase().includes(s)));
  }
  if (parsed.min != null) candidates = candidates.filter(p => Number(p.pFinalPrice) >= parsed.min);
  if (parsed.max != null) candidates = candidates.filter(p => Number(p.pFinalPrice) <= parsed.max);

  // Exclude things they already own
  candidates = candidates.filter(p => !ownedIds.has(p.pId));

  if (!candidates.length) {
    botSay("I couldn't find a good match with those preferences. Want to browse the shop instead?");
    return;
  }

  // Score
  const scored = candidates.map(p => {
    let score = 0;
    (p.categories || []).forEach(c => {
      const idx = topCats.indexOf(c?.pCategory?.toLowerCase());
      if (idx >= 0) score += (3 - idx) * 5;
    });
    (p.sizecolorstock || []).forEach(v => {
      const idx = topColors.indexOf(v?.pColor?.toLowerCase());
      if (idx >= 0) score += (3 - idx) * 3;
    });
    if (avgPrice && p.pFinalPrice) {
      const diff = Math.abs(Number(p.pFinalPrice) - avgPrice) / avgPrice;
      score += Math.max(0, 6 - diff * 6);
    }
    score += (p.pRating || 0) * 2;
    score += Math.log10((p.pSold || 0) + 1) * 3;
    score += Math.log10((p.pWishes || 0) + 1) * 2;
    return { p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored[0]?.p;
  if (!top) { botSay("I couldn't find a good match. Try browsing the shop!"); return; }

  // Build a why
  const reasons = [];
  const topCat = (top.categories || [])[0]?.pCategory;
  if (topCat && topCats.includes(topCat.toLowerCase())) reasons.push(`you've liked ${topCat.toLowerCase()} before`);
  if ((top.pRating || 0) >= 4) reasons.push("it's highly rated");
  if (top.pSold > 10) reasons.push(`${top.pSold} people bought one`);
  if (!reasons.length) reasons.push("it's one of our top picks");

  lastSuggestedRef.current = top;

  botSay(`I'd suggest "${top.pName}" at ${top.pFinalPrice} DZD — ${reasons.join(', ')}. Want me to take you to it?`);
};

const handleAIResponse = async (reply) => {
  try {
    let outer = JSON.parse(reply);
    let parsed = typeof outer.reply === "string" ? JSON.parse(outer.reply) : outer;

    const actions = Array.isArray(parsed.actions) ? parsed.actions
                  : parsed.action ? [parsed]
                  : [];

    const selfReporting = new Set(['show_cart', 'show_wishlist', 'add_cart', 'add_wishlist', 'suggest']);
    const allSelf = actions.length > 0 && actions.every(a => selfReporting.has(a.action));

    const preamble = parsed.message?.trim();
    if (preamble && !allSelf) {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: preamble }]);
    }

    if (!actions.length) {
      if (!preamble) botSay("I'm not sure what to do with that. Try asking for products, your cart, or support.");
      return;
    }

    const wait = (ms) => new Promise(r => setTimeout(r, ms));
    let navigationDone = false;

    const SHOP_FILTER_ACTIONS = new Set([
      'search', 'price', 'price_low', 'price_high',
      'top_selling', 'most_wished', 'reviews', 'discounts',
      'color', 'size', 'cancel'
    ]);
    const hasFilterAction = actions.some(a => SHOP_FILTER_ACTIONS.has(a.action));
    if (hasFilterAction) {
      dispatchFilter({ action: 'cancel' });
      await wait(120); // let Shop process the reset before new filters land
    }

    for (const a of actions) {
      if (a.action === 'navigate') {
        if (navigationDone) continue;
        handleNavigation(a.type);
        navigationDone = true;
        continue;
      }
      if (a.action === 'ask_support') {
        // The preamble already prompted them. Nothing to do here; the user's "yes" next turn produces a real navigate.
        continue;
      }
      if (a.action === 'help') {
        botSay("Try: 'show cheapest sofas', 'add the cheapest chair to cart', 'recommend me something', 'small red rugs', 'I need support'.");
        continue;
      }
      if (a.action === 'add_cart')      { await handleAddCart(a);     await wait(600); continue; }
      if (a.action === 'add_wishlist')  { await handleAddWishlist(a); await wait(600); continue; }
      if (a.action === 'show_cart')     { await handleShowCart();     continue; }
      if (a.action === 'show_wishlist') { await handleShowWishlist(); continue; }
      if (a.action === 'suggest')       { await handleSuggest(a);     continue; }

      if (FILTER_ACTIONS.includes(a.action)) {
        dispatchFilter({
          action: a.action,
          type: a.type,
          color: a.color,
          size: a.size,
          query: a.type,
          min: a.min,
          max: a.max
        });
      }
    }
  } catch (err) {
    console.error("AI parse error:", err);
    botSay("Couldn't process that response.");
  }
};

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || cooldown > 0) return;
    const userText = inputText;

    // If we just suggested a product and the user agrees, jump straight to its page.
    // No backend hit, no AI hallucination room.
    const affirmative = /^\s*(yes|yeah|yep|yup|sure|ok|okay|please|take me|go|go ahead|navigate|take|show it|show me|do it|sounds good)\b/i;
    if (lastSuggestedRef.current && affirmative.test(userText)) {
      const product = lastSuggestedRef.current;
      lastSuggestedRef.current = null;
      setMessages(prev => [...prev,
        { id: Date.now(),     sender: 'user', text: userText },
        { id: Date.now() + 1, sender: 'bot',  text: `Taking you to "${product.pName}".` }
      ]);
      setInputText('');
      setCooldown(COOLDOWN_SECONDS);
      logAction("CHATBOT_MESSAGE", userText);
      localStorage.setItem("selectedProductId", product.pId);
      navigate(`/product/${encodeURIComponent(product.pName)}`);
      return;
    }

    // User didn't follow up on the suggestion — clear the pointer so it doesn't get stale.
    if (lastSuggestedRef.current) lastSuggestedRef.current = null;

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
                  <h4>HoloRoom Assistant</h4>
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