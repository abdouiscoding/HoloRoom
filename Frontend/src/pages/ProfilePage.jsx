import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./ProfilePage.module.css";
import { useWishlist } from "../context/WishlistContext";

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
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("orders");
  const [selectedTrackOrder, setSelectedTrackOrder] = useState(null);

  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isCreditCardModalOpen, setIsCreditCardModalOpen] = useState(false);

  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("userImage")
  );

  const [showPopup, setShowPopup] = useState(false);
  const [popupTargetId, setPopupTargetId] = useState(null);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [popupMode, setPopupMode] = useState("ok");

  const { wishlistItems, removeFromWishlist, fetchWishlist } = useWishlist();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfileImage(reader.result);
      localStorage.setItem("userImage", reader.result);
    };

    reader.readAsDataURL(file);
  };

  const getStatusClass = (step) => {
    if (!selectedTrackOrder) return "";

    const statusOrder = ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED"];

    const currentStatus = selectedTrackOrder.status || "PLACED";
    const currentIdx = statusOrder.indexOf(currentStatus.toUpperCase());
    const stepIdx = statusOrder.indexOf(step);

    if (stepIdx < currentIdx) return styles.completed;
    if (stepIdx === currentIdx && step === "DELIVERED")
      return styles.completed;
    if (stepIdx === currentIdx) return styles.active;

    return "";
  };

  return (
    <div className={styles.profileContainer}>
      {/* HEADER */}
      <div className={styles.headerGlass}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <img
                className={styles.avatar}
                src={profileImage}
                alt="Profile"
              />
            </div>

            <label
              htmlFor="avatarUpload"
              className={styles.editAvatarBtn}
              style={{ cursor: "pointer" }}
            >
              <i className="fas fa-camera"></i>
            </label>

            <input
              type="file"
              id="avatarUpload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
          </div>

          <div className={styles.userInfo}>
            <h1 className={styles.userName}>
              {localStorage.getItem("userName")}
            </h1>

            <p className={styles.userEmail}>
              {localStorage.getItem("userEmail")}
            </p>
          </div>

          <div className={styles.profileActions}>
            <button className="btn-secondary" onClick={Logout}>
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className={styles.contentLayout}>
        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <ul className={styles.tabList}>
            <li
              className={`${styles.tabItem} ${
                activeTab === "orders" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("orders")}
            >
              <i className="fas fa-box"></i> My Orders
            </li>

            <li
              className={`${styles.tabItem} ${
                activeTab === "wishlist" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("wishlist")}
            >
              <i className="fas fa-heart"></i> Wishlist
            </li>

            <li
              className={`${styles.tabItem} ${
                activeTab === "settings" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("settings")}
            >
              <i className="fas fa-cog"></i> Information
            </li>

            <li
              className={`${styles.tabItem} ${
                activeTab === "cards" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("cards")}
            >
              <i className="fas fa-credit-card"></i> Payment Methods
            </li>
          </ul>
        </aside>

        {/* MAIN */}
        <main className={styles.mainContent}>
          {/* ORDERS */}
          {activeTab === "orders" && (
            <div className={styles.tabPanel}>
              <h2>Recent Orders</h2>

              <div className={styles.emptyState}>
                <i className="fas fa-box-open"></i>
                <p>You haven't placed any orders yet.</p>

                <button
                  className="btn-primary"
                  onClick={() => navigate("/shop")}
                >
                  Start Shopping
                </button>
              </div>
            </div>
          )}

          {/* WISHLIST */}
          {activeTab === "wishlist" && (
            <div className={styles.tabPanel}>
              <h2>My Wishlist</h2>

              {wishlistItems.length === 0 ? (
                <div className={styles.emptyState}>
                  <i className="fas fa-heart-broken"></i>
                  <p>Your wishlist is empty.</p>

                  <button
                    className="btn-primary"
                    onClick={() => navigate("/shop")}
                  >
                    Explore Shop
                  </button>
                </div>
              ) : (
                <div className={styles.wishlistGrid}>
                  {wishlistItems.map((item) => (
                    <div
                      key={item.id}
                      className={styles.wishlistCard}
                      onClick={() => navigate(`/product/${item.name}`)}
                    >
                      <img src={item.image} alt={item.name} />

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
                          setPopupTitle("Remove item?");
                          setPopupMessage(
                            "Are you sure you want to remove this item?"
                          );
                          setPopupMode("remove");
                          setShowPopup(true);
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

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div className={styles.tabPanel}>
              <h2>Account information</h2>

              <form className={styles.settingsForm}>
                <div className={styles.formGroup}>
                  <label>Username</label>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsUsernameModalOpen(true)}
                  >
                    Edit Username
                  </button>
                </div>

                <div className={styles.formGroup}>
                  <label>Phone Number</label>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsPhoneModalOpen(true)}
                  >
                    Add Phone Number
                  </button>
                </div>

                <div className={styles.formGroup}>
                  <label>Shipping Address</label>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsAddressModalOpen(true)}
                  >
                    Add Address
                  </button>
                </div>

                <div className={styles.formGroup}>
                  <label>Password</label>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CARDS */}
          {activeTab === "cards" && (
            <div className={styles.tabPanel}>
              <h2>Payment Methods</h2>

              <button
                className="btn-primary"
                onClick={() => setIsCreditCardModalOpen(true)}
              >
                Add New Card
              </button>
            </div>
          )}
        </main>
      </div>

      {/* PHONE MODAL */}
      {isPhoneModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsPhoneModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Add Phone Number</h3>

              <button
                className={styles.closeBtn}
                onClick={() => setIsPhoneModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsPhoneModalOpen(false);
              }}
            >
              <div className={styles.modalBody}>
                <input
                  type="tel"
                  placeholder="+213 555 555 555"
                  required
                />
              </div>

              <button className="btn-primary">Save</button>
            </form>
          </div>
        </div>
      )}

      {/* USERNAME MODAL */}
      {isUsernameModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsUsernameModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Edit Username</h3>

              <button
                className={styles.closeBtn}
                onClick={() => setIsUsernameModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsUsernameModalOpen(false);
              }}
            >
              <div className={styles.modalBody}>
                <input type="text" placeholder="New username" required />
              </div>

              <button className="btn-primary">Save</button>
            </form>
          </div>
        </div>
      )}

      {/* PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsPasswordModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Change Password</h3>

              <button
                className={styles.closeBtn}
                onClick={() => setIsPasswordModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsPasswordModalOpen(false);
              }}
            >
              <div className={styles.modalBody}>
                <input type="password" placeholder="Current password" required />
                <input type="password" placeholder="New password" required />
                <input
                  type="password"
                  placeholder="Confirm password"
                  required
                />
              </div>

              <button className="btn-primary">Update</button>
            </form>
          </div>
        </div>
      )}

      {/* ADDRESS MODAL */}
      {isAddressModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsAddressModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Add Address</h3>

              <button
                className={styles.closeBtn}
                onClick={() => setIsAddressModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsAddressModalOpen(false);
              }}
            >
              <div className={styles.modalBody}>
                <input
                  type="text"
                  placeholder="Street / Apartment"
                  required
                />

                <select>
                  <option>Algiers</option>
                  <option>Setif</option>
                  <option>Oran</option>
                  <option>Constantine</option>
                  <option>Annaba</option>
                </select>
              </div>

              <button className="btn-primary">Save</button>
            </form>
          </div>
        </div>
      )}

      {/* CARD MODAL */}
      {isCreditCardModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsCreditCardModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Add Credit Card</h3>

              <button
                className={styles.closeBtn}
                onClick={() => setIsCreditCardModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsCreditCardModalOpen(false);
              }}
            >
              <div className={styles.modalBody}>
                <input
                  type="text"
                  placeholder="Card Number"
                  required
                />

                <input
                  type="text"
                  placeholder="Expiry MM/YY"
                  required
                />

                <input type="text" placeholder="CVV" required />

                <input
                  type="text"
                  placeholder="Card Holder Name"
                  required
                />
              </div>

              <button className="btn-primary">Save Card</button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupCard}>
            <h2 className={styles.popupTitle}>{popupTitle}</h2>

            <p className={styles.popupText}>{popupMessage}</p>

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
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;