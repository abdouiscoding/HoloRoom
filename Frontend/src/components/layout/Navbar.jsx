import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, User, Box } from 'lucide-react';
import styles from './Navbar.module.css';
import { useCart } from '../../context/CartContext';

const Navbar = ({ onMenuToggle }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.navContainer}`}>

        <div className={styles.leftSection}>
          {/* Sidebar Toggle */ }
          <button className={styles.sidebarBtn} onClick={onMenuToggle} aria-label="Toggle Sidebar">
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <Box className={styles.logoIcon} />
            <span className="text-gradient">HoloRoom</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className={styles.desktopNav}>
          <Link to="/" className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}>Home</Link>
          <Link to="/shop" className={`${styles.navLink} ${location.pathname.startsWith('/shop') ? styles.active : ''}`}>Shop</Link>
          <Link to="/categories" className={styles.navLink}>Categories</Link>
          <Link to="/about" className={styles.navLink}>About</Link>
        </nav>

        {/* Action Icons */}
        <div className={styles.actionIcons}>
          <div className={styles.searchContainer}>
            {searchOpen ? (
              <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button type="button" className={styles.closeSearchBtn} onClick={() => setSearchOpen(false)}>
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button
                className={styles.iconBtn}
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
              >
                <Search size={20} />
              </button>
            )}
          </div>
          <button className={styles.iconBtn} aria-label="Profile" onClick={() => navigate('/login')}>
            <User size={20} />
          </button>
          <button className={styles.iconBtn} aria-label="Cart" onClick={() => navigate('/cart')}>
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className={styles.mobileNavOverlay}>
          <nav className={styles.mobileNav}>
            <Link to="/" className={styles.mobileNavLink}>Home</Link>
            <Link to="/shop" className={styles.mobileNavLink}>Shop</Link>
            <Link to="/categories" className={styles.mobileNavLink}>Categories</Link>
            <Link to="/about" className={styles.mobileNavLink}>About</Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;