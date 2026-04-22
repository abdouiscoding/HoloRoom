import React from 'react';
import { ShoppingBag, ArrowRight, ArrowLeft, Lock, Minus, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Cart.module.css';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, cartCount, cartSubtotal, removeFromCart, updateQuantity } = useCart();
  const shipping = cartCount > 0 ? 1000.00 : 0;
  const total = cartSubtotal + shipping;
  return (
    <div className={`container ${styles.cartContainer} page-enter-active`}>
      <div className={styles.cartHeader}>
        <h1 className={styles.cartTitle}>Your Shopping Cart</h1>
        <span className={styles.itemCount}>({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
      </div>

      {cartItems.length === 0 ? (
        <div className={`glass-panel ${styles.emptyState}`}>
          <div className={styles.emptyIconWrapper}>
            <ShoppingBag size={48} />
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/shop" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center' }}>
            Continue Shopping <ArrowRight size={18} style={{ marginLeft: '8px' }} />
          </Link>
        </div>
      ) : (
        <div className={styles.cartGrid}>
          {/* Items List */}
          <div className={styles.itemsList}>
            {cartItems.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className={`glass-panel ${styles.cartItem}`}>
                <img src={item.images && item.images[0]} alt={item.name} className={styles.itemImage} />

                <div className={styles.itemDetails}>
                  <h3>{item.name}</h3>
                  <div className={styles.itemMeta}>
                    <span>Color:</span>
                    <span className={styles.colorSwatch} style={{ backgroundColor: item.color }} />
                  </div>
                  <div className={styles.itemPrice}>{item.price} each</div>
                </div>

                <div className={styles.itemActions}>
                  <div className={styles.quantityControls}>
                    <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.color, -1)}><Minus size={14} /></button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.color, 1)}><Plus size={14} /></button>
                  </div>
                  <div className={styles.itemPriceTotal}>
                    {(parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity).toFixed(2)} DZD
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeFromCart(item.id, item.color)}>Remove</button>
                </div>
              </div>
            ))}
            <div style={{ marginTop: '1rem' }}>
              <Link to="/shop" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className={`glass-panel ${styles.summaryPanel}`}>
            <h2>Order Summary</h2>

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{cartSubtotal.toFixed(2)} DZD</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Estimated Shipping</span>
              <span>{shipping.toFixed(2)} DZD</span>
            </div>

            <div className={styles.promoCode}>
              <input type="text" placeholder="Have a Promo Code?" className={styles.promoInput} />
              <button className="btn-secondary">Apply</button>
            </div>

            <div className={styles.shippingOptions}>
              <label className={styles.shippingLabel}>
                <input type="radio" name="shipping" defaultChecked />
                Standard Shipping (3-5 days)
              </label>
            </div>

            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total</span>
              <span>{total.toFixed(2)} DZD</span>
            </div>

            <button className={`btn-primary ${styles.checkoutBtn}`}>
              Proceed to Checkout
            </button>

            <div className={styles.secureText}>
              <Lock size={14} /> Secure Checkout
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
