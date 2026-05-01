import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProfilePage.module.css";
import { useWishlist } from "../context/WishlistContext";
import { Trash2, Eye, EyeOff, Camera } from "lucide-react";
import { userData } from "three/tsl";

// ip address
const API = "http://192.168.1.6:8080";

const Logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("loggedin");
  localStorage.removeItem("userName");
  localStorage.removeItem("userImage");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userId");
  localStorage.removeItem("shipping");
  localStorage.removeItem("userPassword");
  localStorage.setItem("loggedin", "false");
  window.location.href = "/login";
};

const ProfilePage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("settings");
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

  const [showPasswordText, setShowPasswordText] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newplace, setNewplace] = useState("");
  const [newaddress, setNewaddress] = useState("");
  const [newShipping, setNewShipping] = useState("");

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
    updateimage(file);
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

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

// ===============================
// UPDATE USERNAME
// ===============================
const updateusername = async () => {
  try {
    const res = await fetch(`${API}/api/users/update/name/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userName: newName,
      }),
    });

    if (!res.ok) throw new Error();

    const data = await res.json();

    localStorage.setItem("userName", data.userName);

    setIsUsernameModalOpen(false);

  } catch (err) {
    alert("Failed to update username");
  }
};

// ===============================
// UPDATE EMAIL
// (uses full update endpoint)
// ===============================
const updateemail = async () => {
  setIsPhoneModalOpen(true);
  try {
    // 1. send verification code first
    const codeRes = await fetch(`${API}/api/users/emailcode/${userId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!codeRes.ok) throw new Error("Failed to send code");
  } catch (err) {
    alert("Failed to send code");
  }
};

// ===============================
// UPDATE PASSWORD
// ===============================
const updatepassword = async () => {
  setIsPasswordModalOpen(true);
  try {
    // 1. send verification code first
    const codeRes = await fetch(`${API}/api/users/passwordcode/${userId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!codeRes.ok) throw new Error("Failed to send code");
  } catch (err) {
    alert("Failed to send code");
  }
};

// ===============================
// UPDATE SHIPPING
// ===============================
const updateshipping = async () => {
  try {
    const res = await fetch(`${API}/api/users/update/shipping/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipping: `${newaddress}` + " "+ `${newplace}`,
      }),
    });

    if (!res.ok) throw new Error();

    const data = await res.json();

    localStorage.setItem("shipping", data.shipping);

    setIsAddressModalOpen(false);

  } catch (err) {
    alert("Failed to update shipping");
  }
};

// ===============================
// UPDATE IMAGE
// ===============================
const updateimage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API}/api/users/update/image/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) throw new Error();

    const data = await res.json();

    localStorage.setItem("userImage", data.userImage);
    console.log(data.userImage);

  } catch (err) {
    alert("Failed to update image");
  }
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
                src={localStorage.getItem("userImage")}
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
                activeTab === "settings" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("settings")}
            >
              <i className="fas fa-cog"></i> Information
            </li>

            <li
              className={`${styles.tabItem} ${
                activeTab === "orders" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("orders")}
            >
              <i className="fas fa-box"></i> Orders
            </li>

            <li
              className={`${styles.tabItem} ${
                activeTab === "wishlist" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("wishlist")}
            >
              <i className="fas fa-heart"></i> Wishlist
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

          {/* SETTINGS PANEL */}
          {activeTab === "settings" && (
            <div className={styles.tabPanel}>
              <h2>Account Information</h2>
              <div className={styles.settingsForm}>
                
                {/* Username Row */}
                <div className={styles.formGroup}>
                  <label>Username:</label>
                  <div className={styles.infoRow}>
                    <p>{localStorage.getItem("userName")}</p>
                    <button className="btn-secondary" onClick={() => setIsUsernameModalOpen(true)}>Change</button>
                  </div>
                </div>

                {/* Email Row */}
                <div className={styles.formGroup}>
                  <label>Email:</label>
                  <div className={styles.infoRow}>
                    <p>{localStorage.getItem("userEmail")}</p>
                    <button className="btn-secondary" onClick={updateemail}>Change</button>
                  </div>
                </div>

                {/* Password Row with Show/Hide */}
                <div className={styles.formGroup}>
                  <label>Password:</label>
                  <div className={styles.infoRow}>
                    <div className={styles.grid}>
                    <p>
                      {showPasswordText 
                        ? localStorage.getItem("userPassword") 
                        : "••••••••••••"}
                    </p>
                    <button 
                        type="button" 
                        className={styles.iconBtn} 
                        onClick={() => setShowPasswordText(!showPasswordText)}
                      >
                        {showPasswordText ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      </div>
                    <div className={styles.actionGroup}>
                      <button className="btn-secondary" onClick={ updatepassword}>Change</button>
                    </div>
                  </div>
                </div>

                {/* Shipping Row */}
                <div className={styles.formGroup}>
                  <label>Shipping Address:</label>
                  <div className={styles.infoRow}>
                    <p>{localStorage.getItem("shipping") || "Not set"}</p>
                    <button className="btn-secondary" onClick={() => setIsAddressModalOpen(true)}>Change</button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </main>
      </div>
      {/* Email MODAL */}
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
              <h3>Change Email</h3>

              <button
                className={styles.closeBtn}
                onClick={() => setIsPhoneModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <p style={{ textAlign: "center", lineHeight: "1.6" }}>
                We sent a verification email to your inbox.<br />
                Please check your email and use the link and code to continue changing your email.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* USERNAME MODAL */}
      {isUsernameModalOpen && (
        <div className={styles.modalOverlay}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
            <h3>Change Username</h3>

            <button
                className={styles.closeBtn}
                onClick={() => setIsUsernameModalOpen(false)}
              >
                ×
              </button>
              </div>
            <div className={styles.modalBody}>
            <input 
              type="text" 
              placeholder="New Username" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
            />
            <button className="btn-primary" onClick={updateusername}>Save Changes</button>
            <button className="btn-secondary" onClick={() => setIsUsernameModalOpen(false)}>Cancel</button>
            </div>
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

            <div className={styles.modalBody}>
              <p style={{ textAlign: "center", lineHeight: "1.6" }}>
                We sent a verification email to your inbox.<br />
                Please check your email and use the link and code to continue changing your password.
              </p>
            </div>
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
              <h3>Change Address</h3>

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
                updateshipping();
              }}
            >
              <div className={styles.modalBody}>
                <input
                  value={newaddress}
                  type="text"
                  placeholder="Street / Apartment"
                  required
                  onChange={(e) => setNewaddress(e.target.value)}
                />

                <select
                  value={newplace}
                  onChange={(e) => setNewplace(e.target.value)}
                >
                  <option value="Algiers">Algiers</option>
                  <option value="Setif">Setif</option>
                  <option value="Oran">Oran</option>
                  <option value="Constantine">Constantine</option>
                  <option value="Annaba">Annaba</option>
                </select>
              </div>

              <button type="submit" className="btn-primary">
                Save
              </button>
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

