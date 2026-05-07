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
import { API, address, myFetch } from "../api";

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

  const [popup, setPopup] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeColorPopup, setActiveColorPopup] = useState(null);
  const [stockPopup, setStockPopup] = useState(false);
  const [clearPopup, setClearPopup] = useState(false);
  const [orderaddedPopup, setOrderaddedPopup] = useState(false);

  const [colorsMap, setColorsMap] = useState({});

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const cartId = localStorage.getItem("cartId");

  const Order = async () => {
  const res = await myFetch (`${API}/api/orders/create/${userId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
            cartId: cartId,
            userId: userId
      }),
    });

    if(!res.ok){
      alert("transaction failed");
      return;
    }
    setOrderaddedPopup(true);
  setCheckoutOpen(false);
  }

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

  const arUrl =
    `https://control-parole-grandkid.ngrok-free.dev/` +
    `?token=${encodeURIComponent(token)}` +
    `&userId=${encodeURIComponent(userId)}` +
    `&productId=${encodeURIComponent(productId)}`;

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
    });

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
              onClick={() => setCheckoutOpen(true)}
            >
              Proceed to Checkout
            </button>

            <div className={styles.secureText}>
              <Lock size={14} /> Secure Checkout
            </div>
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
      <div
        className={styles.checkoutCard}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className={styles.checkoutHeader}>
          <h2>Checkout</h2>
          <button
            className={styles.closeBtn}
            onClick={() => setCheckoutOpen(false)}
          >
            ×
          </button>
        </div>

        {/* CONTENT */}
        <div className={styles.checkoutBody}>
          {/* ORDER SUMMARY */}
          <div className={styles.checkoutSection}>
            <h3>Order Summary</h3>

            {items.map((item) => (
              <div key={item.cartItemId} className={styles.checkoutRow}>
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{item.subtotal} DZD</span>
              </div>
            ))}

            <div className={styles.checkoutRow}>
              <span></span>
              <span>+</span>
            </div>

            <div className={styles.checkoutRow}>
              <span>Shipping</span>
              <span>1000 DZD</span>
            </div>


            <div className={styles.checkoutTotal}>
              <span>Total</span>
              <span>{total} DZD</span>
            </div>
          </div>

          {/* SHIPPING */}
          <div className={styles.checkoutSection}>
            <h3>Shipping</h3>
            <p className={styles.checkoutText}>
              Standard Delivery (3–5 days)
            </p>
            <p className={styles.checkoutHint}>
              Address: {localStorage.getItem("shipping")}
            </p>
          </div>

          {/* PAYMENT */}
          <div className={styles.checkoutSection}>
            <h3>Payment Method</h3>

            <label className={styles.radioRow}>
              <input type="radio" defaultChecked />
              <span>Cash on Delivery</span>
            </label>

            <label className={styles.radioRow}>
              <input type="radio" />
              <span>Card Payment (coming soon)</span>
            </label>
          </div>

          {/* ACTION */}
          <button onClick={Order} className={styles.payBtn}>
            Confirm Order
          </button>

          <p className={styles.secureNote}>
            🔒 Secure checkout protected
          </p>
        </div>
      </div>
    </div>
  )}
    </div>
  );
};

export default Cart;