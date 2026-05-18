import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import Header from '../../components/dashboard/Header';
import OverviewView from './views/OverviewView';
import ProductsManagerView from './views/ProductsManagerView';
import MarketingView from './views/MarketingView';
import UsersManagerView from './views/UsersManagerView';
import FeaturedManagerView from './views/FeaturedManagerView';
import ARManagerView from './views/ARManagerView';
import SupportManagerView from './views/SupportManagerView';
import styles from './DashboardLayout.module.css';

// ===============================
// TOKEN CHECK
// ===============================
const checkTokenExpiration = (onExpire) => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;

    if (Date.now() > exp) {
      onExpire();
    }
  } catch {
    onExpire();
  }
};

// ===============================
// ROLE PERMISSIONS
// ===============================
import LogsView from './views/LogsView';

const rolePermissions = {
  ADMIN: ["overview", "users", "products", "ar", "marketing", "featured", "support", "logs"],
  PRODUCT_MANAGER: ["products", "ar"],
  MARKETING_MANAGER: ["marketing", "featured"],
  SUPPORT_MANAGER: ["support"],
  USER: []
};

const DashboardLayout = () => {
  const [showSessionPopup, setShowSessionPopup] = useState(false);
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 992);

  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState(localStorage.getItem("role"));
  const permissions = rolePermissions[role] || [];

  const changeRole = (newRole) => { 
    localStorage.setItem("role", newRole);
    setRole(newRole); 

    if (newRole === "ADMIN") navigate("/dashboard/overview", { replace: true });
    else if (newRole === "PRODUCT_MANAGER") navigate("/dashboard/products", { replace: true });
    else if (newRole === "MARKETING_MANAGER") navigate("/dashboard/marketing", { replace: true });
    else if (newRole === "SUPPORT_MANAGER") navigate("/dashboard/support", { replace: true });
    else navigate("/login", { replace: true });
  };

  // ===============================
  // SESSION EXPIRE
  // ===============================
  const handleExpire = () => {
    setShowSessionPopup(prev => {
      if (prev) return prev;
      localStorage.clear();
      return true;
    });
  };

  // ===============================
  // TOKEN CHECK LOOP
  // ===============================
  useEffect(() => {
    if (!localStorage.getItem("loggedin")) return;

    checkTokenExpiration(handleExpire);

    const interval = setInterval(() => {
      checkTokenExpiration(handleExpire);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // ===============================
  // ROUTE PROTECTION
  // ===============================
  useEffect(() => {
    if (!role) {
      navigate('/login');
      return;
    }

    const path = location.pathname.split('/').pop();

    if (path === 'dashboard' || path === '') {
      if (permissions.includes("overview")) navigate('/dashboard/overview', { replace: true });
      else if (permissions.includes("products")) navigate('/dashboard/products', { replace: true });
      else if (permissions.includes("marketing")) navigate('/dashboard/marketing', { replace: true });
      else navigate('/login');
      return;
    }

    const isAllowed = permissions.some(p => path.includes(p));

    if (!isAllowed) {
      if (permissions.includes("overview")) navigate('/dashboard/overview', { replace: true });
      else if (permissions.includes("products")) navigate('/dashboard/products', { replace: true });
      else if (permissions.includes("marketing")) navigate('/dashboard/marketing', { replace: true });
      else navigate('/login');
    }
  }, [location.pathname, role]);

  return (
    <>
      {/* SESSION POPUP */}
      {showSessionPopup && (
        <div style={popupStyles.overlay}>
          <div style={popupStyles.card}>
            <h2>Session expired</h2>
            <p>Please login again to continue</p>

            <div style={popupStyles.actions}>
              <button
                style={popupStyles.loginBtn}
                onClick={() => {
                  setShowSessionPopup(false);
                  navigate('/login');
                }}
              >
                Login
              </button>

              <button
                style={popupStyles.laterBtn}
                onClick={() => setShowSessionPopup(false)}
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MAIN LAYOUT */}
      <div className={styles.dashboardContainer}>

        <Sidebar
          role={role}
          permissions={permissions}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <div className={styles.mainContent}>
          <Header
            role={role}
            changeRole={changeRole}
            onMenuClick={() => setCollapsed(c => !c)}
          />

          <div className={styles.pageContent}>
            <Routes>
              {permissions.includes("overview") && (
                <Route path="overview" element={<OverviewView />} />
              )}

              {permissions.includes("products") && (
                <Route path="products" element={<ProductsManagerView />} />
              )}

              {permissions.includes("users") && (
                <Route path="users" element={<UsersManagerView />} />
              )}

              {permissions.includes("logs") && (
                <Route path="logs" element={<LogsView />} />
              )}

              {permissions.includes("ar") && (
                <Route path="ar" element={<ARManagerView />} />
              )}

              {permissions.includes("marketing") && (
                <Route path="marketing" element={<MarketingView />} />
              )}

              {permissions.includes("featured") && (
                <Route path="featured" element={<FeaturedManagerView />} />
              )}

              {permissions.includes("support") && (
                <Route path="support" element={<SupportManagerView />} />
              )}
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;

// ===============================
// POPUP STYLES
// ===============================
const popupStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  card: {
    background: "#111827",
    color: "white",
    padding: "25px",
    borderRadius: "12px",
    width: "320px",
    textAlign: "center",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
  },
  actions: {
    marginTop: "20px",
    display: "flex",
    gap: "10px",
  },
  loginBtn: {
    flex: 1,
    padding: "10px",
    background: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
  },
  laterBtn: {
    flex: 1,
    padding: "10px",
    background: "#374151",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
  },
};