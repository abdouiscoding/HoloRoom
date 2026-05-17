import React from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

const Header = ({ role, changeRole, onMenuClick }) => {
  const navigate = useNavigate();

  return (
    <header className={styles.headerContainer}>
      <button className={styles.menuBtn} onClick={onMenuClick}>
        <Menu size={22} />
      </button>

      <div className={styles.headerRight}>
        <div className={styles.roleSwitcher}>
          <label>Role:</label>
          <label>{localStorage.getItem("role")}</label>
        </div>

        <div className={styles.profileSection} onClick={() => navigate('/profile')}>
          <div className={styles.avatar}>
            <img className={styles.avatar} src={localStorage.getItem("userImage")} />
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{localStorage.getItem("userName")}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;