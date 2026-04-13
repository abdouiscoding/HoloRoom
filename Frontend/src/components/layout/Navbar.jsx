import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, User, Box } from 'lucide-react';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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
        
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <Box className={styles.logoIcon} />
          <span className="text-gradient">HoloRoom</span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className={styles.desktopNav}>
          <Link to="/" className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}>Home</Link>
          <Link to="/shop" className={`${styles.navLink} ${location.pathname.startsWith('/shop') ? styles.active : ''}`}>Shop</Link>
          <Link to="/categories" className={styles.navLink}>Categories</Link>
          <Link to="/about" className={styles.navLink}>About</Link>
        </nav>

        {/* Action Icons */}
        <div className={styles.actionIcons}>
          <button className={styles.iconBtn} aria-label="Search">
            <Search size={20} />
          </button>
          <button className={styles.iconBtn} aria-label="Profile">
            <User size={20} />
          </button>
          <button className={styles.iconBtn} aria-label="Cart">
            <ShoppingBag size={20} />
            <span className={styles.cartBadge}>2</span>
          </button>
          
          <button 
            className={styles.mobileMenuToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
