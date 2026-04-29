import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css';
import { useWishlist } from '../context/WishlistContext';

const Logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedin");
    localStorage.removeItem("userName");
    localStorage.removeItem("userImage");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.setItem("loggedin", "false");
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

    const [showPopup, setShowPopup] = useState(false);
    const [popupTargetId, setPopupTargetId] = useState(null);
    const [popupTitle, setPopupTitle] = useState('');
    const [popupMessage, setPopupMessage] = useState('');
    const [popupMode, setPopupMode] = useState('ok'); // ok | login | remove
    
    const { wishlistItems, removeFromWishlist, fetchWishlist } = useWishlist();
    
    useEffect(() => {
        fetchWishlist();
    }, []);
    
    const [cart, setCart] = useState(null);
    const [cartLoading, setCartLoading] = useState(false);

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
                        <div className={styles.avatar} style={{ background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '3rem' }}>
                            <img className={styles.avatar} src={localStorage.getItem("userImage")} alt="failed to load image" />
                        </div>
                    </div>
                    <div className={styles.userInfo}>
                        <h1 className={styles.userName}>{localStorage.getItem("userName")}</h1>
                        <p className={styles.userEmail}>{localStorage.getItem("userEmail")}</p>
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
                                    <button className="btn-primary" onClick={() => navigate('/shop')}>
                                        Explore Shop
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.wishlistGrid}>
                                    {wishlistItems.map(item => (
                                        <div
                                            key={item.id}
                                            className={styles.wishlistCard}
                                            onClick={() => navigate(`/product/${item.name}`)}
                                        >

                                            <img
                                                src={item.image}
                                                alt={item.name}
                                            />

                                            <div>
                                                <h4>{item.name}</h4>
                                                <p className={styles.orderPrice}>
                                                    {item.price} DZD
                                                </p>
                                            </div>

                                            <button
                                                className={styles.removeBtn}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPopupTargetId(item.id);
                                                    setShowPopup(true);
                                                    setPopupTitle("Remove item?");
                                                    setPopupMessage("Are you sure you want to remove this item?");
                                                    setPopupMode("remove");
                                                }}
                                            >
                                                <Trash2 size={16} />
                                                Remove
                                            </button>

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
            {showPopup && (
  <div className={styles.popupOverlay}>
    <div className={styles.popupCard}>

      <h2 className={styles.popupTitle}>{popupTitle}</h2>
      <p className={styles.popupText}>{popupMessage}</p>

      {popupMode === 'remove' && (
        <div className={styles.popupActions}>
          <button
            className={styles.confirmBtn}
            onClick={() => {
              removeFromWishlist(popupTargetId);
              setShowPopup(false);
            }}
          >
            Remove
          </button>

          <button
            className={styles.cancelBtn}
            onClick={() => setShowPopup(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {popupMode === 'ok' && (
        <div className={styles.popupActionsSingle}>
          <button
            className={styles.okBtn}
            onClick={() => setShowPopup(false)}
          >
            OK
          </button>
        </div>
      )}

    </div>
  </div>
)}
        </div>
    );
};

export default ProfilePage;