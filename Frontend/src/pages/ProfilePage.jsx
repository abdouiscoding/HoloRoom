import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProfilePage.module.css";
import { useWishlist } from "../context/WishlistContext";
import { useOrders } from "../context/OrdersContext";
import { Trash2, Eye, EyeOff, X } from "lucide-react";
import { API, myFetch } from "../api";

const Logout = () => {
  localStorage.clear();
  localStorage.setItem("loggedin", "false");
  window.location.href = "/login";
};

const ProfilePage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("settings");

  // Order details popup
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("Newest");

  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("userImage")
  );

  // Shared popup (used for wishlist remove AND order cancel)
  const [showPopup, setShowPopup] = useState(false);
  const [popupTargetId, setPopupTargetId] = useState(null);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [popupMode, setPopupMode] = useState("ok"); // "remove" | "cancel"

  const { wishlistItems, removeFromWishlist, fetchWishlist } = useWishlist();
  const { orders, loading: ordersLoading, fetchOrders, cancelOrder } = useOrders();

  const [showPasswordText, setShowPasswordText] = useState(false);
  const [newName, setNewName] = useState("");
  const [newplace, setNewplace] = useState("Algiers");
  const [newaddress, setNewaddress] = useState("");
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setIsUser(role === "USER" || role === null);
  }, []);

  useEffect(() => {
    fetchWishlist();
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===============================
  // Derived: filtered + sorted orders
  // ===============================
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (statusFilter !== "All") {
      list = list.filter((o) => {
        const s = (o.status || o.Status || "").toLowerCase();
        return s === statusFilter.toLowerCase();
      });
    }

    list.sort((a, b) => {
      const da = new Date(a.orderDate).getTime();
      const db = new Date(b.orderDate).getTime();
      return dateFilter === "Newest" ? db - da : da - db;
    });

    return list;
  }, [orders, statusFilter, dateFilter]);

  // ===============================
  // Derived: total spending across ALL orders (not filtered)
  // ===============================
  const totalSpending = useMemo(
    () => orders.reduce((sum, o) => sum + (o.price || 0), 0),
    [orders]
  );

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
    updateimage(file);
  };

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // ---- (your existing username/email/password/shipping/image handlers, unchanged) ----
  const updateusername = async () => {
    try {
      const res = await myFetch(`${API}/api/users/update/name/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userName: newName }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      localStorage.setItem("userName", data.userName);
      setIsUsernameModalOpen(false);
    } catch {
      alert("Failed to update username");
    }
  };

  const updateemail = async () => {
    setIsPhoneModalOpen(true);
    try {
      const codeRes = await myFetch(`${API}/api/users/emailcode/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!codeRes.ok) throw new Error();
    } catch {
      alert("Failed to send code");
    }
  };

  const updatepassword = async () => {
    setIsPasswordModalOpen(true);
    try {
      const codeRes = await myFetch(`${API}/api/users/passwordcode/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!codeRes.ok) throw new Error();
    } catch {
      alert("Failed to send code");
    }
  };

  const updateshipping = async () => {
    try {
      const res = await myFetch(`${API}/api/users/update/shipping/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shipping: `${newaddress} ${newplace}` }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      localStorage.setItem("shipping", data.shipping);
      setIsAddressModalOpen(false);
    } catch {
      alert("Failed to update shipping");
    }
  };

  const updateimage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await myFetch(`${API}/api/users/update/image/${userId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to update image");
      const data = await res.json();
      setProfileImage(data.userImage);
      localStorage.setItem("userImage", data.userImage);
    } catch (err) {
      alert(err.message || "Failed to update image");
    }
  };

  const role = localStorage.getItem("role");
  const dashboardbtn = () => {
    if (role === "ADMIN" || role === "PRODUCT_MANAGER" || role === "MARKETING_MANAGER") {
      navigate("/dashboard");
    }
  };

  // ===============================
  // Popup confirm dispatcher
  // ===============================
  const handlePopupConfirm = async () => {
    if (popupMode === "remove") {
      removeFromWishlist(popupTargetId);
    } else if (popupMode === "cancel") {
      await cancelOrder(popupTargetId);
    }
    setShowPopup(false);
    setPopupTargetId(null);
  };

  const openCancelConfirm = (e, orderItemId) => {
    e.stopPropagation();
    setPopupTargetId(orderItemId);
    setPopupTitle("Cancel order?");
    setPopupMessage("Are you sure you want to cancel this order? This cannot be undone.");
    setPopupMode("cancel");
    setShowPopup(true);
  };

  const statusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "pending") return styles.statusPending;
    if (s === "canceled" || s === "cancelled") return styles.statusCanceled;
    if (s === "delivered") return styles.statusDelivered;
    return "";
  };

  return (
    <div className={styles.profileContainer}>
      {/* HEADER (unchanged) */}
      <div className={styles.headerGlass}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <img className={styles.avatar} src={profileImage} alt="Profile" />
            </div>
            <label htmlFor="avatarUpload" className={styles.editAvatarBtn} style={{ cursor: "pointer" }}>
              <i className="fas fa-camera"></i>
            </label>
            <input type="file" id="avatarUpload" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
          </div>
          <div className={styles.userInfo}>
            <h1 className={styles.userName}>{localStorage.getItem("userName")}</h1>
            <p className={styles.userEmail}>{localStorage.getItem("userEmail")}</p>
          </div>
          {!isUser && (
            <button className="btn-primary" onClick={dashboardbtn}>Dashboard</button>
          )}
          <div className={styles.profileActions}>
            <button className="btn-secondary" onClick={Logout}>Log Out</button>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className={styles.contentLayout}>
        {/* SIDEBAR (unchanged) */}
        <aside className={styles.sidebar}>
          <ul className={styles.tabList}>
            <li className={`${styles.tabItem} ${activeTab === "settings" ? styles.active : ""}`} onClick={() => setActiveTab("settings")}>
              <i className="fas fa-cog"></i> Information
            </li>
            <li className={`${styles.tabItem} ${activeTab === "orders" ? styles.active : ""}`} onClick={() => setActiveTab("orders")}>
              <i className="fas fa-box"></i> Orders
            </li>
            <li className={`${styles.tabItem} ${activeTab === "wishlist" ? styles.active : ""}`} onClick={() => setActiveTab("wishlist")}>
              <i className="fas fa-heart"></i> Wishlist
            </li>
          </ul>
        </aside>

        <main className={styles.mainContent}>
          {/* ORDERS */}
          {activeTab === "orders" && (
            <div className={styles.tabPanel}>
              {/* Top bar: total spending + filters */}
              <div className={styles.ordersTopBar}>
                <div className={styles.filtersGroup}>
                  <select
                    className={styles.filterSelect}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Canceled">Canceled</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  <select
                    className={styles.filterSelect}
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="Newest">Newest first</option>
                    <option value="Oldest">Oldest first</option>
                  </select>
                </div>
                <div className={styles.totalSpending}>
                  <span>Total Spending</span>
                  <strong>{totalSpending.toFixed(2)} DZD</strong>
                </div>
              </div>

              {ordersLoading ? (
                <div className={styles.emptyState}><p>Loading orders...</p></div>
              ) : filteredOrders.length === 0 ? (
                <div className={styles.emptyState}>
                  <i className="fas fa-box-open"></i>
                  <p>No orders match this filter.</p>
                  <button className="btn-primary" onClick={() => navigate("/shop")}>Start Shopping</button>
                </div>
              ) : (
                <div className={styles.ordersList}>
                  {filteredOrders.map((order) => {
                    const status = order.status || order.Status || "Pending";
                    const isPending = status.toLowerCase() === "pending";
                    return (
                      <div
                        key={order.oItemId}
                        className={styles.orderCard}
                        onClick={() => setSelectedOrder(order)}
                      >
                        {/* Left: date */}
                        <div className={styles.orderLeft}>
                          <span className={styles.orderDate}>
                            {new Date(order.orderDate).toLocaleDateString()}
                          </span>
                          <span className={styles.orderIdSmall}>#{order.oItemId}</span>
                        </div>

                        {/* Right: price + status (+ cancel if pending) */}
                        <div className={styles.orderRight}>
                          <span className={styles.orderPrice}>{order.price} DZD</span>
                          <span className={`${styles.orderStatus} ${statusClass(status)}`}>
                            {status}
                          </span>
                          {isPending && (
                            <button
                              className={styles.cancelOrderBtn}
                              onClick={(e) => openCancelConfirm(e, order.oItemId)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST (unchanged) */}
          {activeTab === "wishlist" && (
            <div className={styles.tabPanel}>
              <h2>My Wishlist</h2>
              {wishlistItems.length === 0 ? (
                <div className={styles.emptyState}>
                  <i className="fas fa-heart-broken"></i>
                  <p>Your wishlist is empty.</p>
                  <button className="btn-primary" onClick={() => navigate("/shop")}>Explore Shop</button>
                </div>
              ) : (
                <div className={styles.wishlistGrid}>
                  {wishlistItems.map((item) => (
                    <div key={item.id} className={styles.wishlistCard} onClick={() => navigate(`/product/${item.name}`)}>
                      <img src={item.image} alt={item.name} />
                      <div>
                        <h4>{item.name}</h4>
                        <p className={styles.orderPrice}>{item.price} DZD</p>
                      </div>
                      <button
                        className={styles.removeBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPopupTargetId(item.id);
                          setPopupTitle("Remove item?");
                          setPopupMessage("Are you sure you want to remove this item?");
                          setPopupMode("remove");
                          setShowPopup(true);
                        }}
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS (unchanged) */}
          {activeTab === "settings" && (
            <div className={styles.tabPanel}>
              <h2>Account Information</h2>
              <div className={styles.settingsForm}>
                <div className={styles.formGroup}>
                  <label>Username:</label>
                  <div className={styles.infoRow}>
                    <p>{localStorage.getItem("userName")}</p>
                    <button className="btn-secondary" onClick={() => setIsUsernameModalOpen(true)}>Change</button>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Email:</label>
                  <div className={styles.infoRow}>
                    <p>{localStorage.getItem("userEmail")}</p>
                    <button className="btn-secondary" onClick={updateemail}>Change</button>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Password:</label>
                  <div className={styles.infoRow}>
                    <div className={styles.grid}>
                      <p>{showPasswordText ? localStorage.getItem("userPassword") : "••••••••••••"}</p>
                      <button type="button" className={styles.iconBtn} onClick={() => setShowPasswordText(!showPasswordText)}>
                        {showPasswordText ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <div className={styles.actionGroup}>
                      <button className="btn-secondary" onClick={updatepassword}>Change</button>
                    </div>
                  </div>
                </div>
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

      {/* ORDER DETAILS POPUP */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Order #{selectedOrder.oItemId}</h3>
              <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.orderDate}>
                {new Date(selectedOrder.orderDate).toLocaleDateString()} · {selectedOrder.status || selectedOrder.Status}
              </p>

              <div className={styles.detailsItemsList}>
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className={styles.detailsItemRow}>
                    <div className={styles.detailsItemName}>
                      <strong>{item.name}</strong>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <div className={styles.detailsItemPrice}>
                      {(item.price * item.quantity).toFixed(2)} DZD
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.detailsTotal}>
                <span>Total</span>
                <strong>{selectedOrder.price} DZD</strong>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* SHARED CONFIRMATION POPUP (wishlist remove + order cancel) */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupCard}>
            <h2 className={styles.popupTitle}>{popupTitle}</h2>
            <p className={styles.popupText}>{popupMessage}</p>
            <div className={styles.popupActions}>
              <button className={styles.confirmBtn} onClick={handlePopupConfirm}>
                {popupMode === "cancel" ? "Cancel Order" : "Remove"}
              </button>
              <button className={styles.cancelBtn} onClick={() => setShowPopup(false)}>
                Keep
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;