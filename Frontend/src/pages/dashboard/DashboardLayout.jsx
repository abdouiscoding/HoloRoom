import React, { useState, useEffect, useMemo } from 'react';
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
import OrdersManagerView from './views/OrdersManagerView';
import styles from './DashboardLayout.module.css';
import { readDashboardSession } from '../../services/dashboardSessionAdapter';
import { createDashboardAccess, isDashboardRole } from './dashboardAccess';

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

import LogsView from './views/LogsView';

const DashboardLayout = () => {
  const [showSessionPopup, setShowSessionPopup] = useState(false);
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 992);
  const [role, setRole] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const access = useMemo(() => createDashboardAccess(role), [role]);
  const permissions = access.permissions;

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

  useEffect(() => {
    checkTokenExpiration(handleExpire);
    const interval = setInterval(() => checkTokenExpiration(handleExpire), 10000);
    return () => clearInterval(interval);
  }, []);

  // ===============================
  // Behavioral pattern — Observer: re-verify when another tab changes the active token.
  // ===============================
  useEffect(() => {
    let active = true;
    let verificationId = 0;

    const verifySession = async () => {
      const currentVerificationId = ++verificationId;
      setIsSessionLoading(true);
      setSessionError(false);

      try {
        const session = await readDashboardSession();
        if (!active || currentVerificationId !== verificationId) return;

        if (!session || !isDashboardRole(session.role)) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("loggedin");
          setRole(null);
          setIsSessionLoading(false);
          navigate("/login", { replace: true });
          return;
        }

        setRole(session.role);
        setIsSessionLoading(false);
      } catch (error) {
        console.error(error);
        if (!active || currentVerificationId !== verificationId) return;
        setRole(null);
        setSessionError(true);
        setIsSessionLoading(false);
      }
    };

    const onStorageChange = (event) => {
      if (event.key === "token") verifySession();
    };

    verifySession();
    window.addEventListener("storage", onStorageChange);

    return () => {
      active = false;
      window.removeEventListener("storage", onStorageChange);
    };
  }, [navigate]);

  // ===============================
  // ROUTE PROTECTION
  // ===============================
  useEffect(() => {
    if (isSessionLoading || sessionError) return;

    if (!role) {
      navigate('/login', { replace: true });
      return;
    }

    const path = location.pathname.split('/').pop();

    if (path === 'dashboard' || path === '') {
      if (access.defaultRoute) navigate(access.defaultRoute, { replace: true });
      else navigate('/login', { replace: true });
      return;
    }

    if (!access.canAccess(path)) {
      if (access.defaultRoute) navigate(access.defaultRoute, { replace: true });
      else navigate('/login', { replace: true });
    }
  }, [location.pathname, role, isSessionLoading, sessionError, navigate, access]);

  if (isSessionLoading) {
    return <div className={styles.pageContent}>Verifying dashboard access...</div>;
  }

  if (sessionError) {
    return (
      <div className={styles.pageContent}>
        <p>Unable to verify dashboard access. Please try again.</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!role) return null;

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

              {permissions.includes("orders") && (
                <Route path="orders" element={<OrdersManagerView />} />
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