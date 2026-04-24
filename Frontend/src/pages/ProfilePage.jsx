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
    const [selectedTrackOrder, setSelectedTrackOrder] = useState(null);
    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
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
                            <div className={styles.emptyState}>
                                <i className="fas fa-box-open"></i>
                                <p>You haven't placed any orders yet.</p>
                                <button className="btn-primary" onClick={() => navigate('/shop')}>Start Shopping</button>
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
                                    <label>Username</label>
                                    <input type="text" placeholder="Your username" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Phone Number</label>
                                    <button type="button" className="btn-secondary" style={{ width: 'max-content' }} onClick={() => setIsPhoneModalOpen(true)}>Add Phone Number</button>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Password</label>
                                    <button type="button" className="btn-secondary" style={{ width: 'max-content' }} onClick={() => setIsPasswordModalOpen(true)}>Change Password</button>
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

            {isPhoneModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsPhoneModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Add Phone Number</h3>
                            <button className={styles.closeBtn} onClick={() => setIsPhoneModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); setIsPhoneModalOpen(false); }}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label>Phone Number</label>
                                    <input type="tel" placeholder="+213 555 555 555" required style={{ width: '100%', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setIsPhoneModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isPasswordModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsPasswordModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Change Password</h3>
                            <button className={styles.closeBtn} onClick={() => setIsPasswordModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); setIsPasswordModalOpen(false); }}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label>Current Password</label>
                                    <input type="password" placeholder="Enter old password" required style={{ width: '100%', boxSizing: 'border-box' }} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>New Password</label>
                                    <input type="password" placeholder="Enter new password" required style={{ width: '100%', boxSizing: 'border-box' }} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Confirm New Password</label>
                                    <input type="password" placeholder="Confirm new password" required style={{ width: '100%', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setIsPasswordModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Update Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
