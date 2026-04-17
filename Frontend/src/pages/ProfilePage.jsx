import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css';
import { useWishlist } from '../context/WishlistContext';

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const navigate = useNavigate();
    const { wishlistItems, removeFromWishlist } = useWishlist();

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
                        <button className="btn-primary">Edit Profile</button>
                        <button className="btn-secondary">Log Out</button>
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
                                <p>You have no recent orders.</p>
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
                                                <p className={styles.orderPrice} style={{fontSize: '1rem', marginTop: '5px'}}>{item.price}</p>
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
        </div>
    );
};

export default ProfilePage;
