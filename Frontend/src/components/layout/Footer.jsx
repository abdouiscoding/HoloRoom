import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Globe, Mail, MessageCircle, Share2 } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        <div className={styles.brandCol}>
          <Link to="/" className={styles.logo}>
            <Box className={styles.logoIcon} />
            <span className="text-gradient">HoloRoom</span>
          </Link>
          <p className={styles.brandDesc}>
            Experience the future of retail. Try before you buy with our immersive Augmented Reality platform.
          </p>
          <div className={styles.socials}>
            <a href="#" className={styles.socialLink}><Globe size={20} /></a>
            <a href="#" className={styles.socialLink}><Mail size={20} /></a>
            <a href="#" className={styles.socialLink}><MessageCircle size={20} /></a>
            <a href="#" className={styles.socialLink}><Share2 size={20} /></a>
          </div>
        </div>
        
        <div className={styles.linkCol}>
          <h3>Shop</h3>
          <ul>
            <li><Link to="/shop">New Arrivals</Link></li>
            <li><Link to="/shop">Furniture</Link></li>
            <li><Link to="/shop">Decor</Link></li>
            <li><Link to="/shop">Accessories</Link></li>
          </ul>
        </div>

        <div className={styles.linkCol}>
          <h3>Support</h3>
          <ul>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/shipping">Shipping & Returns</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/ar-help">AR Guide</Link></li>
          </ul>
        </div>
        
        <div className={styles.linkCol}>
          <h3>Legal</h3>
          <ul>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/cookies">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} HoloRoom. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
