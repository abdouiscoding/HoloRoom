import React, { useEffect, useState } from "react";
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Lock,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./Cart.module.css";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { cart, fetchCart, removeItem, loading } = useCart();

  const [popup, setPopup] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeColorPopup, setActiveColorPopup] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const openRemovePopup = (item) => {
    setSelectedItem(item);
    setPopup(true);
  };

  const confirmRemove = async () => {
    if (!selectedItem) return;

    const ok = await removeItem(
      cart.pCartId,
      selectedItem.cartItemId
    );

    setPopup(false);
    setSelectedItem(null);

    if (ok) {
      setSuccessPopup(true);
      setTimeout(() => setSuccessPopup(false), 2000);
    }
  };

  const items = cart?.items || [];
  const subtotal = cart?.total || 0;
  const shipping = items.length > 0 ? 1000 : 0;
  const total = subtotal + shipping;

  return (
    <div className={`container ${styles.cartContainer}`}>
      {/* HEADER */}
      <div className={styles.cartHeader}>
        <h1 className={styles.cartTitle}>Your Shopping Cart</h1>

        <span className={styles.itemCount}>
          ({items.length} {items.length === 1 ? "item" : "items"})
        </span>
      </div>

      {/* LOADING */}
      {loading ? (
        <h3>Loading...</h3>
      ) : items.length === 0 ? (
        /* EMPTY */
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrapper}>
            <ShoppingBag size={48} />
          </div>

          <h2>Your cart is empty</h2>

          <p>Looks like you haven't added anything yet.</p>

          <Link
            to="/shop"
            className="btn-primary"
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            Continue Shopping
            <ArrowRight size={18} style={{ marginLeft: 8 }} />
          </Link>
        </div>
      ) : (
        <div className={styles.cartGrid}>
          {/* ITEMS */}
          <div className={styles.itemsList}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "0.75rem",
              }}
            >

              <div style={{ marginTop: "1rem" }}>
              <Link
                to="/shop"
                className="btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <ArrowLeft
                  size={18}
                  style={{ marginRight: 8 }}
                />
                Continue Shopping
              </Link>
            </div>
            
              <button
                className="btn-secondary"
                style={{
                  color: "#ff4d4f",
                  borderColor: "#ff4d4f",
                }}
              >
                <Trash2 size={16} style={{ marginRight: 6 }} />
                Clear Cart
              </button>
            </div>

            {items.map((item, idx) => (
              <div
                key={item.cartItemId}
                className={styles.cartItem}
              >
                <img
                  src={item.image}
                  className={styles.itemImage}
                  alt=""
                />

                <div className={styles.itemDetails}>
                  <h3>{item.name || "Product"}</h3>

                  {/* COLOR PICKER */}
                  <div className={styles.itemMeta}>
                    <span>Color:</span>

                    <div style={{ position: "relative" }}>
                      <span
                        className={styles.colorSwatch}
                        style={{
                          backgroundColor:
                            item.color || "#333",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          setActiveColorPopup(
                            activeColorPopup === idx
                              ? null
                              : idx
                          )
                        }
                      />

                      {activeColorPopup === idx && (
                        <div className={styles.colorPopup}>
                          {[
                            "#244568",
                            "#f89d00",
                            "#f4f5f7",
                            "#333333",
                            "#e0e0e0",
                          ].map((c) => (
                            <span
                              key={c}
                              className={styles.colorSwatch}
                              style={{
                                backgroundColor: c,
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                setActiveColorPopup(null)
                              }
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    {/* Quantity UI only */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <button className={styles.qtyBtn}>
                        <Minus size={14} />
                      </button>

                      <span>{item.quantity}</span>

                      <button className={styles.qtyBtn}>
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className={styles.itemPriceTotal}>
                      {item.price * item.quantity} DZD
                    </div>
                  </div>

                  <button
                    className={styles.removeBtn}
                    onClick={() => openRemovePopup(item)}
                    style={{
                      color : "red",
                  borderColor: "#ff4d4f"
                }}
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

            {/* PROMO */}
            <div className={styles.promoCode}>
              <input
                type="text"
                placeholder="Promo Code"
                className={styles.promoInput}
              />

              <button className="btn-secondary">
                Apply
              </button>
            </div>

            {/* SHIPPING */}
            <div className={styles.shippingOptions}>
              <label className={styles.shippingLabel}>
                <input
                  type="radio"
                  defaultChecked
                />
                Standard Shipping
              </label>
            </div>

            <div
              className={`${styles.summaryRow} ${styles.total}`}
            >
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

      {/* REMOVE POPUP */}
      {popup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupCard}>
            <h3 className={styles.popupTitle}>
              Remove item?
            </h3>

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

      {/* SUCCESS */}
      {successPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupCard}>
            <h3 className={styles.popupTitle}>
              Item deleted
            </h3>

            <p className={styles.popupText}>
              The item was successfully removed.
            </p>

            <div className={styles.popupActionsSingle}>
              <button
                className={styles.okBtn}
                onClick={() =>
                  setSuccessPopup(false)
                }
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT */}
      {checkoutOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setCheckoutOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className={styles.modalHeader}>
              <h3>Checkout Summary</h3>

              <button
                className={styles.closeBtn}
                onClick={() =>
                  setCheckoutOpen(false)
                }
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <h4>Shipping Address</h4>
              <p>123 Main St, Algiers, Algeria</p>

              <h4 style={{ marginTop: 20 }}>
                Payment Method
              </h4>
              <p>Visa ending in 4242</p>

              <h4 style={{ marginTop: 20 }}>
                Order Items
              </h4>

              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className={
                    styles.checkoutItemRow
                  }
                >
                  <span>
                    {item.name || "Product"} x{" "}
                    {item.quantity}
                  </span>

                  <span>
                    {item.price *
                      item.quantity}{" "}
                    DZD
                  </span>
                </div>
              ))}

              <div
                className={
                  styles.checkoutTotal
                }
              >
                <span>Total</span>
                <span>{total} DZD</span>
              </div>

              <button
                className="btn-primary"
                style={{
                  width: "100%",
                  marginTop: "1rem",
                }}
                onClick={() =>
                  setCheckoutOpen(false)
                }
              >
                Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;