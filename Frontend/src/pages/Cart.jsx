import React, { useEffect, useState } from "react";
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Lock,
  Minus,
  Plus,
  Trash2,
  View
} from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./Cart.module.css";
import { useCart } from "../context/CartContext";
import { API, address, myFetch, logAction } from "../api";
import confetti from 'canvas-confetti';
import { Gift, Sparkles as SparklesIcon } from 'lucide-react';

const UPLOADS_BASE = `${API}/api/uploads/images/`;

const getImageUrl = (img) => {
  if (!img) return "";

  // already a full URL
  if (img.startsWith("http://") || img.startsWith("https://")) {
    return img;
  }

  // local upload file → encode it safely
  const imageurl =UPLOADS_BASE + encodeURIComponent(img);
  console.log(imageurl);
  return imageurl;
};

const Cart = () => {
  const { cart, fetchCart, removeItem, loading } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const [popup, setPopup] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupMode, setPopupMode] = useState('ok');

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeColorPopup, setActiveColorPopup] = useState(null);
  const [stockPopup, setStockPopup] = useState(false);
  const [clearPopup, setClearPopup] = useState(false);
  const [orderaddedPopup, setOrderaddedPopup] = useState(false);

  const [colorsMap, setColorsMap] = useState({});

  const [coupons, setCoupons] = useState([]);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [showCouponPopup, setShowCouponPopup] = useState(false);
  const [couponsChecked, setCouponsChecked] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const cartId = localStorage.getItem("cartId");

  const fireConfetti = () => {
  const duration = 2000;
  const end = Date.now() + duration;
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } });
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
};

