import React, { useState } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css';
import { useWishlist } from '../context/WishlistContext';

const Logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedin");
    localStorage.removeItem("userName");
    window.location.href = "/login";
};

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const [orderQty, setOrderQty] = useState(1);
    const [selectedTrackOrder, setSelectedTrackOrder] = useState(null);
    const navigate = useNavigate();
    const { wishlistItems, removeFromWishlist } = useWishlist();

    const getStatusClass = (step) => {
        if (!selectedTrackOrder) return '';
        const statusOrder = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

        const currentStatus = selectedTrackOrder.status || 'PLACED';
        const currentIdx = statusOrder.indexOf(currentStatus.toUpperCase());
        const stepIdx = statusOrder.indexOf(step);

        if (stepIdx < currentIdx) return styles.completed;
        if (stepIdx === currentIdx && step === 'DELIVERED') return styles.completed;
        if (stepIdx === currentIdx) return styles.active;
        return '';
    };

    return (
        <div className={styles.profileContainer}>
            <div className={styles.headerGlass}>
                <div className={styles.profileHeader}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatar} style={{ background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '3rem' }}>
                            <i className="fas fa-user"></i>
                        </div>
                        <button className={styles.editAvatarBtn}><i className="fas fa-camera"></i></button>
                    </div>
                    <div className={styles.userInfo}>
                        <h1 className={styles.userName}>Name</h1>
                        <p className={styles.userEmail}>Email</p>
                    </div>
                    <div className={styles.profileActions}>
                        <button className="btn-secondary" onClick={Logout}>
                            Log Out
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.contentLayout}>
                <aside className={styles.sidebar}>
                    <ul className={styles.tabList}>
                        <li className={`${styles.tabItem} ${activeTab === 'orders' ? styles.active : ''}`} onClick={() => setActiveTab('orders')}>
                            <i className="fas fa-box"></i> My Orders
                        </li>
                        <li className={`${styles.tabItem} ${activeTab === 'wishlist' ? styles.active : ''}`} onClick={() => setActiveTab('wishlist')}>
                            <i className="fas fa-heart"></i> Wishlist
                        </li>
                        <li className={`${styles.tabItem} ${activeTab === 'settings' ? styles.active : ''}`} onClick={() => setActiveTab('settings')}>
                            <i className="fas fa-cog"></i> Settings
                        </li>
                    </ul>
                </aside>

                <main className={styles.mainContent}>
                    {activeTab === 'orders' && (
                        <div className={styles.tabPanel}>
                            <h2>Recent Orders</h2>
                            <div className={styles.orderCard}>
                                <div className={styles.orderDetails}>
                                    <div className={styles.orderItem}>
                                        <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80" alt="Velvet Armchair" />
                                        <div>
                                            <h4>HoloRoom Velvet Armchair</h4>
                                            <p>Living Room · Qty: {orderQty}</p>
                                            <div className={styles.qtyControls}>
                                                <button className={styles.qtyBtn} onClick={() => setOrderQty(q => Math.max(1, q - 1))}>
                                                    <Minus size={14} />
                                                </button>
                                                <span className={styles.qtyValue}>{orderQty}</span>
                                                <button className={styles.qtyBtn} onClick={() => setOrderQty(q => q + 1)}>
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.orderActions}>
                                        <button className={styles.removeOrderBtn} title="Remove order">
                                            <Trash2 size={18} />
                                        </button>
                                        <span className={styles.orderPrice}>{(34500 * orderQty).toLocaleString()} DZD</span>
                                    </div>
                                </div>
                                <div className={styles.orderFooter}>
                                    {/* Set a mock order object with a status when testing */}
                                    <button className={styles.trackBtn} onClick={() => setSelectedTrackOrder({ id: 1, status: 'SHIPPED' })}>Track Order</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'wishlist' && (
                        <div className={styles.tabPanel}>
                            <h2>My Wishlist</h2>
                            {wishlistItems.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <i className="fas fa-heart-broken"></i>
                                    <p>Your wishlist is empty.</p>
                                    <button className="btn-primary" onClick={() => navigate('/shop')}>Explore Shop</button>
                                </div>
                            ) : (
                                <div className={styles.wishlistGrid}>
                                    {wishlistItems.map(item => (
                                        <div key={item.id} className={styles.wishlistCard}>
                                            <img src={item.image || item.images?.[0]} alt={item.name} />
                                            <div>
                                                <h4>{item.name}</h4>
                                                <p className={styles.orderPrice} style={{ fontSize: '1rem', marginTop: '5px' }}>{item.price}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}>
                                                <button className="btn-primary" onClick={() => navigate(`/product/${item.id}`)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>View</button>
                                                <button className={styles.removeBtn} onClick={() => removeFromWishlist(item.id)}>Remove</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}



                    {activeTab === 'settings' && (
                        <div className={styles.tabPanel}>
                            <h2>Account Settings</h2>
                            <form className={styles.settingsForm}>
                                <div className={styles.formGroup}>
                                    <label>Full Name</label>
                                    <input type="text" placeholder="Your full name" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email Address</label>
                                    <input type="email" placeholder="Your email address" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Phone Number</label>
                                    <input type="tel" placeholder="+213 555 555 555" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>New Password</label>
                                    <input type="password" placeholder="Put your password here" />
                                </div>
                                <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
                            </form>
                        </div>
                    )}
                </main>
            </div>

            {selectedTrackOrder && (
                <div className={styles.modalOverlay} onClick={() => setSelectedTrackOrder(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Order Status</h3>
                            <button className={styles.closeBtn} onClick={() => setSelectedTrackOrder(null)}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.statusStep}>
                                <div className={`${styles.statusDot} ${getStatusClass('PLACED')}`}></div>
                                <div className={styles.statusText}>
                                    <p className={styles.statusTitle}>Order Placed</p>
                                    <p className={styles.statusDate}>Awaiting Confirmation</p>
                                </div>
                            </div>
                            <div className={styles.statusStep}>
                                <div className={`${styles.statusDot} ${getStatusClass('PROCESSING')}`}></div>
                                <div className={styles.statusText}>
                                    <p className={styles.statusTitle}>Processing</p>
                                    <p className={styles.statusDate}>Preparing your order</p>
                                </div>
                            </div>
                            <div className={styles.statusStep}>
                                <div className={`${styles.statusDot} ${getStatusClass('SHIPPED')}`}></div>
                                <div className={styles.statusText}>
                                    <p className={styles.statusTitle}>Shipped</p>
                                    <p className={styles.statusDate}>In Transit</p>
                                </div>
                            </div>
                            <div className={styles.statusStep}>
                                <div className={`${styles.statusDot} ${getStatusClass('DELIVERED')}`}></div>
                                <div className={styles.statusText}>
                                    <p className={styles.statusTitle}>Delivered</p>
                                    <p className={styles.statusDate}>Pending Arrival</p>
                                </div>
                            </div>
                        </div>
                        <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => setSelectedTrackOrder(null)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
