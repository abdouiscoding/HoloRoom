import React, { useState } from 'react';
import { ShoppingBag, ArrowRight, ArrowLeft, Lock, Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Cart.module.css';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, cartCount, cartSubtotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const [activeColorPopup, setActiveColorPopup] = useState(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <button
                className="btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', color: '#ff4d4f', borderColor: '#ff4d4f', backgroundColor: 'transparent', padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
              >
                <Trash2 size={16} style={{ marginRight: '6px' }} /> Clear Cart
              </button>
            </div>
            {cartItems.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className={`glass-panel ${styles.cartItem}`}>
                <img src={item.images && item.images[0]} alt={item.name} className={styles.itemImage} />

                <div className={styles.itemDetails}>
                  <h3>{item.name}</h3>
                  <div className={styles.itemMeta}>
                    <span>Choose your Color:</span>
                    <div style={{ position: 'relative' }}>
                      <span
                        className={styles.colorSwatch}
                        style={{
                          backgroundColor: item.color,
                          cursor: 'pointer',
                          ...(activeColorPopup === `${item.id}-${idx}` ? { transform: 'scale(1.3)', boxShadow: '0 0 5px rgba(0,0,0,0.3)' } : {})
                        }}
                        onClick={() => setActiveColorPopup(activeColorPopup === `${item.id}-${idx}` ? null : `${item.id}-${idx}`)}
                      />
                      {activeColorPopup === `${item.id}-${idx}` && (
                        <div className={styles.colorPopup}>
                          {['#244568', '#f89d00', '#f4f5f7', '#333333', '#e0e0e0'].map(c => (
                            <span
                              key={c}
                              className={styles.colorSwatch}
                              style={{
                                backgroundColor: c,
                                cursor: 'pointer',
                                border: c === item.color ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)'
                              }}
                              onClick={() => setActiveColorPopup(null)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.itemActions}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div className={styles.quantityControls}>
                      <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.color, -1)}><Minus size={14} /></button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.color, 1)}><Plus size={14} /></button>
                    </div>
                    <div className={styles.itemPriceTotal}>
                      {(parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity).toFixed(2)} DZD
                    </div>
                  </div>
                  <button className={styles.removeBtn} title="Remove Item">
                    <Trash2 size={20} color="#ff4d4f" />
                  </button>
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
                Standard Shipping
              </label>
            </div>

            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total</span>
              <span>{total.toFixed(2)} DZD</span>
            </div>

            <button className={`btn-primary ${styles.checkoutBtn}`} onClick={() => setIsCheckoutModalOpen(true)}>
              Proceed to Checkout
            </button>

            <div className={styles.secureText}>
              <Lock size={14} /> Secure Checkout
            </div>
          </div>
        </div>
      )}

      {isCheckoutModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsCheckoutModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Checkout Summary</h3>
              <button className={styles.closeBtn} onClick={() => setIsCheckoutModalOpen(false)}>×</button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.checkoutSection}>
                <h4><i className="fas fa-map-marker-alt" style={{ color: 'var(--accent-primary)' }}></i> Shipping Address</h4>
                <div className={styles.checkoutCard}>
                  <div className={styles.checkoutCardInfo}>
                    <p style={{ fontWeight: 600 }}>Home</p>
                    <p className={styles.checkoutItemMeta}>123 Main St, Algiers, Algeria</p>
                  </div>
                  <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Change</button>
                </div>
              </div>

              <div className={styles.checkoutSection}>
                <h4><i className="fas fa-credit-card" style={{ color: 'var(--accent-primary)' }}></i> Payment Method</h4>
                <div className={styles.checkoutCard}>
                  <div className={styles.checkoutCardInfo}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fab fa-cc-visa" style={{ fontSize: '1.2rem' }}></i>
                      <p style={{ fontWeight: 600 }}>Visa ending in 4242</p>
                    </div>
                  </div>
                  <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Change</button>
                </div>
              </div>

              <div className={styles.checkoutSection} style={{ marginTop: '1rem' }}>
                <h4><ShoppingBag size={18} style={{ color: 'var(--accent-primary)' }}/> Order Details</h4>
                <div style={{ maxHeight: '150px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {cartItems.map((item, idx) => (
                    <div key={item.id + idx} className={styles.checkoutItemRow}>
                      <div className={styles.checkoutItemInfo}>
                        <span className={styles.checkoutItemTitle}>{item.name}</span>
                        <span className={styles.checkoutItemMeta}>
                          {item.selectedColor ? `Color: ${item.selectedColor.name} | ` : ''}Qty: {item.quantity}
                        </span>
                      </div>
                      <span className={styles.checkoutItemPrice}>{(item.price * item.quantity).toFixed(2)} DZD</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.checkoutTotal}>
                <span>Total to Pay</span>
                <span>{total.toFixed(2)} DZD</span>
              </div>

              <button className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => { setIsCheckoutModalOpen(false); clearCart(); }}>
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
