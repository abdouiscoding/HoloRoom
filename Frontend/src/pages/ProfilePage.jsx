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
    const [isCreditCardModalOpen, setIsCreditCardModalOpen] = useState(false);
    const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const navigate = useNavigate();
    const { wishlistItems, removeFromWishlist } = useWishlist();

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

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
                        <div className={styles.avatar} style={{ background: profileImage ? 'transparent' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '3rem' }}>
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <i className="fas fa-user"></i>
                            )}
                        </div>
                        <label htmlFor="avatarUpload" className={styles.editAvatarBtn} style={{ cursor: 'pointer' }}>
                            <i className="fas fa-camera"></i>
                        </label>
                        <input
                            type="file"
                            id="avatarUpload"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageUpload}
                        />
                    </div>
                    <div className={styles.userInfo}>
                        <h1 className={styles.userName}>Name</h1>
                        <p className={styles.userEmail}>Email</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <i className="fas fa-map-marker-alt" style={{ marginRight: '5px' }}></i>
                                123 Main St, Algiers, Algeria
                            </p>
                            <button 
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} 
                                title="Delete Address"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
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
                        <li className={`${styles.tabItem} ${activeTab === 'cards' ? styles.active : ''}`} onClick={() => setActiveTab('cards')}>
                            <i className="fas fa-credit-card"></i> Payment Methods
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
                                    <label> Add/Update Your Username</label>
                                    <button type='button' className='btn-secondary' style={{ width: 'max-content' }} onClick={() => setIsUsernameModalOpen(true)}>Add Username</button>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Shipping Address</label>
                                    <button type="button" className="btn-secondary" style={{ width: 'max-content' }} onClick={() => setIsAddressModalOpen(true)}>Add Address</button>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Password</label>
                                    <button type="button" className="btn-secondary" style={{ width: 'max-content' }} onClick={() => setIsPasswordModalOpen(true)}>Change Password</button>
                                </div>
                                <button type="button" className="btn-primary" style={{ alignSelf: 'flex-end' }}>Save Changes</button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'cards' && (
                        <div className={styles.tabPanel}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                                <h2 style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>Payment Methods</h2>
                                <button className="btn-primary" onClick={() => setIsCreditCardModalOpen(true)}>Add New Card</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className={styles.paymentCard}>
                                    <div className={styles.cardInfo}>
                                        <i className="fab fa-cc-visa" style={{ fontSize: '2rem' }}></i>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 600 }}>Visa ending in 4242</p>
                                            <p className={styles.cardExpiry} style={{ margin: 0, fontSize: '0.9rem' }}>Expires 12/28</p>
                                        </div>
                                    </div>
                                    <button className={styles.deleteBtn} style={{ background: 'none', border: 'none', cursor: 'pointer' }} title="Delete Card">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                                <div className={styles.paymentCard}>
                                    <div className={styles.cardInfo}>
                                        <i className="fab fa-cc-mastercard" style={{ color: '#eb001b', fontSize: '2rem' }}></i>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 600 }}>Mastercard ending in 8844</p>
                                            <p className={styles.cardExpiry} style={{ margin: 0, fontSize: '0.9rem' }}>Expires 09/27</p>
                                        </div>
                                    </div>
                                    <button className={styles.deleteBtn} style={{ background: 'none', border: 'none', cursor: 'pointer' }} title="Delete Card">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
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

            {isUsernameModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsUsernameModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Add Username</h3>
                            <button className={styles.closeBtn} onClick={() => setIsUsernameModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); setIsUsernameModalOpen(false); }}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label>Username</label>
                                    <input type="text" placeholder="Enter new username" required style={{ width: '100%', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setIsUsernameModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isCreditCardModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsCreditCardModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Add Credit Card</h3>
                            <button className={styles.closeBtn} onClick={() => setIsCreditCardModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); setIsCreditCardModalOpen(false); }}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label>Card Number</label>
                                    <input type="text" placeholder="XXXX XXXX XXXX XXXX" required style={{ width: '100%', boxSizing: 'border-box', marginBottom: '1rem' }} />
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <label>Expiry Date</label>
                                            <input type="text" placeholder="MM/YY" required style={{ width: '100%', boxSizing: 'border-box' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label>CVV</label>
                                            <input type="text" placeholder="123" required style={{ width: '100%', boxSizing: 'border-box' }} />
                                        </div>
                                    </div>
                                    <label>Card Holder Name</label>
                                    <input type="text" placeholder="Card Holder Name" required style={{ width: '100%', boxSizing: 'border-box', marginBottom: '1rem' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setIsCreditCardModalOpen(false)}>Cancel</button>
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

            {isAddressModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsAddressModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Add Address</h3>
                            <button className={styles.closeBtn} onClick={() => setIsAddressModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); setIsAddressModalOpen(false); }}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label>Address</label>
                                    <input type="text" placeholder="wilaya,street name,apartment" required style={{ width: '100%', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div className={styles.formGroup} style={{ flex: 1 }}>
                                        <label for="wilaya">Choose Wilaya:</label>

                                        <select name="wilaya" id="wilaya">
                                            <option value="">Algiers</option>
                                            <option value="">Annaba</option>
                                            <option value="">Oran</option>
                                            <option value="">Constantine</option>
                                            <option value="">Setif</option>
                                            <option value="">Biskra</option>
                                            <option value="">Blida</option>
                                            <option value="">Tlemcen</option>
                                            <option value="">El Bayadh</option>
                                            <option value="">Jijel</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setIsAddressModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
