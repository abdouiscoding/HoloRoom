import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Box, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';
import { useCart } from '../../context/CartContext';

// ===============================
// SAFE TOKEN CHECK
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
  } catch (e) {
    // invalid token → treat as expired
    onExpire();
  }
};

const Navbar = ({ onMenuToggle }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSessionPopup, setShowSessionPopup] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  // ===============================
  // SESSION EXPIRE HANDLER
  // ===============================
  const handleExpire = () => {
    // prevent spam popup
    if (showSessionPopup) return;

    localStorage.clear();
    setShowSessionPopup(true);
  };

  // ===============================
  // EFFECTS
  // ===============================
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    // only check if logged in
    let interval;
    if (localStorage.getItem("loggedin")) {
      interval = setInterval(() => {
        checkTokenExpiration(handleExpire);
      }, 10000);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (interval) clearInterval(interval);
    };
  }, [showSessionPopup]);

  // close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // ===============================
  // NAV ACTIONS
  // ===============================
  const handleProfile = () => {
    if (localStorage.getItem('token')) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  const handleCart = () => {
    if (localStorage.getItem('token')) {
      navigate('/cart');
    } else {
      navigate('/login');
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <>
      {/* ================= SESSION POPUP ================= */}
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

      {/* ================= NAVBAR ================= */}
      <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.navContainer}`}>

          <div className={styles.leftSection}>
            <Link to="/" className={styles.logo}>
              <Box className={styles.logoIcon} />
              <span className="text-gradient">HoloRoom</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className={styles.desktopNav}>
            <Link to="/" className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}>Home</Link>
            <Link to="/shop" className={`${styles.navLink} ${location.pathname.startsWith('/shop') ? styles.active : ''}`}>Shop</Link>
            <Link to="/support" className={`${styles.navLink} ${location.pathname === '/support' ? styles.active : ''}`}>Support</Link>
          </nav>

          {/* Icons */}
          <div className={styles.actionIcons}>
            <button className={styles.iconBtn} onClick={handleProfile}>
              <User size={20} />
            </button>
            <button className={styles.iconBtn} onClick={handleCart}>
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </button>
            <button
              className={`${styles.iconBtn} ${styles.hamburgerBtn}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className={styles.mobileNavOverlay}>
            <nav className={styles.mobileNav}>
              <Link to="/" className={styles.mobileNavLink}>Home</Link>
              <Link to="/shop" className={styles.mobileNavLink}>Shop</Link>
              <Link to="/support" className={styles.mobileNavLink}>Support</Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;

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