const calculateCoupons = async () => {
  if (couponsChecked) return; // only run once per checkout open
  setCouponsChecked(true);
  const earned = [];

  // 1. First-time buyer
  try {
    const res = await myFetch(`${API}/api/orders/userhas/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const hasOrders = await res.json();
    if (!hasOrders) {
      earned.push({
        code: 'FIRST_ORDER',
        icon: '🎉',
        label: 'First Order Welcome',
        description: 'Welcome to HoloRoom! Your first purchase comes with a special discount.',
        percentage: 15,
      });
    }
  } catch (e) { console.error('coupon check failed', e); }

  // 2. Account anniversary (birthday)
  const creationdate = localStorage.getItem('creationdate');
  if (creationdate) {
    try {
      const created = new Date(creationdate);
      const today = new Date();
      const ageDays = (today - created) / (1000 * 60 * 60 * 24);
      if (ageDays >= 30) {
        const thisYearAnniv = new Date(today.getFullYear(), created.getMonth(), created.getDate());
        const diff = Math.abs((today - thisYearAnniv) / (1000 * 60 * 60 * 24));
        if (diff <= 7) {
          earned.push({
            code: 'ANNIVERSARY',
            icon: '🎂',
            label: 'Account Anniversary',
            description: 'Happy account birthday! Thanks for sticking with us.',
            percentage: 10,
          });
        }
      }
    } catch {}
  }

  // 3. Bulk order (5+ units)
  const itemCount = items.reduce((s, i) => s + (i.quantity || 0), 0);
  if (itemCount >= 5) {
    earned.push({
      code: 'BULK_BUY',
      icon: '📦',
      label: 'Bulk Order Bonus',
      description: '5 or more items in one order — thanks for stocking up.',
      percentage: 5,
    });
  }

  // 4. Big spender (50,000+ DZD)
  if (subtotal >= 50000) {
      earned.push({
        code: 'BIG_SPENDER',
        icon: '💎',
        label: 'VIP Order',
        description: 'High-value order — enjoy an extra discount.',
        percentage: 5,
      });
    }

    // cap combined discount at 35%
    const totalDisc = Math.min(earned.reduce((s, c) => s + c.percentage, 0), 35);

    setCoupons(earned);
    setCouponDiscount(totalDisc);

    if (earned.length > 0) {
      setShowCouponPopup(true);
      setTimeout(fireConfetti, 200);
      logAction("COUPONS_APPLIED", `Earned coupons: ${earned.map(c => c.code).join(', ')} = ${totalDisc}% off`);
    }
  };

  const formatCardNumber = (v) =>
  v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const Order = async () => {
  // COD goes straight to your existing checkout flow
  if (paymentMethod === "cod") {
    try {
      const res = await myFetch(`${API}/api/orders/checkout/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cartId: Number(cartId),
          paymentMethod: "cod",
          couponDiscount: couponDiscount,
        }),
      });
      if (!res.ok) { alert("Transaction failed"); return; }
      logAction("PLACE_ORDER", `COD order, ${items.length} items, ${discountedTotal} DZD`);
      setOrderaddedPopup(true);
      setCheckoutOpen(false);
      fetchCart();
    } catch (err) {
      console.error(err);
      alert("Transaction failed");
    }
    return;
  }

  // CARD → Chargily
  try {
    const res = await myFetch(`${API}/api/payment/chargily/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: Number(userId),
        cartId: Number(cartId),
        amount: discountedTotal,
        couponDiscount: couponDiscount,
        paymentMethod: "edahabia",  // or "cib" — could be a UI choice
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      alert("Couldn't start payment: " + text);
      return;
    }
    const data = await res.json();
    if (!data.checkout_url) {
      alert("Payment provider didn't return a URL.");
      return;
    }
    logAction("PAYMENT_INITIATED", `Chargily Edahabia, ${discountedTotal} DZD`);
    window.location.href = data.checkout_url;
  } catch (err) {
    console.error(err);
    alert("Payment failed to start");
  }
};

  // ---------------- AR NAVIGATION ----------------
  const openAR = (pId) => {
  const isLoggedIn = localStorage.getItem("loggedin");

  if (!isLoggedIn || isLoggedIn === "false") {
    window.location.href = "/login";
    return;
  }

  const productId = pId;
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const loggedin = localStorage.getItem("loggedin");

  if (!productId || !token || !userId || !loggedin) {
    setPopupTitle("Please Log In");
    setPopupMessage("Required information is missing. Please log in to access AR.");
    setPopupMode("login"); 
    setShowPopup(true);
    return;
  }

  const arUrl =
    `https://holoroom-ar.vercel.app/` +
    `?token=${encodeURIComponent(token)}` +
    `&userId=${encodeURIComponent(userId)}` +
    `&productId=${encodeURIComponent(productId)}`;

    const log = async () => {
        if (userId && token) {
          try {
            await myFetch(`${API}/api/logs/create`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
              },
              body: JSON.stringify({
                action: "AR_PREVIEW",
                details: "Clicked AR preview for product " + product.pName ,
                userId: parseInt(userId),
              }),
            });
          } catch (e) {
            console.warn("log failed:", e);
          }
        }
    };
    log();

  window.location.href = arUrl;
  };

  useEffect(() => {
  fetchCart();
  }, []);

  useEffect(() => {
  if (!cart?.items) return;

  const fetchColors = async () => {
    const newMap = {};

    for (let item of cart.items) {
      try {
        const res = await myFetch(
          `${API}/api/cartitem/get/colors/${item.cartItemId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        newMap[item.cartItemId] = data;
      } catch (err) {
        console.error(err);
      }
    }

    setColorsMap(newMap);
  };

  fetchColors();
  }, [cart]); 

  /* =========================
     REMOVE ITEM
  ========================= */
  const openRemovePopup = (item) => {
    setSelectedItem(item);
    setPopup(true);
  };

  const confirmRemove = async () => {
    if (!selectedItem) return;

    const ok = await removeItem(
      cartId,
      selectedItem.cartItemId
    );

    setPopup(false);
    setSelectedItem(null);

    if (ok) {
      setSuccessPopup(true);
      setTimeout(() => setSuccessPopup(false), 2000);
      fetchCart();
    }
  };

  /* =========================
     CLEAR CART
  ========================= */
  const clearCart = async () => {
    await myFetch(`${API}/api/cart/delete/${cartId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
    logAction("CLEAR_CART", `User ${localStorage.getItem("userName")} cleared their cart`);
    fetchCart();
  };

  /* =========================
     UPDATE QUANTITY
  ========================= */
  const updateQuantity = async (item, newQty) => {
    try {
      // check stock first
      const stockRes = await myFetch(
        `${API}/api/cartitem/get/stock/${item.cartItemId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const stock = await stockRes.json();

      if (newQty > stock) {
        setStockPopup(true);
        return;
      }

      if (newQty < 1) return;

      await myFetch(
        `${API}/api/cartitem/update/${item.cartItemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity: newQty,
            color: item.color,
            size: item.size,
            image: item.image,
          }),
        }
      );

      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================
     UPDATE COLOR
  ========================= */
  const updateColor = async (item, color) => {
    await myFetch(
      `${API}/api/cartitem/update/${item.cartItemId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity: item.quantity,
          color: color,
          size: item.size,
          image: item.image,
        }),
      }
    );

    fetchCart();
    setActiveColorPopup(null);
  };

  const items = cart?.items || [];
  const subtotal = cart?.total || 0;
  const shipping = items.length > 0 ? 1000 : 0;
  const total = subtotal + shipping;

  const toProductPage = (name, id) => {
  const safeName = encodeURIComponent(name);

  localStorage.setItem("selectedProductId", id);

  window.location.href = `/product/${safeName}`;
};

  const discountedTotal = total - Math.round(total * couponDiscount / 100);

  return (
    <div className={`container ${styles.cartContainer}`}>
      {/* HEADER */}
      <div className={styles.cartHeader}>
        <h1 className={styles.cartTitle}>Your Shopping Cart</h1>
        <span className={styles.itemCount}>
          ({items.length} {items.length === 1 ? "item" : "items"})
        </span>
      </div>

      {/* EMPTY */}
      {loading ? (
        <h3>Loading...</h3>
      ) : items.length === 0 ? (
        <div className={styles.emptyState}>
          <ShoppingBag size={48} />
          <h2>Your cart is empty</h2>
          <Link to="/shop" className="btn-primary">
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className={styles.cartGrid}>
          {/* ITEMS */}
          <div className={styles.itemsList}>
            
            {/* TOP BAR FIXED */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Link to="/shop" className="btn-primary">
                <ArrowLeft size={18} /> Continue Shopping
              </Link>

              <button
                className={styles.removeBtn}
                onClick={() => setClearPopup(true)}
              >
                <Trash2 size={16} /> Clear Cart
              </button>
            </div>

            {items.map((item, idx) => (
              <div key={item.cartItemId} className={styles.cartItem}>
                <img
                  src={getImageUrl(item.image)}
                  className={styles.itemImage}
                  onClick={() => toProductPage(item.name, item.pId)}
                />

                <div className={styles.itemDetails}>
                  <h3
                    className={styles.itemTitle}
                    onClick={() => toProductPage(item.name, item.pId)}
                  >
                    {item.name}
                  </h3>

                  {/* COLOR FROM BACKEND */}
                  <div className={styles.itemMeta}>
                    <span>Color:</span>

                    <div style={{ position: "relative" }}>
                      <span
                        className={styles.colorSwatch}
                        style={{ backgroundColor: item.color }}
                        onClick={() =>
                          setActiveColorPopup(
                            activeColorPopup === idx ? null : idx
                          )
                        }
                      />

                      {activeColorPopup === idx && (
                        <div className={styles.colorPopup}>
                          {colorsMap[item.cartItemId]?.map((c) => (
                            <span
                              key={c}
                              className={styles.colorSwatch}
                              style={{ backgroundColor: c }}
                              onClick={() => updateColor(item, c)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.itemPrice}>
                  {item.price} DZD
                </div>
                </div>

                {/* ACTIONS */}
                <div className={styles.itemActions}>
                  {item.ARSupport && (
                    <button
                                className={styles.arBtn}
                                style={{
                                  flex: 1,
                                  opacity: item.ARSupport ? 1 : 0.5,
                                  cursor: item.ARSupport ? "pointer" : "not-allowed"
                                }}
                                onClick={item.ARSupport ? () => openAR(item.pId) : undefined}
                                disabled={!item.ARSupport}
                              >
                                <View size={20} />
                                {item.ARSupport ? "View in AR" : "Coming Soon"}
                              </button>
                  )}
                  <div className={styles.quantityControls}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() =>
                        updateQuantity(item, item.quantity - 1)
                      }
                    >
                      <Minus size={14} />
                    </button>

                    <span className={styles.qtyValue}>
                      {item.quantity}
                    </span>

                    <button
                      className={styles.qtyBtn}
                      onClick={() =>
                        updateQuantity(item, item.quantity + 1)
                      }
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className={styles.itemPriceTotal}>
                    {item.subtotal} DZD
                  </div>

                  <button
                    className={styles.removeBtn}
                    onClick={() => openRemovePopup(item)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className={styles.summaryPanel}>
            <h2>Order Summary</h2>

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{subtotal} DZD</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>{shipping} DZD</span>
            </div>

            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total</span>
              <span>{total} DZD</span>
            </div>

            <button
              className={`btn-primary ${styles.checkoutBtn}`}
              onClick={() => {
                setCheckoutOpen(true);
                calculateCoupons();
              }}
            >
              Proceed to Checkout
            </button>

            <div className={styles.secureText}>
              <Lock size={14} /> Secure Checkout
            </div>
          </div>
        </div>
      )}

      {showPopup && (
              <div
                className={
                  styles.popupOverlay
                }
              >
                <div
                  className={
                    styles.popupCard
                  }
                >
                  <h3
                    className={
                      styles.popupTitle
                    }
                  >
                    {popupTitle}
                  </h3>
      
                  <p
                    className={
                      styles.popupText
                    }
                  >
                    {popupMessage}
                  </p>
      
                  {popupMode === 'ok' && (
                    <div
                      className={
                        styles.popupActionsSingle
                      }
                    >
                      <button
                        className={
                          styles.okBtn
                        }
                        onClick={() =>
                          setShowPopup(false)
                        }
                      >
                        OK
                      </button>
                    </div>
                  )}
      
                  {popupMode ===
                    'login' && (
                      <div
                        className={
                          styles.popupActions
                        }
                      >
                        <button
                          className={
                            styles.confirmBtn
                          }
                          onClick={() =>
                            navigate(
                              '/login'
                            )
                          }
                        >
                          Log In
                        </button>
      
                        <button
                          className={
                            styles.cancelBtn
                          }
                          onClick={() =>
                            setShowPopup(false)
                          }
                        >
                          Cancel
                        </button>
                      </div>
                    )}
      
                  {popupMode ===
                    'remove' && (
                      <div
                        className={
                          styles.popupActions
                        }
                      >
                        <button
                          className={
                            styles.confirmBtn
                          }
                          onClick={
                            removeWishlist
                          }
                        >
                          Remove
                        </button>
      
                        <button
                          className={
                            styles.cancelBtn
                          }
                          onClick={() =>
                            setShowPopup(false)
                          }
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                </div>
              </div>
            )}

      {/* STOCK POPUP */}
      {stockPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupCard}>
            <h3>Stock limit reached</h3>
            <p>You cannot add more of this item.</p>
            <button
              className={styles.okBtn}
              onClick={() => setStockPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* REMOVE POPUP */}
      {popup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupCard}>
            <h3 className={styles.popupTitle}>Remove item?</h3>

            <p className={styles.popupText}>
              This item will be removed from your cart.
            </p>

            <div className={styles.popupActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setPopup(false)}
              >
                Cancel
              </button>

              <button
                className={styles.confirmBtn}
                onClick={confirmRemove}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER SUCCESS */}
      {orderaddedPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupCard}>
            <h3 className={styles.popupTitle}>Order Added</h3>

            <p className={styles.popupText}>
              The transaction was successful you can check your orders in the profile page.
            </p>

            <div className={styles.popupActionsSingle}>
              <button
                className={styles.okBtn}
                onClick={() => setOrderaddedPopup(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}


      {/* SUCCESS */}
      {successPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupCard}>
            <h3 className={styles.popupTitle}>Item removed</h3>

            <p className={styles.popupText}>
              The item was successfully removed from your cart.
            </p>

            <div className={styles.popupActionsSingle}>
              <button
                className={styles.okBtn}
                onClick={() => setSuccessPopup(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {clearPopup && (
      <div className={styles.popupOverlay}>
        <div className={styles.popupCard}>
          <h3 className={styles.popupTitle}>Clear entire cart?</h3>
          <p className={styles.popupText}>
            This will remove all items from your cart.
          </p>

          <div className={styles.popupActions}>
            <button
              className={styles.cancelBtn}
              onClick={() => setClearPopup(false)}
            >
              Cancel
            </button>

            <button
              className={styles.confirmBtn}
              onClick={() => {
                clearCart();
                setClearPopup(false);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    )}

    {/* CHECKOUT POPUP */}
    {checkoutOpen && (
    <div className={styles.popupOverlay} onClick={() => setCheckoutOpen(false)}>
      <div className={styles.checkoutCard} onClick={(e) => e.stopPropagation()}>
        {/* HEADER (sticky) */}
        <div className={styles.checkoutHeader}>
          <h2>Checkout</h2>
          <button className={styles.closeBtn} onClick={() => setCheckoutOpen(false)}>×</button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className={styles.checkoutBody}>
          {/* ORDER SUMMARY */}
          <div className={styles.checkoutSection}>
            <h3>Order Summary</h3>
            {items.map((item) => (
              <div key={item.cartItemId} className={styles.checkoutRow}>
                <span>{item.name} × {item.quantity}</span>
                <span>{item.subtotal} DZD</span>
              </div>
            ))}
            <div className={styles.checkoutRow}>
              <span>Subtotal</span>
              <span>{subtotal} DZD</span>
            </div>
            <div className={styles.checkoutRow}>
              <span>Shipping</span>
              <span>{shipping} DZD</span>
            </div>
            <div className={styles.checkoutTotal}>
              <span>Total</span>
              <span>{discountedTotal} DZD</span>
            </div>

            {couponDiscount > 0 && (
              <div className={styles.checkoutSection} style={{ background: '#fff8e1', borderRadius: 10, padding: '0.75rem 1rem' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Gift size={16} /> Coupons applied
                </strong>
                {coupons.map(c => (
                  <div key={c.code} className={styles.checkoutRow}>
                    <span>{c.icon} {c.label}</span>
                    <span style={{ color: '#b48a3c', fontWeight: 700 }}>-{c.percentage}%</span>
                  </div>
                ))}
                <div className={styles.checkoutRow} style={{ marginTop: 4 }}>
                  <span><strong>You saved</strong></span>
                  <span style={{ color: '#22c55e', fontWeight: 700 }}>{total - discountedTotal} DZD</span>
                </div>
              </div>
            )}
          </div>

          {/* SHIPPING */}
          <div className={styles.checkoutSection}>
            <h3>Shipping</h3>
            <p className={styles.checkoutText}>Standard Delivery (3–5 days)</p>
            <p className={styles.checkoutHint}>
              Address: {localStorage.getItem("shipping") || "Not set"}
            </p>
          </div>

          {/* PAYMENT METHOD */}
          <div className={styles.checkoutSection}>
            <h3>Payment Method</h3>

            <label className={`${styles.payOption} ${paymentMethod === "cod" ? styles.payOptionActive : ""}`}>
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              <div>
                <strong>Cash on Delivery</strong>
                <p>Pay when your order arrives.</p>
              </div>
            </label>

            <label className={`${styles.payOption} ${paymentMethod === "card" ? styles.payOptionActive : ""}`}>
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
              />
              <div>
                <strong>Card Payment</strong>
                <p>Visa, Mastercard, CIB / Edahabia.</p>
              </div>
            </label>

            {/* CARD FORM */}
            {paymentMethod === "card" && (
              <div className={styles.cardForm}>
                <p className={styles.cardNote}>
                  You'll be redirected to Chargily to pay securely with Edahabia or CIB.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* STICKY FOOTER */}
        <div className={styles.checkoutFooter}>
          <button onClick={Order} className={styles.payBtn}>
            Confirm Order · {discountedTotal} DZD
          </button>
          <p className={styles.secureNote}>🔒 Secure checkout protected</p>
        </div>
      </div>
    </div>
  )}
    {showCouponPopup && (
    <div className={styles.popupOverlay}>
      <div className={`${styles.popupCard} ${styles.couponCard}`}>
        <div className={styles.couponHeader}>
          <SparklesIcon size={28} />
          <h2>You unlocked bonuses!</h2>
        </div>

        <div className={styles.couponList}>
          {coupons.map(c => (
            <div key={c.code} className={styles.couponRow}>
              <span className={styles.couponIcon}>{c.icon}</span>
              <div>
                <strong>{c.label}</strong>
                <p>{c.description}</p>
              </div>
              <span className={styles.couponPct}>-{c.percentage}%</span>
            </div>
          ))}
        </div>

        <div className={styles.couponSummary}>
          <div>
            <span>Original</span>
            <strong style={{ textDecoration: 'line-through', color: '#999' }}>{total} DZD</strong>
          </div>
          <div>
            <span>New total</span>
            <strong style={{ color: '#22c55e' }}>{discountedTotal} DZD</strong>
          </div>
        </div>

        <button className={styles.okBtn} onClick={() => setShowCouponPopup(false)}>
          Awesome — let's go
        </button>
      </div>
    </div>
  )}
    </div>
  );
};

export default Cart;