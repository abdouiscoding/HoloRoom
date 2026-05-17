import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Globe, MessageCircle, Share2, Mail, MapPin } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  const toprofile = () => {
    if (!localStorage.getItem('loggedin')) {
      window.location.href = '/login';
    } else {
      window.location.href = '/profile';
    }
  };
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        <div className={styles.brandCol}>
          <Link to="/" className={styles.logo}>
            <Box className={styles.logoIcon} />
            <span className="text-gradient">HoloRoom</span>
          </Link>
          <p className={styles.brandDesc}>
            Furniture, tried before bought. Preview products in your real room with AR
            before you commit.
          </p>
          <div className={styles.socials}>
            <a href="#" aria-label="Share" className={styles.socialLink}><Share2 size={18} /></a>
            <a href="#" aria-label="Message" className={styles.socialLink}><MessageCircle size={18} /></a>
          </div>
        </div>

        <div className={styles.linkCol}>
          <h3>Explore</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/profile" onClick={toprofile}>
              My Account
            </Link></li>
            <li><Link to="/cart">Cart</Link></li>
          </ul>
        </div>

        <div className={styles.linkCol}>
          <h3>Help</h3>
          <ul>
            <li><Link to="/support">Contact Support</Link></li>
            <li><Link to="/support">Report a Bug</Link></li>
            <li><Link to="/support">Order Issues</Link></li>
          </ul>
        </div>

        <div className={styles.linkCol}>
          <h3>Get in touch</h3>
          <ul className={styles.contactList}>
            <li><Mail size={14} /> support@holoroom.app</li>
            <li><MapPin size={14} /> Algeria</li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} HoloRoom. All rights reserved.</p>
          <p className={styles.footerBy}>Built by Ayoub Guermache, Abderrahim Ferdi, and Anis Ben Abderrahmane.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;