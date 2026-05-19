import React, { useState, useEffect, useMemo } from "react";
import { X, ClipboardList, Users as UsersIcon } from "lucide-react";
import { API, myFetch } from "../../../api";
import styles from "./LogsView.module.css";

const LogsView = () => {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState("logs");           // "logs" | "users"
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [actionFilter, setActionFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      try {
        const [lRes, uRes] = await Promise.all([
          myFetch(`${API}/api/logs/all`, { headers: { Authorization: `Bearer ${token}` } }),
          myFetch(`${API}/api/users/get`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const lData = lRes.ok ? await lRes.json() : [];
        const uData = uRes.ok ? await uRes.json() : [];
        setLogs(lData || []);
        setUsers(uData || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const userMap = useMemo(() => {
    const m = {};
    users.forEach(u => { m[u.userId] = u; });
    return m;
  }, [users]);

  const actionTypes = useMemo(() => {
    const set = new Set(logs.map(l => l.action).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [logs]);

  const applyFilters = (list) => {
    let r = [...list];
    if (actionFilter !== "All") r = r.filter(l => l.action === actionFilter);
    r.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortOrder === "Newest" ? db - da : da - db;
    });
    return r;
  };

  const filteredLogs = useMemo(() => applyFilters(logs), [logs, actionFilter, sortOrder]);
  const userLogs = useMemo(
    () => selectedUser ? applyFilters(logs.filter(l => l.userId === selectedUser.userId)) : [],
    [selectedUser, logs, actionFilter, sortOrder]
  );

  const formatDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    return date.toLocaleString(undefined, {
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  };

  const actionColor = (a) => {
    if (!a) return styles.actionDefault;
    if (a.includes("LOGIN") || a.includes("REGISTER") || a.includes("LOGOUT")) return styles.actionAuth;
    if (a.includes("CART") || a.includes("ORDER")) return styles.actionCart;
    if (a.includes("WISHLIST") || a.includes("REVIEW")) return styles.actionEngage;
    if (a.includes("CHATBOT") || a.includes("AR")) return styles.actionFeature;
    return styles.actionDefault;
  };

  if (loading) return <div className={styles.loading}>Loading logs...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.headerBar}>
        <h2 className={styles.title}>Activity Logs</h2>
        <div className={styles.viewToggle}>
          <button
            className={view === "logs" ? styles.toggleActive : ""}
            onClick={() => setView("logs")}>
            <ClipboardList size={16} /> All Logs
          </button>
          <button
            className={view === "users" ? styles.toggleActive : ""}
            onClick={() => setView("users")}>
            <UsersIcon size={16} /> By User
          </button>
        </div>
      </div>

      {view === "logs" && (
        <>
          <div className={styles.filters}>
            <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
              {actionTypes.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
              <option value="Newest">Newest first</option>
              <option value="Oldest">Oldest first</option>
            </select>
            <span className={styles.countBadge}>{filteredLogs.length} logs</span>
          </div>

          <div className={styles.logsList}>
            {filteredLogs.length === 0 ? (
              <p className={styles.empty}>No logs match this filter.</p>
            ) : filteredLogs.map(log => (
              <div
                key={log.id}
                className={styles.logRow}
                onClick={() => setSelectedLog(log)}>
                <span className={`${styles.actionBadge} ${actionColor(log.action)}`}>
                  {log.action}
                </span>
                <span className={styles.logUser}>
                  {userMap[log.userId]?.userName || `User #${log.userId}`}
                </span>
                <span className={styles.logDetails}>{log.details}</span>
                <span className={styles.logDate}>{formatDate(log.createdAt)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {view === "users" && (
        <div className={styles.usersGrid}>
          {users.map(u => {
            const count = logs.filter(l => l.userId === u.userId).length;
            return (
              <div
                key={u.userId}
                className={styles.userCard}
                onClick={() => setSelectedUser(u)}>
                <img
                  src={u.userImage}
                  alt={u.userName}
                  className={styles.userAvatar}
                  onError={(e) => { e.target.src = "/default-avatar.png"; }}
                />
                <div className={styles.userInfo}>
                  <h3>{u.userName}</h3>
                  <p>{u.userEmail}</p>
                  <span className={styles.userCount}>{count} actions</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* User-logs popup */}
      {selectedUser && (
      <div className={styles.overlay} onClick={() => setSelectedUser(null)}>
        <div className={`${styles.modal} ${styles.modalLarge}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{selectedUser.userName}'s Activity</h3>
              <button className={styles.closeBtn} onClick={() => setSelectedUser(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.filters}>
              <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
                {actionTypes.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="Newest">Newest first</option>
                <option value="Oldest">Oldest first</option>
              </select>
              <span className={styles.countBadge}>{userLogs.length} logs</span>
            </div>
            <div className={styles.userLogsList}>
              {userLogs.length === 0 ? (
                <p className={styles.empty}>No actions match this filter.</p>
              ) : userLogs.map(log => (
                <div
                  key={log.id}
                  className={styles.userLogItem}
                  onClick={() => setSelectedLog(log)}>
                  <div className={styles.userLogTop}>
                    <span className={`${styles.actionBadge} ${actionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className={styles.logDate}>{formatDate(log.createdAt)}</span>
                  </div>
                  <p className={styles.logDetails}>{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Single log details */}
      {selectedLog && (
        <div className={styles.overlay} onClick={() => setSelectedLog(null)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Log #{selectedLog.id}</h3>
              <button className={styles.closeBtn} onClick={() => setSelectedLog(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <strong>Action</strong>
                <span className={`${styles.actionBadge} ${actionColor(selectedLog.action)}`}>
                  {selectedLog.action}
                </span>
              </div>
              <div className={styles.detailRow}>
                <strong>User</strong>
                <span>{userMap[selectedLog.userId]?.userName || "—"} (#{selectedLog.userId})</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Time</strong>
                <span>{formatDate(selectedLog.createdAt)}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Details</strong>
                <p className={styles.detailsBlock}>{selectedLog.details || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsView;