import React, { useState, useEffect, useMemo } from "react";
import { X, Package, AlertTriangle, RefreshCw } from "lucide-react";
import { API, myFetch, logAction } from "../../../api";
import styles from "./OrdersManagerView.module.css";

const STATUSES = ["Pending", "Delivered", "Canceled"];

const OrdersManagerView = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusChange, setStatusChange] = useState(null); // { order, newStatus }
  const [updating, setUpdating] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [searchUser, setSearchUser] = useState("");

  const token = localStorage.getItem("token");

  const loadData = async () => {
    setLoading(true);
    try {
      const [oRes, uRes] = await Promise.all([
        myFetch(`${API}/api/orders/getall`, { headers: { Authorization: `Bearer ${token}` } }),
        myFetch(`${API}/api/users/get`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const oData = oRes.ok ? await oRes.json() : [];
      const uData = uRes.ok ? await uRes.json() : [];

      // Flatten each Orders.orderItems[] into a single list
      const flat = [];
      (oData || []).forEach(o => (o.orderItems || []).forEach(item => flat.push(item)));
      setOrders(flat);
      setUsers(uData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const userMap = useMemo(() => {
    const m = {};
    users.forEach(u => { m[u.userId] = u; });
    return m;
  }, [users]);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (statusFilter !== "All") {
      list = list.filter(o => {
        const s = (o.status || o.Status || "").toLowerCase();
        return s === statusFilter.toLowerCase();
      });
    }
    if (searchUser.trim()) {
      const q = searchUser.trim().toLowerCase();
      list = list.filter(o => {
        const u = userMap[o.userId];
        return u && (
          u.userName?.toLowerCase().includes(q) ||
          u.userEmail?.toLowerCase().includes(q) ||
          String(o.oItemId).includes(q)
        );
      });
    }
    list.sort((a, b) => {
      const da = new Date(a.orderDate).getTime();
      const db = new Date(b.orderDate).getTime();
      return sortOrder === "Newest" ? db - da : da - db;
    });
    return list;
  }, [orders, statusFilter, sortOrder, searchUser, userMap]);

  const counts = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => (o.status || o.Status) === "Pending").length,
    delivered: orders.filter(o => (o.status || o.Status) === "Delivered").length,
    canceled: orders.filter(o => {
      const s = (o.status || o.Status || "").toLowerCase();
      return s === "canceled" || s === "cancelled";
    }).length,
  }), [orders]);

  const statusClass = (s) => {
    const lc = (s || "").toLowerCase();
    if (lc === "pending") return styles.badgePending;
    if (lc === "delivered") return styles.badgeDelivered;
    if (lc === "canceled" || lc === "cancelled") return styles.badgeCanceled;
    return "";
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString();
  };

  const openStatusChange = (order, newStatus) => {
    if ((order.status || order.Status) === newStatus) return;
    setStatusChange({ order, newStatus });
  };

  const confirmStatusChange = async () => {
    if (!statusChange) return;
    setUpdating(true);
    const { order, newStatus } = statusChange;

    try {
      let res;
      if (newStatus.toLowerCase() === "canceled" || newStatus.toLowerCase() === "cancelled") {
        // Use cancel endpoint — restores stock + decrements pSold
        res = await myFetch(`${API}/api/orders/cancel/${order.oItemId}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        res = await myFetch(`${API}/api/orders/update/status/${order.oItemId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });
      }

      if (!res.ok) {
        alert("Failed to update status: " + (await res.text()));
        return;
      }

      logAction(
        "ORDER_STATUS_CHANGED",
        `Order #${order.oItemId} → ${newStatus} (user #${order.userId})`
      );

      setStatusChange(null);
      setSelectedOrder(null);
      await loadData();
    } catch (e) {
      console.error(e);
      alert("Status change failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading orders...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.headerBar}>
        <div>
          <h2 className={styles.title}>Orders</h2>
          <p className={styles.subtitle}>Manage status and refunds across all customer orders</p>
        </div>
        <button className={styles.refreshBtn} onClick={loadData}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span>Total</span>
          <strong>{counts.total}</strong>
        </div>
        <div className={`${styles.statCard} ${styles.statPending}`}>
          <span>Pending</span>
          <strong>{counts.pending}</strong>
        </div>
        <div className={`${styles.statCard} ${styles.statDelivered}`}>
          <span>Delivered</span>
          <strong>{counts.delivered}</strong>
        </div>
        <div className={`${styles.statCard} ${styles.statCanceled}`}>
          <span>Canceled</span>
          <strong>{counts.canceled}</strong>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          placeholder="Search by user name, email, or order #"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="Newest">Newest first</option>
          <option value="Oldest">Oldest first</option>
        </select>
      </div>

      {/* List */}
      <div className={styles.list}>
        {filtered.length === 0 ? (
          <p className={styles.empty}>No orders match this filter.</p>
        ) : filtered.map(order => {
          const status = order.status || order.Status || "Pending";
          const user = userMap[order.userId];
          return (
            <div
              key={order.oItemId}
              className={styles.row}
              onClick={() => setSelectedOrder(order)}
            >
              <div className={styles.rowLeft}>
                <span className={styles.orderId}>#{order.oItemId}</span>
                <span className={styles.userName}>
                  {user ? user.userName : `User #${order.userId}`}
                </span>
                <span className={styles.userEmail}>
                  {user?.userEmail || ""}
                </span>
              </div>
              <div className={styles.rowRight}>
                <span className={styles.orderPrice}>{order.price} DZD</span>
                <span className={styles.orderDate}>{formatDate(order.orderDate)}</span>
                <span className={`${styles.statusBadge} ${statusClass(status)}`}>{status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order details modal */}
      {selectedOrder && (
        <div className={styles.overlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Order #{selectedOrder.oItemId}</h3>
              <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <strong>Customer</strong>
                <span>
                  {userMap[selectedOrder.userId]?.userName || "—"}<br/>
                  <small>{userMap[selectedOrder.userId]?.userEmail || ""}</small><br/>
                  <small>Address: {userMap[selectedOrder.userId]?.shipping || "—"}</small>
                </span>
              </div>
              <div className={styles.detailRow}>
                <strong>Date</strong>
                <span>{formatDate(selectedOrder.orderDate)}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Items</strong>
                <div className={styles.itemList}>
                  {selectedOrder.Items?.map(it => (
                    <div key={it.id} className={styles.itemRow}>
                      <span>{it.name} × {it.quantity}</span>
                      <span>{(it.price * it.quantity).toFixed(2)} DZD</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.totalRow}>
                <span>Total</span>
                <strong>{selectedOrder.price} DZD</strong>
              </div>

              <div className={styles.statusSection}>
                <strong>Current status</strong>
                <div className={styles.statusButtons}>
                  {STATUSES.map(s => {
                    const isActive = (selectedOrder.status || selectedOrder.Status) === s;
                    return (
                      <button
                        key={s}
                        disabled={isActive}
                        className={`${styles.statusBtn} ${isActive ? styles.statusBtnActive : ''} ${statusClass(s)}`}
                        onClick={() => openStatusChange(selectedOrder, s)}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status change confirmation popup */}
      {statusChange && (
        <div className={styles.overlay} onClick={() => !updating && setStatusChange(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmIcon}>
              <AlertTriangle size={32} />
            </div>
            <h3>Change order #{statusChange.order.oItemId} to {statusChange.newStatus}?</h3>
            <p className={styles.confirmText}>
              From <strong>{statusChange.order.status || statusChange.order.Status}</strong> →{" "}
              <strong>{statusChange.newStatus}</strong>
            </p>

            {(statusChange.newStatus.toLowerCase() === "canceled" ||
              statusChange.newStatus.toLowerCase() === "cancelled") && (
              <div className={styles.refundWarning}>
                <strong>This will:</strong>
                <ul>
                  <li>Restore product stock</li>
                  <li>Decrement the sold counter</li>
                  <li>Mark the order as canceled</li>
                </ul>
                <p className={styles.refundNote}>
                  If this order was paid by card, you'll also need to issue the refund
                  manually from the Chargily dashboard. Cash-on-delivery orders need no
                  further action.
                </p>
              </div>
            )}

            <div className={styles.confirmActions}>
              <button
                className={styles.cancelBtn}
                disabled={updating}
                onClick={() => setStatusChange(null)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmBtn}
                disabled={updating}
                onClick={confirmStatusChange}
              >
                {updating ? "Updating..." : "Confirm change"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagerView;