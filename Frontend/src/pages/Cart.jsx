import React, { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Cart.module.css';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, fetchCart, removeItem, loading } = useCart();

  const [popup, setPopup] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

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
          ({items.length} items)
        </span>
      </div>

      {/* EMPTY STATE */}
      {loading ? (
        <h3>Loading...</h3>
      ) : items.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrapper}>
            <ShoppingBag size={48} />
          </div>
          <h2>Your cart is empty</h2>
          <p>Go explore products and add something cool 👀</p>
          <Link to="/shop" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className={styles.cartGrid}>

          {/* ITEMS */}
          <div className={styles.itemsList}>
            {items.map((item) => (
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
                  <h3>Product</h3>

                  <div className={styles.itemMeta}>
                    <span>Color:</span>
                    <span
                      className={styles.colorSwatch}
                      style={{ backgroundColor: item.color }}
                    />
                  </div>

                  <div className={styles.itemPrice}>
                    {item.price} DZD
                  </div>
                </div>

                <div className={styles.itemActions}>
                  <div>Quantity: {item.quantity}</div>

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

            <button className="btn-primary checkoutBtn">
              Checkout
            </button>
          </div>

        </div>
      )}

      {/* CONFIRM POPUP */}
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

      {/* SUCCESS POPUP */}
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
                onClick={() => setSuccessPopup(false)}
              >
                OK
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Cart;